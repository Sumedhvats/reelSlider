import { DOM_ATTRIBUTES, MESSAGES } from '../../utils/constants';
import { log } from './logger';
import { getVideoContext } from './dom';

// Icons sized at 24px with 1.5 stroke to match Instagram's native action bar icons
const DOWNLOAD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

const SPINNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="reels-dl-spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

/**
 * Extract the Instagram shortcode from the current URL path or DOM.
 * Works for /reel/<code>/, /reels/<code>/, /p/<code>/, /<user>/reel/<code>/
 */
function getMediaIdentifier(video?: HTMLVideoElement): string | null {
  const m = location.pathname.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];

  const s = location.pathname.match(/\/stories\/[^\/]+\/(\d+)/);
  if (s) return s[1];

  if (video) {
    const article = video.closest('article');
    if (article) {
      const links = article.querySelectorAll('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
      for (const link of Array.from(links)) {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
          if (match) return match[1];
        }
      }
    }
  }

  return null;
}

/**
 * Build a filename for the download.
 * Format: instagram_<shortcode>_<timestamp>.mp4
 */
function buildFilename(video?: HTMLVideoElement): string {
  const code = getMediaIdentifier(video);
  const ts = Date.now();
  if (code) return `instagram_${code}_${ts}.mp4`;
  return `instagram_video_${ts}.mp4`;
}

/**
 * Walk up a React fiber tree looking for a media URL in component props.
 */
