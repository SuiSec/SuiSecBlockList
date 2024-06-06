import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiSecBlocklist, Action } from "suisecblocklist";

const client = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

const blocklist = new SuiSecBlocklist();
blocklist.fetchCoinlist();
// setInterval(() => blocklist.fetchCoinlist(), 1000 * 60 * 5);

const address =
  "0x465a02228c92dd41cce21ec5085d9942cfe006742ee2f9911cf5ced9a02c0d6f";
const own_balances = await client.getAllBalances({ owner: address });

for (const coin_balance of own_balances) {
    const coinType = coin_balance.coinType;
    const action = await blocklist.scanCoin(coinType);
    if (action === Action.BLOCK) {
        console.log("BLOCK", coinType);
    }
}