export const UI_IDS = {
  STORY_CONTROLS: 'reels-scrubber-story-controls',
  TAGS_LIFT: 'reels-scrubber-tags-lift-style',
  TOAST_STACK: 'reels-scrubber-toast-stack',
  SUPPORT_WIDGET: 'reels-scrubber-support-widget',
  PRO_ANNOUNCE: 'reels-scrubber-pro-announce',
  PRO_NOTICE: 'reels-scrubber-pro-preview-notice',
  PRO_WELCOME: 'reels-scrubber-pro-preview-welcome',
  DOWNLOAD_STYLE: 'reels-scrubber-download-style'
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
  if (navigator.userAgent.toLowerCase().includes('firefox')) {
    style.textContent += `
      video[data-reels-scrubber-active][data-reels-scrubber-story-layout] {
        height: calc(100% - 72px) !important;
      }
    `;
  }
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



export function injectDownloadCSS() {
  if (document.getElementById(UI_IDS.DOWNLOAD_STYLE)) return;
  const style = document.createElement('style');
  style.id = UI_IDS.DOWNLOAD_STYLE;
  style.textContent = `
    .reels-scrubber-download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      margin-bottom: 8px;
      color: #fff;
      cursor: pointer;
      background: transparent;
      border: none;
      border-radius: 50%;
      transition: opacity 0.15s ease, transform 0.15s ease;
      pointer-events: auto;
      z-index: 10002;
    }
    .reels-scrubber-download-btn:active {
      transform: scale(0.9);
    }
    .reels-scrubber-download-btn svg {
      display: block;
    }
    /* Loading state */
    .reels-scrubber-download-btn.reels-dl-loading {
      opacity: 0.6;
      pointer-events: none;
    }
    /* Success state */
    .reels-scrubber-download-btn.reels-dl-success {
      color: #4ade80;
    }
    /* Error state */
    .reels-scrubber-download-btn.reels-dl-error {
      color: #f87171;
    }
    @keyframes reels-dl-spin {
      to { transform: rotate(360deg); }
    }
    .reels-dl-spinner {
      animation: reels-dl-spin 0.8s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

export function getToastStack(): HTMLElement {
  let e = document.getElementById(UI_IDS.TOAST_STACK);
  if (!e) {
    e = document.createElement('div');
    e.id = UI_IDS.TOAST_STACK;
    Object.assign(e.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '999999',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none'
    });
    document.body.appendChild(e);
  }
  return e;
}

export function showToast(msg: string) {
  const stack = getToastStack();
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    background: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '600',
    marginBottom: '8px',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0',
    transform: 'translateY(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  });
  stack.appendChild(t);
  
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
  });
  
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 1500);
}

