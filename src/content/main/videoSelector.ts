import type { VideoContext } from './types';
import { getVideoContext } from './dom';

let LAST_ACTIVE_VIDEO: HTMLVideoElement | null = null;

function getArea(rect: DOMRect): number {
  const w = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
  const h = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return Math.max(0, w) * Math.max(0, h);
}

function getVisibility(rect: DOMRect): number {
  const maxArea = Math.max(1, rect.width * rect.height);
  return Math.min(1, getArea(rect) / maxArea);
}

function getArticleRect(video: HTMLVideoElement): DOMRect | null {
  const article = video.closest('article');
  return article instanceof HTMLElement ? article.getBoundingClientRect() : null;
}

function isSuggested(video: HTMLVideoElement): boolean {
  const article = video.closest('article');
  if (!(article instanceof HTMLElement)) return false;
  const text = article.textContent?.toLowerCase() ?? '';
  return text.includes('suggested for you') || text.includes('sponsored');
}

export function isValidTarget(video: HTMLVideoElement, context: VideoContext): boolean {
  if (!video.isConnected) return false;
  const rect = video.getBoundingClientRect();
  const area = getArea(rect);
  const winArea = window.innerWidth * window.innerHeight;

  if (context === 'story-viewer') {
    if (rect.width < 180 || rect.height < 280) return false;
    return area >= winArea * 0.08;
  } else if (context === 'reel-viewer') {
    if (rect.width < 120 || rect.height < 120) return false;
    return area >= winArea * 0.02;
  } else if (context === 'feed-carousel' || context === 'feed-inline') {
    if (rect.width < 180 || rect.height < 180) return false;
    return area >= winArea * 0.03;
  }
  return false;
}

function getRank(video: HTMLVideoElement, context: VideoContext): number {
  const rect = video.getBoundingClientRect();
  const area = getArea(rect);
  const visibility = getVisibility(rect);
  
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = cx - window.innerWidth / 2;
  const dy = cy - window.innerHeight / 2;
  const dist = Math.hypot(dx, dy);

  const isFeed = context === 'feed-inline' || context === 'feed-carousel';
  const pausedPenalty = (!isFeed && !video.paused) ? 150000 : 0;
  const contextBonus = context === 'story-viewer' ? 120000 : context === 'reel-viewer' ? 80000 : 0;

  if (isFeed) {
    const articleRect = getArticleRect(video) ?? rect;
    const acy = articleRect.top + articleRect.height / 2;
    const distY = Math.abs(acy - window.innerHeight / 2);
    
    const centerBonus = (articleRect.top < window.innerHeight * 0.78 && articleRect.bottom > window.innerHeight * 0.22) ? 65000 : 0;
    const suggestedPenalty = isSuggested(video) ? 35000 : 0;
    const readyBonus = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? 25000 : 0;
    
    return (area * 0.45) + (visibility * 350000) + centerBonus + suggestedPenalty + readyBonus - (dist * 1.4) - (distY * 1.2);
  }
  return area + pausedPenalty + contextBonus - dist;
}

function getBestVideo(videos: HTMLVideoElement[], rankFunc: (v: HTMLVideoElement, c: VideoContext) => number): HTMLVideoElement | null {
  let best: HTMLVideoElement | null = null;
  let maxRank = -1;
  for (const v of videos) {
    const ctx = getVideoContext(v);
    if (!isValidTarget(v, ctx)) continue;
    const rank = rankFunc(v, ctx);
    if (rank > maxRank) {
      maxRank = rank;
      best = v;
    }
  }
  return best;
}

export function getActiveVideo(videos: HTMLVideoElement[]): HTMLVideoElement | null {
  const best = getBestVideo(videos, getRank);
  if (!best) return null;
  
  if (location.pathname === '/') {
    // Stickiness logic for home feed
    if (LAST_ACTIVE_VIDEO && LAST_ACTIVE_VIDEO.isConnected) {
      const ctx = getVideoContext(LAST_ACTIVE_VIDEO);
      if (isValidTarget(LAST_ACTIVE_VIDEO, ctx)) {
        const lastRank = getRank(LAST_ACTIVE_VIDEO, ctx);
        const bestRank = getRank(best, getVideoContext(best));
        if (best !== LAST_ACTIVE_VIDEO && bestRank < lastRank * 1.2) {
          return LAST_ACTIVE_VIDEO;
        }
      }
    }
    LAST_ACTIVE_VIDEO = best;
  }
  return best;
}

export function getGlobalActiveVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll(`video[data-reels-scrubber-active]`)) as HTMLVideoElement[];
  if (videos.length === 0) return null;
  return getActiveVideo(videos) ?? videos[0];
}

export function isHomeFeedMainVideo(video: HTMLVideoElement): boolean {
  if (location.pathname !== '/') return false;
  const ctx = getVideoContext(video);
  if (ctx !== 'feed-inline' && ctx !== 'feed-carousel') return false;
  return getVisibility(video.getBoundingClientRect()) >= 0.12;
}

export function getGroupToPatch(videos: HTMLVideoElement[]): HTMLVideoElement[] {
  const active = getActiveVideo(videos);
  if (!active) return [];
  if (location.pathname !== '/') return [active];

  let bestSibling: HTMLVideoElement | null = null;
  let maxRank = -1;
  const activeRank = getRank(active, getVideoContext(active));
  
  for (const v of videos) {
    if (v === active) continue;
    const ctx = getVideoContext(v);
    if (ctx !== 'feed-inline' && ctx !== 'feed-carousel') continue;
    if (!isValidTarget(v, ctx)) continue;
    const rank = getRank(v, ctx);
    if (rank > maxRank) {
      maxRank = rank;
      bestSibling = v;
    }
  }

  const patchSet = new Set<HTMLVideoElement>([active]);
  if (bestSibling && maxRank >= activeRank * 0.55) {
    patchSet.add(bestSibling);
  }

  for (const v of videos) {
    if (patchSet.has(v)) continue;
    const ctx = getVideoContext(v);
    if ((ctx === 'feed-inline' || ctx === 'feed-carousel') && isSuggested(v) && isValidTarget(v, ctx)) {
      patchSet.add(v);
    }
  }
  return Array.from(patchSet);
}
