import fetch from "cross-fetch";
import {
  Action,
  CoinBlocklist,
  DomainBlocklist,
  ObjectBlocklist,
  PackageBlocklist,
} from "./types";

export const DEFAULT_BLOCKLIST_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/domain-list.json";
export const DEFAULT_COIN_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/coin-list.json";
export const DEFAULT_PACKAGE_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/package-list.json";
export const DEFAULT_OBJECT_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/object-list.json";

export type ErrorCallback = (error: unknown) => void;

interface DomainMap {
  [key: string]: string;
}

const domainMap: DomainMap = {
  "cetus": "cetus.zone",
  "scallop": "scallop.io",
  "navi": "naviprotocol.io",
  "navx": "naviprotocol.io",
  "suilend": "suilend.fi",
  "bucket": "bucketprotocol.io",
  "turbos": "turbos.finance",
  "flowx": "flowx.finance",
  "kriya": "kriya.finance",
  "bluefin": "bluefin.io",
};

// Use native fetch where supported
// cross-fetch doesn't support workers (https://github.com/lquixada/cross-fetch/issues/78)
export const fetcher = typeof self !== "undefined" && !!self.fetch
  ? self.fetch
  : fetch;

// recent domains every 5 minutes.
export async function fetchDomainBlocklist(
  reportError: ErrorCallback | undefined = undefined,
): Promise<DomainBlocklist | null> {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // We wrap errors with a null so any downtime won't break user's browsing flow.
    const response = await fetcher(DEFAULT_BLOCKLIST_URL, {
      method: "GET",
      ...headers,
    });
    if (!response.ok) {
      if (reportError) {
        reportError(await response.text());
      }
      return null;
    }
    // Catch JSON decoding errors too.
    return (await response.json()) as DomainBlocklist;
  } catch (error: unknown) {
    if (reportError) {
      reportError(error);
    }
    return null;
  }
}

export function scanDomain(blocklist: string[], url: string): Action {
  const domain = new URL(url).hostname.toLowerCase();
  const domainParts = domain.split(".");

  for (let i = 0; i < domainParts.length - 1; i++) {
    const domainToLookup = domainParts.slice(i).join(".");
    if (blocklist.includes(domainToLookup)) {
      return Action.BLOCK;
    }
  }

  for (const key in domainMap) {
    if (domain.includes(key)) {
      if (domain !== domainMap[key]) {
        return Action.BLOCK;
      }
    }
  }
  return Action.NONE;
}

export const withRetry = async <T>(
  action: () => Promise<T>,
  times = 3,
): Promise<T> => {
  try {
    return action();
  } catch (e) {
    if (times <= 0) {
      throw e;
    }
    return withRetry(action, times - 1);
  }
};

export async function fetchPackageBlocklist(
  reportError: ErrorCallback | undefined = undefined,
): Promise<PackageBlocklist | null> {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // We wrap errors with a null so any downtime won't break user's browsing flow.
    const response = await fetcher(DEFAULT_PACKAGE_URL, {
      method: "GET",
      ...headers,
    });
    if (!response.ok) {
      if (reportError) {
        reportError(await response.text());
      }
      return null;
    }
    // Catch JSON decoding errors too.
    return (await response.json()) as PackageBlocklist;
  } catch (error: unknown) {
    if (reportError) {
      reportError(error);
    }
    return null;
  }
}

export function scanPackage(packagelist: string[], address: string): Action {
  if (packagelist.includes(address)) {
    return Action.BLOCK;
  }

  return Action.NONE;
}

export async function fetchObjectBlocklist(
  reportError: ErrorCallback | undefined = undefined,
): Promise<ObjectBlocklist | null> {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // We wrap errors with a null so any downtime won't break user's browsing flow.
    const response = await fetcher(DEFAULT_OBJECT_URL, {
      method: "GET",
      ...headers,
    });
    if (!response.ok) {
      if (reportError) {
        reportError(await response.text());
      }
      return null;
    }
    // Catch JSON decoding errors too.
    return (await response.json()) as ObjectBlocklist;
  } catch (error: unknown) {
    if (reportError) {
      reportError(error);
    }
    return null;
  }
}

export function scanObject(objectlist: string[], object: string): Action {
  if (objectlist.includes(object)) {
    return Action.BLOCK;
  }

  return Action.NONE;
}

export async function fetchCoinBlocklist(
  reportError: ErrorCallback | undefined = undefined,
): Promise<CoinBlocklist | null> {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // We wrap errors with a null so any downtime won't break user's browsing flow.
    const response = await fetcher(DEFAULT_COIN_URL, {
      method: "GET",
      ...headers,
    });
    if (!response.ok) {
      if (reportError) {
        reportError(await response.text());
      }
      return null;
    }
    // Catch JSON decoding errors too.
    return (await response.json()) as CoinBlocklist;
  } catch (error: unknown) {
    if (reportError) {
      reportError(error);
    }
    return null;
  }
}

export function scanCoin(coinlist: string[], coin: string): Action {
  if (coinlist.includes(coin)) {
    return Action.BLOCK;
  }

  return Action.NONE;
}
