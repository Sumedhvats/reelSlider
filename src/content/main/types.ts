export type VideoContext = 'story-viewer' | 'reel-viewer' | 'feed-carousel' | 'feed-inline' | 'unknown';

export interface PatchSnapshot {
  parent: HTMLElement | null;
  nextSibling: ChildNode | null;
  inlineStyle: string;
  controls: boolean;
  muted: boolean;
}

export type PatchState = 'idle' | 'patching' | 'patched' | 'skipped' | 'failed' | 'rollback_in_progress' | 'rolled_back';

export interface StateNode {
  state: PatchState;
  attempts: number;
  updatedAt: number;
  snapshot?: PatchSnapshot;
  reason?: string;
  errorMessage?: string;
}
