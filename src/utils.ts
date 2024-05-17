import fetch from "cross-fetch";
import { Action, DomainBlocklist } from "./types";

export const DEFAULT_BLOCKLIST_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/domain-list.json";
export const DEFAULT_COIN_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/coin-list.json";
export const DEFAULT_PACKAGE_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/package-list.json";
export const DEFAULT_OBJECT_URL =
  "https://raw.githubusercontent.com/suiet/guardians/main/src/object-list.json";

export type ErrorCallback = (error: unknown) => void;

// Use native fetch where supported
// cross-fetch doesn't support workers (https://github.com/lquixada/cross-fetch/issues/78)
export const fetcher =
  typeof self !== "undefined" && !!self.fetch ? self.fetch : fetch;

// recent domains every 5 minutes.
export async function fetchDomainBlocklist(
  reportError: ErrorCallback | undefined = undefined
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
  return Action.NONE;
}

export const withRetry = async <T>(
  action: () => Promise<T>,
  times = 3
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
