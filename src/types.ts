export enum Action {
  BLOCK = "BLOCK",
  NONE = "NONE",
}

export type DomainBlocklist = {
  allowlist: string[];
  blocklist: string[];
};

export type PackageBlocklist = {
  allowlist: string[];
  blocklist: string[];
};

export type ObjectBlocklist = {
  allowlist: string[];
  blocklist: string[];
};

export type CoinBlocklist = {
  allowlist: string[];
  blocklist: string[];
};

export type ErrorCallback = (error: unknown) => void;

export enum BlocklistStorageKey {
  DomainBlocklist = "DOMAIN_LIST:",
  UserAllowlist = "USER_ALLOWLIST:",
  PackageBlocklist = "PACKAGE_LIST:",
  ObjectBlocklist = "OBJECT_LIST:",
  CoinBlocklist = "COIN_LIST:",
}

export interface BlocklistStorage {
  getItem: <T>(key: BlocklistStorageKey) => Promise<T | undefined>;
  setItem: <T>(key: BlocklistStorageKey, data: T) => Promise<void>;
}