function extractFromReactFiber(element: HTMLElement): string | null {
  // Find React fiber key on the DOM element or its ancestors (up to 15 levels)
  let curr: HTMLElement | null = element;
  let fiberKey = undefined;
  
  for (let i = 0; i < 15 && curr; i++) {
    fiberKey = Object.keys(curr).find(
      (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    if (fiberKey) break;
    curr = curr.parentElement;
  }
  
  if (!fiberKey || !curr) return null;

  let fiber = (curr as any)[fiberKey];
  // Walk up the fiber tree (max 30 levels) looking for video URL data
  for (let i = 0; i < 30 && fiber; i++) {
    const props = fiber.memoizedProps || fiber.pendingProps;
    if (props) {
      // Direct video_url property (Instagram's internal format)
      if (typeof props.video_url === 'string' && props.video_url.startsWith('http')) {
        return props.video_url;
      }
      if (typeof props.videoUrl === 'string' && props.videoUrl.startsWith('http')) {
        return props.videoUrl;
      }
      if (typeof props.display_url === 'string' && props.display_url.startsWith('http')) {
        return props.display_url;
      }
      // video_versions array (Instagram API format: [{url, width, height}, ...])
      if (Array.isArray(props.video_versions) && props.video_versions.length > 0) {
        const best = props.video_versions[0];
        if (best?.url && typeof best.url === 'string') return best.url;
      }
      if (props.image_versions2?.candidates && Array.isArray(props.image_versions2.candidates) && props.image_versions2.candidates.length > 0) {
        const best = props.image_versions2.candidates[0];
        if (best?.url && typeof best.url === 'string') return best.url;
      }
      // src prop if not blob
      if (typeof props.src === 'string' && props.src.startsWith('http') && !props.src.startsWith('blob:')) {
        return props.src;
      }
      // Nested media object (e.g. props.post.video_url or props.media.video_url)
      for (const key of ['post', 'media', 'clip', 'item', 'node', 'reel']) {
        const nested = props[key];
        if (nested && typeof nested === 'object') {
          if (typeof nested.video_url === 'string' && nested.video_url.startsWith('http')) {
            return nested.video_url;
          }
          if (typeof nested.display_url === 'string' && nested.display_url.startsWith('http')) {
            return nested.display_url;
          }
          if (Array.isArray(nested.video_versions) && nested.video_versions.length > 0) {
            const best = nested.video_versions[0];
            if (best?.url && typeof best.url === 'string') return best.url;
          }
        }
      }
    }

    // Also check stateNode for class components
    if (fiber.stateNode && fiber.stateNode !== element && typeof fiber.stateNode === 'object') {
      const state = fiber.stateNode.state || fiber.stateNode;
      if (state && typeof state.video_url === 'string' && state.video_url.startsWith('http')) {
        return state.video_url;
      }
      if (state && typeof state.display_url === 'string' && state.display_url.startsWith('http')) {
        return state.display_url;
      }
    }

    fiber = fiber.return;
  }
  return null;
}

/**
 * Deep-scan an object (up to a depth limit) for a media URL string.
 * Used to search through Instagram's embedded data structures.
 */
function deepFindMediaUrl(obj: any, depth: number = 0, maxDepth: number = 8): string | null {
  if (depth > maxDepth || !obj || typeof obj !== 'object') return null;

  // Direct properties first
  if (typeof obj.video_url === 'string' && obj.video_url.startsWith('http')) {
    return obj.video_url;
  }
  if (typeof obj.display_url === 'string' && obj.display_url.startsWith('http')) {
    return obj.display_url;
  }
  if (Array.isArray(obj.video_versions) && obj.video_versions.length > 0) {
    const best = obj.video_versions[0];
    if (best?.url && typeof best.url === 'string') return best.url;
  }
  if (obj.image_versions2?.candidates && Array.isArray(obj.image_versions2.candidates) && obj.image_versions2.candidates.length > 0) {
    const best = obj.image_versions2.candidates[0];
    if (best?.url && typeof best.url === 'string') return best.url;
  }

  // Recurse into known keys that carry media data
  const interestingKeys = [
    'items', 'media', 'clip', 'node', 'shortcode_media', 'graphql',
    'data', 'xdt_shortcode_media', 'video', 'edges', 'edge_media_to_video',
    'carousel_media', 'image_versions2'
  ];
  for (const key of interestingKeys) {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        for (const item of obj[key]) {
          const found = deepFindMediaUrl(item, depth + 1, maxDepth);
          if (found) return found;
        }
      } else {
        const found = deepFindMediaUrl(obj[key], depth + 1, maxDepth);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Convert an Instagram shortcode to a numeric media ID.
 * Instagram uses a base64-like encoding for shortcodes.
 */
function shortcodeToMediaId(shortcodeOrId: string): string {
  if (/^\d+$/.test(shortcodeOrId)) return shortcodeOrId; // Already a media ID
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = BigInt(0);
  for (const ch of shortcodeOrId) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) continue;
    id = id * BigInt(64) + BigInt(idx);
  }
  return id.toString();
}

/**
 * Fetch the video URL from Instagram's API using the media shortcode.
 * Since we're in MAIN world on instagram.com, this is a same-origin request.
 */
async function fetchVideoUrlFromApi(shortcode: string): Promise<string | null> {
  // Try the /api/v1/media endpoint first (uses numeric media ID)
  try {
    const mediaId = shortcodeToMediaId(shortcode);
    const resp = await fetch(`https://www.instagram.com/api/v1/media/${mediaId}/info/`, {
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-IG-App-ID': '936619743392459', // Instagram web app ID (public)
      },
    });
    if (resp.ok) {
      const data = await resp.json();
      const url = deepFindMediaUrl(data);
      if (url) return url;
    }
  } catch {}

  // Fallback: try the graphql query endpoint
  try {
    const resp = await fetch(
      `https://www.instagram.com/api/v1/media/${shortcodeToMediaId(shortcode)}/info/`,
      { credentials: 'include' }
    );
    if (resp.ok) {
      const data = await resp.json();
      const url = deepFindMediaUrl(data);
      if (url) return url;
    }
  } catch {}

  // Fallback: try __a=1 endpoint
  try {
    const resp = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (resp.ok) {
      const data = await resp.json();
      const url = deepFindMediaUrl(data);
      if (url) return url;
    }
  } catch {}

  return null;
}

/**
 * Try to extract the actual CDN video URL using multiple strategies.
 * Ordered from fastest/most reliable to slowest/fallback.
 */
async function extractVideoUrl(video: HTMLVideoElement): Promise<string | null> {
  // Strategy 1: React fiber traversal (fastest, most reliable in MAIN world)
  const fiberUrl = extractFromReactFiber(video);
  if (fiberUrl) {
    log('info', 'Download URL found via React fiber');
    return fiberUrl;
  }

  // Strategy 2: video src if it's a direct URL (not blob)
  if (video.src && !video.src.startsWith('blob:')) {
    return video.src;
  }

  // Strategy 3: source elements
  const source = video.querySelector('source');
  if (source) {
    const src = source.getAttribute('src');
    if (src && !src.startsWith('blob:') && src.startsWith('http')) {
      return src;
    }
  }

  // Strategy 4: og:video meta tags
  for (const prop of ['og:video', 'og:video:secure_url']) {
    const meta = document.querySelector(`meta[property="${prop}"]`);
    if (meta) {
      const content = meta.getAttribute('content');
      if (content && content.startsWith('http')) return content;
    }
  }

  // Strategy 5: JSON-LD structured data
  const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of ldScripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data.contentUrl) return data.contentUrl;
      if (data.video?.contentUrl) return data.video.contentUrl;
    } catch {}
  }

  // Strategy 6: Search inline scripts for CDN video URLs
  try {
    const allScripts = document.querySelectorAll('script:not([src])');
    for (const script of allScripts) {
      const text = script.textContent || '';
      // Look for cdninstagram.com video URLs
      const urlMatch = text.match(/"(https?:\/\/[^"]*?cdninstagram\.com[^"]*?\.mp4[^"]*)"/);
      if (urlMatch) {
        return urlMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
      }
    }
  } catch {}

  // Strategy 7: Instagram window globals (__additionalDataLoaded, etc.)
  try {
    const win = window as any;
    for (const key of ['__additionalDataLoaded', '__initialData', '_sharedData']) {
      if (win[key] && typeof win[key] === 'object') {
        const url = deepFindMediaUrl(win[key]);
        if (url) return url;
      }
    }
  } catch {}

  // Strategy 8: Fetch from Instagram API (async, last resort)
  const identifier = getMediaIdentifier(video);
  if (identifier) {
    log('info', 'Trying Instagram API for download URL...');
    const apiUrl = await fetchVideoUrlFromApi(identifier);
    if (apiUrl) {
      log('info', 'Download URL found via Instagram API');
      return apiUrl;
    }
  }

  return null;
}

