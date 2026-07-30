export const UI_IDS = {
  STORY_CONTROLS: 'reels-scrubber-story-controls',
  TAGS_LIFT: 'reels-scrubber-tags-lift-style',
  TOAST_STACK: 'reels-scrubber-toast-stack',
  SUPPORT_WIDGET: 'reels-scrubber-support-widget',
  PRO_ANNOUNCE: 'reels-scrubber-pro-announce',
  PRO_NOTICE: 'reels-scrubber-pro-preview-notice',
  PRO_WELCOME: 'reels-scrubber-pro-preview-welcome',
  LOOP_STYLE: 'reels-scrubber-loop-style'
};

export function injectStoryControlsCSS() {
  if (document.getElementById(UI_IDS.STORY_CONTROLS)) return;
  const style = document.createElement('style');
  style.id = UI_IDS.STORY_CONTROLS;
  style.textContent = `
    video[data-reels-scrubber-active][data-reels-scrubber-story-layout]::-webkit-media-controls-enclosure {
      transform: translateY(-55px);
      background: transparent !important;
    }
    video[data-reels-scrubber-active][data-reels-scrubber-story-layout]::-webkit-media-controls-panel {
      background: transparent !important;
    }
  `;
  document.head.appendChild(style);
}

export function injectTagsLiftCSS() {
  if (document.getElementById(UI_IDS.TAGS_LIFT)) return;
  const style = document.createElement('style');
  style.id = UI_IDS.TAGS_LIFT;
  style.textContent = `
    [data-reels-scrubber-tags-lift]{transition:transform 1.2s ease-in-out 2s;}
    [data-reels-scrubber-tags-scope]:has(video[data-reels-scrubber-active]:hover) [data-reels-scrubber-tags-lift],
    [data-reels-scrubber-tags-scope]:has(video[data-reels-scrubber-active]) [data-reels-scrubber-tags-lift]:hover {
      transform:translate(-3px,-55px) !important;
      transition:transform 0.2s ease 0s;
    }
  `;
  document.head.appendChild(style);
}

export function injectLoopMarkerCSS() {
  if (document.getElementById(UI_IDS.LOOP_STYLE)) return;
  const style = document.createElement('style');
  style.id = UI_IDS.LOOP_STYLE;
  style.textContent = `
    [data-reels-scrubber-loop-markers]{opacity:0;pointer-events:none;transition:opacity .15s ease;}
    *:hover>[data-reels-scrubber-loop-markers]{opacity:1;pointer-events:auto;}
  `;
  document.head.appendChild(style);
}

export function getToastStack(): HTMLElement {
  let e = document.getElementById(UI_IDS.TOAST_STACK);
  if (!e) {
    e = document.createElement('div');
    e.id = UI_IDS.TOAST_STACK;
    document.body.appendChild(e);
  }
  return e;
}
