# SuiSec Local Blocklists

Fork the [repository](https://github.com/blowfishxyz/blocklist) from [Blowfish](https://blowfish.xyz/) and respect their work.

This is a Javascript/Typescript library that makes it easy to access the [Suiet Guardians](https://github.com/suiet/guardians): for example, scan a domain against the domain-list.

It's designed to support React Native, Chrome Extension and Node.js environments.

## Install

```bash
npm install suisecblocklist
```

## Usage

In order to execute lookups, you need to fetch a **domainlist packagelist objectlist coinlist**.
After the first fetch, you should keep these objects updated. You can save the objects in a local database
(for example, using local storage in Chrome extension).

We recommend updating it every 5 minutes.

### Basic usage

```javascript
import { SuiSecBlocklist } from "suisecblocklist";

const blocklist = new SuiSecBlocklist();

// 1. Fetch the domainlist and persist it in the storage
blocklist.fetchDomainlist();

// 2. Re-refetch the domainlist every 5 minutes
setInterval(() => blocklist.fetchDomainlist(), 1000 * 60 * 5);

// 3. Once you have a domainlist object saved, you can execute lookups
const action = blocklist.scanDomain("https://scam-website.io");

if (action === Action.BLOCK) {
  // block the domain
}

// 4. Fetch the packjectlist and persist it in the storage, Once you have a packjectlist object saved, you can execute lookups
blocklist.fetchPackagelist();

const action = blocklist.scanPackject(
  "0x13530eb10a4ffe6396d7acc8499f2b3fba7c18ac38f88570fae51823f6a203b4"
);

if (action === Action.BLOCK) {
  // block the packject
}

// 5. Fetch the objectlist and persist it in the storage, Once you have a objectlist object saved, you can execute lookups
blocklist.fetchObjectlist();

const action = blocklist.scanObject(
  "0x13530eb10a4ffe6396d7acc8499f2b3fba7c18ac38f88570fae51823f6a203b4::my_hero::Hero"
);

if (action === Action.BLOCK) {
  // block the object
}

// 6. Fetch the coinlist and persist it in the storage, Once you have a coinlist object saved, you can execute lookups
blocklist.fetchCoinlist();

const action = blocklist.scanCoin(
  "0x043a9bd4cd74f93e861b8a3138a373e726bb1f7bf8f4f38cde4872f0234ed20b::usdt::USDT"
);

if (action === Action.BLOCK) {
  // block the coin
}
```

### Error handling

Functions that depend on API an/or network can return `null` when I/O errors are encountered.

If you would like to track errors, you can pass optional `reportError` callback to `SuiSecBlocklist` constructor.

It could be called with an `Error` or with a string.

## Guides

### Browser extension

1. Install Necessary Dependencies:

```bash
npm install suisecblocklist webextension-polyfill
```

2. Create Blocklist Module:

```typescript
// src/blocklist.ts
import {
  SuiSecBlocklist,
  BlocklistStorageKey,
  BlocklistStorage,
} from "suisecblocklist";

const storage: BlocklistStorage = {
  async getItem<T>(key: BlocklistStorageKey) {
    const storage = chrome.storage.local.get([key]);
    return storage[key] as T | undefined;
  },
  async setItem(key: BlocklistStorageKey, data: unknown) {
    return chrome.storage.local.set({
      [key]: data,
    });
  },
};

export const blocklist = new SuiSecBlocklist();
export { Action } from "suisecblocklist";
```

3. Schedule Blocklist Updates:

```typescript
// src/background.ts
import Browser from "webextension-polyfill";
import { blocklist } from "./blocklist";

Browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refetch-domainlist") {
    blocklist.fetchDomainlist();
  }
});

Browser.alarms.create("refetch-domainlist", {
  periodInMinutes: 5,
  delayInMinutes: 0,
});
```

4. Domain Scanning:

```typescript
// src/content-script.ts
import Browser from "webextension-polyfill";
import { blocklist, Action } from "./blocklist";

blocklist.scanDomain(window.location.href).then((action) => {
  if (action === Action.BLOCK) {
    Browser.runtime.sendMessage({
      type: "block-domain",
      host: window.location.hostname,
      href: encodeURI(window.location.href),
    });
  }
});
```

5. Blocked Domain Screen:

```typescript
// src/block-screen.tsx
import { blocklist } from "./blocklist";

function proceedToBlockedDomainButtonClickHandler() {
  blocklist.allowDomainLocally(window.location.href);
}
```

### React Native

1. Install Necessary Dependencies:

```bash
npm install suisecblocklist react-native-async-storage react-native-background-timer react-native-url-polyfill
```

2. Create Blocklist Module:

```typescript
// src/blocklist.ts
import {
  SuiSecBlocklist,
  BlocklistStorageKey,
  BlocklistStorage,
} from "suisecblocklist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage: BlocklistStorage = {
  async getItem<T>(key: BlocklistStorageKey): Promise<T | undefined> {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : undefined;
  },
  async setItem(key: BlocklistStorageKey, data: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },
};

export const blocklist = new SuiSecBlocklist();
export { Action } from "suisecblocklist";
```

3. Schedule Blocklist Updates:

```typescript
// src/background.ts
import { blocklist } from "./blocklist";
import BackgroundTimer from "react-native-background-timer";

let intervalId;

const refetchDomainlist = () => {
  blocklist.fetchDomainlist();
};
export const startDomainlistRefetch = () => {
  intervalId = BackgroundTimer.setInterval(fetchDomainlist, 5 * 60 * 60);
};

export const stopDomainlistRefetch = () => {
  BackgroundTimer.clearInterval(intervalId);
};
```

4. Domain Scanning:

```typescript
// src/domainScanner.ts
import { blocklist, Action } from "./blocklist";

const scanCurrentDomain = async (url: string) => {
  const action = await blocklist.scanDomain(url);
  if (action === Action.BLOCK) {
    // Handle domain blocking logic
    console.warn("Blocked domain:", url);
  }
};

export default scanCurrentDomain;
```

5. Blocked Domain Screen:

```typescript
// src/BlockScreen.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { blocklist } from "./blocklist";

function proceedToBlockedDomainHandler(url: string) {
  blocklist.allowDomainLocally(url);
}

const BlockScreen: React.FC<{ url: string }> = ({ url }) => {
  return (
    <TouchableOpacity onPress={() => proceedToBlockedDomainHandler(url)}>
      <Text>Proceed to Blocked Domain</Text>
    </TouchableOpacity>
  );
};

export default BlockScreen;
```

## API Reference

### `SuiSecBlocklist`

### Constructor arguments

- `storage: BlocklistStorage` If storage is not specified we use in-memory storage. It is highly encouraged to provide the proper storage for your environemnt ([see guides](#guides)).
  - `getItem<T>(key: BlocklistStorageKey): Promise<T | undefined>`: get item by key from the environment storage.
  - `setItem(key: BlocklistStorageKey, data: unknown)`: set item by key to the environment storage.
- `reportError: (error: unknown) => void`: A callback function that library uses to track errors when result is `null`. (optional)

### Methods

### `fetchDomainlist(): Promise<void>`

Fetches the domainlist metadata and saves it to the storage. If the blocklist fetch fails, the method returns `undefined` and reports the error to `reportError`.

### `scanDomain(url: string): Promise<Action>`

Scans a domain against the stored domainlist and returns the action to be taken (either `BLOCK` or `NONE`).

If there is no stored domainlist it fetches the blocklist using `fetchDomainlist` method and returns the resulting action.

If the fetch fails, the method returns the action `NONE` and reports the error to `reportError`.

### `allowDomainLocally(url: string)`

If the user wants to proceed to the blocked domain with an explicit action, the domain is added in the user allow list (locally in the storage).

The `scanDomain` method will return `NONE` action for this domain even if it's in the domainlist.

### `fetchPackagelist(): Promise<void>`

Fetches the packagelist metadata and saves it to the storage. If the blocklist fetch fails, the method returns `undefined` and reports the error to `reportError`.

### `scanPackage(url: string): Promise<Action>`

Scans a package against the stored packagelist and returns the action to be taken (either `BLOCK` or `NONE`).

If there is no stored packagelist it fetches the blocklist using `fetchPackagelist` method and returns the resulting action.

If the fetch fails, the method returns the action `NONE` and reports the error to `reportError`.

### `fetchObjectlist(): Promise<void>`

Fetches the objectlist metadata and saves it to the storage. If the blocklist fetch fails, the method returns `undefined` and reports the error to `reportError`.

### `scanObject(url: string): Promise<Action>`

Scans a object against the stored objectlist and returns the action to be taken (either `BLOCK` or `NONE`).

If there is no stored objectlist it fetches the blocklist using `fetchObjectlist` method and returns the resulting action.

If the fetch fails, the method returns the action `NONE` and reports the error to `reportError`.

### `fetchCoinlist(): Promise<void>`

Fetches the coinlist metadata and saves it to the storage. If the blocklist fetch fails, the method returns `undefined` and reports the error to `reportError`.

### `scanCoin(url: string): Promise<Action>`

Scans a coin against the stored coinlist and returns the action to be taken (either `BLOCK` or `NONE`).

If there is no stored coinlist it fetches the blocklist using `fetchCoinlist` method and returns the resulting action.

If the fetch fails, the method returns the action `NONE` and reports the error to `reportError`.
