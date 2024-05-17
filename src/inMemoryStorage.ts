import { BlocklistStorage, BlocklistStorageKey } from "./types";

export class InMemoryStorage implements BlocklistStorage {
  private _storage: { [k in BlocklistStorageKey]?: unknown } = {};

  async getItem<T>(key: BlocklistStorageKey) {
    return this._storage[key] as T | undefined;
  }

  async setItem(key: BlocklistStorageKey, data: unknown) {
    this._storage[key] = data;
  }
}