/**
 * Request download via postMessage to bridge → background.
 */
function requestDownload(url: string, filename: string) {
  window.postMessage({
    type: MESSAGES.DOWNLOAD_VIDEO,
    payload: { url, filename },
  }, '*');
}

/**
 * Set the button state: idle, loading, success, error.
 */
function setButtonState(btn: HTMLElement, state: 'idle' | 'loading' | 'success' | 'error') {
  btn.classList.remove('reels-dl-loading', 'reels-dl-success', 'reels-dl-error');
  
  switch (state) {
    case 'loading':
      btn.classList.add('reels-dl-loading');
      btn.innerHTML = SPINNER_SVG;
      btn.style.pointerEvents = 'none';
      break;
    case 'success':
      btn.classList.add('reels-dl-success');
      btn.innerHTML = CHECK_SVG;
      btn.style.pointerEvents = 'none';
      setTimeout(() => {
        btn.classList.remove('reels-dl-success');
        btn.innerHTML = DOWNLOAD_ICON_SVG;
        btn.style.pointerEvents = 'auto';
      }, 2000);
      break;
    case 'error':
      btn.classList.add('reels-dl-error');
      btn.innerHTML = DOWNLOAD_ICON_SVG;
      setTimeout(() => {
        btn.classList.remove('reels-dl-error');
        btn.style.pointerEvents = 'auto';
      }, 1500);
      break;
    default:
      btn.innerHTML = DOWNLOAD_ICON_SVG;
      btn.style.pointerEvents = 'auto';
  }
}

/**
 * Handle the download button click.
 */
async function handleDownloadClick(video: HTMLVideoElement, btn: HTMLElement) {
  setButtonState(btn, 'loading');

  const url = await extractVideoUrl(video);
  if (!url) {
    log('warn', 'Could not extract video URL for download');
    setButtonState(btn, 'error');
    return;
  }

  const filename = buildFilename(video);
  
  try {
    requestDownload(url, filename);
    // We can't reliably get confirmation from the background in MAIN world,
    // so we optimistically show success after a short delay
    setTimeout(() => setButtonState(btn, 'success'), 600);
  } catch (err) {
    log('warn', 'Download request failed');
    setButtonState(btn, 'error');
  }
}
function getSinglePostScope(video: HTMLVideoElement, container: HTMLElement): HTMLElement {
  const article = video.closest('article');
  if (article) return article as HTMLElement;

  const dialog = video.closest('[role="dialog"]');
  if (dialog) return dialog as HTMLElement;

  let curr = container.parentElement;
  for (let i = 0; i < 8 && curr && curr !== document.body; i++) {
    const saveBtn = curr.querySelector('svg[aria-label="Save"], svg[aria-label="Remove"], [aria-label="Save"], [aria-label="Remove"]');
    if (saveBtn) return curr;
    curr = curr.parentElement;
  }

  return (container.closest('section') ?? container.closest('[role="presentation"]') ?? container) as HTMLElement;
}

/**
 * Find the correct insertion target in Instagram's action bar.
 * - Reels: the vertical sidebar column (parent of Like, Comment, etc.)
 */
