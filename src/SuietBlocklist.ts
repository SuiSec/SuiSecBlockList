import {
  BlocklistStorageKey,
  BlocklistStorage,
  DomainBlocklist,
  Action,
} from "./types";
import { InMemoryStorage } from "./inMemoryStorage";
import { fetchDomainBlocklist, scanDomain, withRetry } from "./utils";

const logger =
  process.env.NODE_ENV === "production"
    ? () => {
        /**/
      }
    : console.log;

export class SuietBlocklist {
  constructor(
    private readonly storage: BlocklistStorage = new InMemoryStorage(),
    private readonly reportError: (err: unknown) => void = () => {
      /**/
    }
  ) {}

  async fetchBlocklist(): Promise<void> {
    logger("fetchBlocklist start");
    const domainBlocklist = await fetchDomainBlocklist();
    logger("fetchBlocklist fetched", domainBlocklist);

    const storedDomainBlocklist = await this.storage.getItem<DomainBlocklist>(
      BlocklistStorageKey.DomainBlocklist
    );
    logger("fetchBlocklist storage", storedDomainBlocklist);

    if (storedDomainBlocklist) {
      await this.storage.setItem(
        BlocklistStorageKey.DomainBlocklist,
        domainBlocklist
      );

      return;
    }

    if (!domainBlocklist) {
      logger("fetchBlocklist fail 1 domainBlocklist");
      this.reportError(new Error("Failed to fetch blocklist"));
      return;
    }

    await this.storage.setItem(
      BlocklistStorageKey.DomainBlocklist,
      domainBlocklist
    );
    logger("fetchBlocklist success ", domainBlocklist);
  }

  async allowDomainLocally(domain: string) {
    const existing =
      (await this.storage.getItem<string[]>(
        BlocklistStorageKey.UserAllowlist
      )) || [];
    await this.storage.setItem(
      BlocklistStorageKey.UserAllowlist,
      existing.concat(domain)
    );
    logger("allowDomainLocally success ");
  }

  async scanDomain(url: string): Promise<Action> {
    logger("scanDomain start");
    let storedDomainBlocklist = await this.storage.getItem<DomainBlocklist>(
      BlocklistStorageKey.DomainBlocklist
    );

    logger("scanDomain fetch 1", storedDomainBlocklist);

    if (!storedDomainBlocklist) {
      await withRetry(() => this.fetchBlocklist(), 3);
      storedDomainBlocklist = await this.storage.getItem<DomainBlocklist>(
        BlocklistStorageKey.DomainBlocklist
      );
      logger("scanDomain fetch 2", storedDomainBlocklist);
    }

    if (!storedDomainBlocklist) {
      logger("scanDomain error", storedDomainBlocklist);
      this.reportError(new Error("Failed to fetch blocklist"));
      // Note(metreniuk): should we fail silently here?
      return Action.NONE;
    }

    const action = scanDomain(storedDomainBlocklist.blocklist, url);

    if (action === Action.BLOCK) {
      logger("scanDomain BLOCK");
      const allowlist =
        (await this.storage.getItem<string[]>(
          BlocklistStorageKey.UserAllowlist
        )) || [];
      const hostname = new URL(url).hostname;
      if (allowlist.includes(hostname)) {
        logger("scanDomain allowlist", allowlist, hostname);
        return Action.NONE;
      }
    }

    logger("scanDomain action", action);

    return action;
  }
}
