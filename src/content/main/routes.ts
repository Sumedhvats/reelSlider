export const Routes = {
  HOME_FEED: /^\/$/,
  REELS_VIEWER: /^\/reels\/[^/]+\/?$/,
  REEL_VIEWER: /^\/reel\/[^/]+\/?$/,
  USER_REEL_VIEWER: /^\/[^/]+\/reel\/[^/]+\/?$/,
  POST: /^\/p\/[^/]+\/?$/,
  PROFILE_REELS_TAB: /^\/[^/]+\/reels\/?$/,
  STORIES: /^\/stories\/[^/]+\/[^/]+\/?$/,
  STORIES_FALLBACK: /^\/stories\/[^/]+\/?$/,
};

export function isReelOrPost(path: string): boolean {
  return (
    Routes.REELS_VIEWER.test(path) ||
    Routes.REEL_VIEWER.test(path) ||
    Routes.USER_REEL_VIEWER.test(path) ||
    Routes.POST.test(path)
  );
}

export function isStory(path: string): boolean {
  return Routes.STORIES.test(path) || Routes.STORIES_FALLBACK.test(path);
}

export function isSupportedPage(path: string): boolean {
  return (
    Routes.HOME_FEED.test(path) ||
    isReelOrPost(path) ||
    Routes.PROFILE_REELS_TAB.test(path) ||
    isStory(path)
  );
}

export function isPost(path: string): boolean {
  return Routes.POST.test(path);
}

export function isFeedOrReels(path: string): boolean {
  return (
    Routes.HOME_FEED.test(path) ||
    isReelOrPost(path) ||
    Routes.PROFILE_REELS_TAB.test(path)
  );
}