function findActionBar(video: HTMLVideoElement, container: HTMLElement): { target: HTMLElement; position: 'prepend' | 'append' | 'before-horizontal' } | null {
  const context = getVideoContext(video);
  console.log('[ReelSlider] findActionBar context:', context);

  if (context === 'reel-viewer' || context === 'feed-inline' || context === 'feed-carousel') {
    const scope = getSinglePostScope(video, container);

    if (context === 'reel-viewer') {
      // Reels: Vertical sidebar. Insert at the top of the column.
      const likeBtns = scope.querySelectorAll(
        'svg[aria-label="Like"], svg[aria-label="Unlike"], [aria-label="Like"], [aria-label="Unlike"]'
      );
      for (const el of Array.from(likeBtns)) {
        const wrapper = el.closest('button') ?? el.closest('[role="button"]');
        if (wrapper || el.getAttribute('role') === 'button') {
          // Walk up to find the vertical flex column
          let curr = (wrapper ?? el).parentElement;
          for (let i = 0; i < 5 && curr && curr !== scope; i++) {
            if (window.getComputedStyle(curr).flexDirection === 'column') {
              return { target: curr as HTMLElement, position: 'prepend' };
            }
            curr = curr.parentElement;
          }
          // Fallback if column not found: just prepend to the grandparent
          const fallback = (wrapper ?? el).parentElement?.parentElement;
          if (fallback) return { target: fallback as HTMLElement, position: 'prepend' };
        }
      }
    } else {
      // Feed: Horizontal bar. Insert left of the Save button.
      const saveBtns = scope.querySelectorAll(
        'svg[aria-label="Save"], svg[aria-label="Remove"], [aria-label="Save"], [aria-label="Remove"]'
      );
      for (const el of Array.from(saveBtns)) {
        const wrapper = el.closest('button') ?? el.closest('[role="button"]');
        if (wrapper || el.getAttribute('role') === 'button') {
          return { target: (wrapper ?? el) as HTMLElement, position: 'before-horizontal' };
        }
      }
    }
  }

  return null;
}

/**
 * Inject the download button into Instagram's action bar.
 * Works on reels (vertical sidebar) and feed posts (horizontal action row).
 */
export function injectDownloadButton(video: HTMLVideoElement, container: HTMLElement) {
  const context = getVideoContext(video);

  // Skip if it's a story
  if (context === 'story-viewer') return;

  // Don't add duplicates anywhere in the document for this video's scope
  const scope = getSinglePostScope(video, container);
  if (scope.querySelector(`[${DOM_ATTRIBUTES.DOWNLOAD_BUTTON}]`)) return;

  const result = findActionBar(video, container);
  if (!result) return; // Skip if action bar not found

  const btn = document.createElement('div');
  btn.setAttribute(DOM_ATTRIBUTES.DOWNLOAD_BUTTON, 'true');
  btn.className = 'reels-scrubber-download-btn';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.innerHTML = DOWNLOAD_ICON_SVG;
  btn.title = 'Download video';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDownloadClick(video, btn);
  });

  // Prevent clicks from bubbling to Instagram's handlers
  btn.addEventListener('mousedown', (e) => e.stopPropagation());
  btn.addEventListener('mouseup', (e) => e.stopPropagation());

  if (result.position === 'prepend') {
    result.target.prepend(btn);
  } else if (result.position === 'append') {
    result.target.append(btn);
  } else if (result.position === 'before-horizontal') {
    const parent = result.target.parentElement;
    if (parent) {
      parent.insertBefore(btn, result.target);
      // Ensure horizontal alignment works if the parent isn't already a flex row
      if (window.getComputedStyle(parent).display !== 'flex') {
        parent.style.setProperty('display', 'flex', 'important');
        parent.style.setProperty('align-items', 'center', 'important');
      }
      
      btn.style.setProperty('margin-bottom', '0', 'important');
      btn.style.setProperty('margin-right', '16px', 'important'); // spacing before save
    }
  } else {
    result.target.appendChild(btn);
  }
}

/**
 * Remove the download button during rollback.
 */
export function removeDownloadButton(container: HTMLElement | null) {
  if (!container) return;
  // Search broadly — the button might be in the action bar, not the video container
  const scope = container.closest('section') ?? container.closest('[role="presentation"]') ?? container.closest('article') ?? container;
  scope.querySelectorAll(`[${DOM_ATTRIBUTES.DOWNLOAD_BUTTON}]`).forEach((el) => el.remove());
}

