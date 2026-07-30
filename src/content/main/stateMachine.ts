import type { StateNode, PatchSnapshot } from './types';

function createDefaultState(): StateNode {
  return { state: 'idle', attempts: 0, updatedAt: Date.now() };
}

export class StateMachine {
  private store = new WeakMap<HTMLElement, StateNode>();

  get(element: HTMLElement): StateNode {
    let node = this.store.get(element);
    if (node) return node;
    const initial = createDefaultState();
    this.store.set(element, initial);
    return initial;
  }

  markPatching(element: HTMLElement, snapshot: PatchSnapshot): StateNode {
    const current = this.get(element);
    const updated: StateNode = {
      ...current,
      state: 'patching',
      attempts: current.attempts + 1,
      updatedAt: Date.now(),
      snapshot,
      reason: undefined,
      errorMessage: undefined,
    };
    this.store.set(element, updated);
    return updated;
  }

  markPatched(element: HTMLElement): StateNode {
    const updated: StateNode = {
      ...this.get(element),
      state: 'patched',
      updatedAt: Date.now(),
      reason: undefined,
      errorMessage: undefined,
    };
    this.store.set(element, updated);
    return updated;
  }

  markSkipped(element: HTMLElement, reason: string): StateNode {
    const updated: StateNode = {
      ...this.get(element),
      state: 'skipped',
      updatedAt: Date.now(),
      reason,
    };
    this.store.set(element, updated);
    return updated;
  }

  markFailed(element: HTMLElement, reason: string, errorMessage?: string): StateNode {
    const updated: StateNode = {
      ...this.get(element),
      state: 'failed',
      updatedAt: Date.now(),
      reason,
      errorMessage,
    };
    this.store.set(element, updated);
    return updated;
  }

  markRollbackInProgress(element: HTMLElement): StateNode {
    const updated: StateNode = {
      ...this.get(element),
      state: 'rollback_in_progress',
      updatedAt: Date.now(),
    };
    this.store.set(element, updated);
    return updated;
  }

  markRolledBack(element: HTMLElement): StateNode {
    const updated: StateNode = {
      ...this.get(element),
      state: 'rolled_back',
      updatedAt: Date.now(),
    };
    this.store.set(element, updated);
    return updated;
  }
}
