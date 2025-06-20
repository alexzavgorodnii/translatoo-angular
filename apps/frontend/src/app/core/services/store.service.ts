import { WritableSignal, signal, computed, effect } from '@angular/core';

export class Store<T> {
  protected readonly _state: WritableSignal<T>;

  constructor(initialState: T) {
    this._state = signal(initialState);
    // Add logging changes
    effect(() => {
      console.log('State changed:', this._state());
    });
  }

  get snapshot(): T {
    return this._state();
  }

  setState(patch: Partial<T>) {
    this._state.update(state => ({ ...state, ...patch }));
  }

  updateState(updater: (state: T) => T) {
    this._state.update(updater);
  }

  select<K>(selector: (state: T) => K) {
    return computed(() => selector(this._state()));
  }

  reset(initialState: T) {
    this._state.set(initialState);
  }
}