async function extractMediaUrl(scope: HTMLElement): Promise<string | null> {
  // Strategy 1: Find visible video and extract its URL
  const videos = Array.from(scope.querySelectorAll('video'));
  let bestVideo: HTMLVideoElement | null = null;
  for (const v of videos) {
    const rect = v.getBoundingClientRect();
    if (rect.left >= -50 && rect.right <= window.innerWidth + 50 && rect.width > 0) {
      bestVideo = v;
      break;
    }
  }
  if (bestVideo) {
    const vUrl = await extractVideoUrl(bestVideo);
    if (vUrl) return vUrl;
  }

  // Strategy 2: Find visible image and extract its URL
  const images = Array.from(scope.querySelectorAll('img'));
  let bestImg: HTMLImageElement | null = null;
  let maxArea = 0;
  
  for (const img of images) {
    if (img.width < 100 || img.height < 100) continue; // skip ui icons
    const rect = img.getBoundingClientRect();
    if (rect.left < -100 || rect.right > window.innerWidth + 100 || rect.width === 0) continue;
    
    const area = rect.width * rect.height;
    if (area > maxArea) {
      maxArea = area;
      bestImg = img;
    }
  }

  if (bestImg) {
    if (bestImg.srcset) {
      const sources = bestImg.srcset.split(',').map(s => {
        const parts = s.trim().split(' ');
        return { url: parts[0], width: parseInt(parts[1] || '0', 10) };
      });
      sources.sort((a, b) => b.width - a.width);
      if (sources.length > 0) return sources[0].url;
    }
    return bestImg.src;
  }
  
  // Strategy 3: Try to find URL in React fiber of the scope
  const fiberUrl = extractFromReactFiber(scope);
  if (fiberUrl) return fiberUrl;
  
  return null;
}

function buildFilenameFromScope(scope: HTMLElement, url: string): string {
  let code: string | null = null;
  const links = scope.querySelectorAll('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
  for (const link of Array.from(links)) {
    const href = link.getAttribute('href');
    if (href) {
      const match = href.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
      if (match) {
        code = match[1];
        break;
      }
    }
  }
  if (!code) {
      const m = location.pathname.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
      if (m) code = m[1];
  }

  const ts = Date.now();
  const ext = url.includes('.mp4') ? 'mp4' : 'jpg';
  if (code) return `instagram_${code}_${ts}.${ext}`;
  return `instagram_media_${ts}.${ext}`;
}

async function handlePostDownloadClick(scope: HTMLElement, btn: HTMLElement) {
  setButtonState(btn, 'loading');

  const url = await extractMediaUrl(scope);
  if (!url) {
    log('warn', 'Could not extract media URL for download');
    setButtonState(btn, 'error');
    return;
  }

  const filename = buildFilenameFromScope(scope, url);
  
  try {
    requestDownload(url, filename);
    setTimeout(() => setButtonState(btn, 'success'), 600);
  } catch (err) {
    log('warn', 'Download request failed');
    setButtonState(btn, 'error');
  }
}

/**
 * Periodically check for and inject download buttons in all post action bars.
 * This is useful for photo posts which don't have a video element to patch.
 */
export function injectPostDownloadButtons() {
  const saveBtns = document.querySelectorAll(
    'svg[aria-label="Save"], svg[aria-label="Remove"], [aria-label="Save"], [aria-label="Remove"]'
  );

  for (const el of Array.from(saveBtns)) {
    const wrapper = el.closest('button') ?? el.closest('[role="button"]');
    const target = (wrapper ?? el) as HTMLElement;
    
    // The action bar is typically a flex row container for the Save button.
    const parent = target.parentElement;
    if (!parent) continue;

    // We need the post scope to find the media later
    const scope = target.closest('article') ?? target.closest('[role="dialog"]') ?? target.closest('section') ?? document.body;
    
    // Avoid duplicate injections
    if (scope.querySelector(`[${DOM_ATTRIBUTES.DOWNLOAD_BUTTON}]`)) continue;

    const btn = document.createElement('div');
    btn.setAttribute(DOM_ATTRIBUTES.DOWNLOAD_BUTTON, 'true');
    btn.className = 'reels-scrubber-download-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.innerHTML = DOWNLOAD_ICON_SVG;
    btn.title = 'Download media';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handlePostDownloadClick(scope as HTMLElement, btn);
    });

    btn.addEventListener('mousedown', (e) => e.stopPropagation());
    btn.addEventListener('mouseup', (e) => e.stopPropagation());

    parent.insertBefore(btn, target);
    
    if (window.getComputedStyle(parent).display !== 'flex') {
      parent.style.setProperty('display', 'flex', 'important');
      parent.style.setProperty('align-items', 'center', 'important');
    }
    
    btn.style.setProperty('margin-bottom', '0', 'important');
    btn.style.setProperty('margin-right', '16px', 'important');
  }
}
