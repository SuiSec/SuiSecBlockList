import {
  BlocklistStorageKey,
  BlocklistStorage,
  DomainBlocklist,
  Action,
  PackageBlocklist,
  ObjectBlocklist,
  CoinBlocklist,
} from "./types";
import { InMemoryStorage } from "./inMemoryStorage";
import {
  fetchDomainBlocklist,
  scanDomain,
  withRetry,
  fetchPackageBlocklist,
  scanPackage,
  fetchObjectBlocklist,
  scanObject,
  fetchCoinBlocklist,
  scanCoin,
} from "./utils";

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

  async fetchDomainlist(): Promise<void> {
    logger("fetchDomainlist start");
    const domainBlocklist = await fetchDomainBlocklist();
    logger("fetchDomainlist fetched", domainBlocklist);

    if (!domainBlocklist) {
      logger("fetchDomainlist fail 1 domainBlocklist");
      this.reportError(new Error("Failed to fetch blocklist"));
      return;
    }

    await this.storage.setItem(
      BlocklistStorageKey.DomainBlocklist,
      domainBlocklist
    );
    logger("fetchDomainlist success ", domainBlocklist);
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
      await withRetry(() => this.fetchDomainlist(), 3);
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

  async fetchPackagelist(): Promise<void> {
    logger("fetchPackagelist start");
    const packageBlocklist = await fetchPackageBlocklist();
    logger("fetchPackagelist fetched", packageBlocklist);

    if (!packageBlocklist) {
      logger("fetchPackagelist fail 1 packageBlocklist");
      this.reportError(new Error("Failed to fetch packagelist"));
      return;
    }

    await this.storage.setItem(
      BlocklistStorageKey.PackageBlocklist,
      packageBlocklist
    );
    logger("fetchpackagelist success ", packageBlocklist);
  }

  async scanPackage(address: string): Promise<Action> {
    logger("scanPackage start");
    let storedPackageBlocklist = await this.storage.getItem<PackageBlocklist>(
      BlocklistStorageKey.PackageBlocklist
    );

    logger("scanPackage fetch 1", storedPackageBlocklist);

    if (!storedPackageBlocklist) {
      await withRetry(() => this.fetchPackagelist(), 3);
      storedPackageBlocklist = await this.storage.getItem<PackageBlocklist>(
        BlocklistStorageKey.PackageBlocklist
      );
      logger("scanPackage fetch 2", storedPackageBlocklist);
    }

    if (!storedPackageBlocklist) {
      logger("scanPackage error", storedPackageBlocklist);
      this.reportError(new Error("Failed to fetch blocklist"));
      // Note(metreniuk): should we fail silently here?
      return Action.NONE;
    }

    const action = scanPackage(storedPackageBlocklist.blocklist, address);

    logger("scanPackage action", action);

    return action;
  }

  async fetchObjectlist(): Promise<void> {
    logger("fetchObjectlist start");
    const objectBlocklist = await fetchObjectBlocklist();
    logger("fetchObjectlist fetched", objectBlocklist);

    if (!objectBlocklist) {
      logger("fetchObjectlist fail 1 objectBlocklist");
      this.reportError(new Error("Failed to fetch objectlist"));
      return;
    }

    await this.storage.setItem(
      BlocklistStorageKey.ObjectBlocklist,
      objectBlocklist
    );
    logger("fetchobjectlist success ", objectBlocklist);
  }

  async scanObject(object: string): Promise<Action> {
    logger("scanObject start");
    let storedObjectBlocklist = await this.storage.getItem<ObjectBlocklist>(
      BlocklistStorageKey.ObjectBlocklist
    );

    logger("scanObject fetch 1", storedObjectBlocklist);

    if (!storedObjectBlocklist) {
      await withRetry(() => this.fetchObjectlist(), 3);
      storedObjectBlocklist = await this.storage.getItem<ObjectBlocklist>(
        BlocklistStorageKey.ObjectBlocklist
      );
      logger("scanObject fetch 2", storedObjectBlocklist);
    }

    if (!storedObjectBlocklist) {
      logger("scanObject error", storedObjectBlocklist);
      this.reportError(new Error("Failed to fetch blocklist"));
      // Note(metreniuk): should we fail silently here?
      return Action.NONE;
    }

    const action = scanObject(storedObjectBlocklist.blocklist, object);

    logger("scanObject action", action);

    return action;
  }

  async fetchCoinlist(): Promise<void> {
    logger("fetchCoinlist start");
    const coinBlocklist = await fetchCoinBlocklist();
    logger("fetchCoinlist fetched", coinBlocklist);

    if (!coinBlocklist) {
      logger("fetchCoinlist fail 1 coinBlocklist");
      this.reportError(new Error("Failed to fetch coinlist"));
      return;
    }

    await this.storage.setItem(
      BlocklistStorageKey.CoinBlocklist,
      coinBlocklist
    );
    logger("fetchcoinlist success ", coinBlocklist);
  }

  async scanCoin(coin: string): Promise<Action> {
    logger("scanCoin start");
    let storedCoinBlocklist = await this.storage.getItem<CoinBlocklist>(
      BlocklistStorageKey.CoinBlocklist
    );

    logger("scanCoin fetch 1", storedCoinBlocklist);

    if (!storedCoinBlocklist) {
      await withRetry(() => this.fetchCoinlist(), 3);
      storedCoinBlocklist = await this.storage.getItem<CoinBlocklist>(
        BlocklistStorageKey.CoinBlocklist
      );
      logger("scanCoin fetch 2", storedCoinBlocklist);
    }

    if (!storedCoinBlocklist) {
      logger("scanCoin error", storedCoinBlocklist);
      this.reportError(new Error("Failed to fetch blocklist"));
      // Note(metreniuk): should we fail silently here?
      return Action.NONE;
    }

    const action = scanCoin(storedCoinBlocklist.blocklist, coin);

    logger("scanCoin action", action);

    return action;
  }
}
