import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Action, SuiSecBlocklist } from "suisecblocklist";

const client = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

const blocklist = new SuiSecBlocklist();
blocklist.fetchPackagelist();
// setInterval(() => blocklist.fetchPackagelist(), 1000 * 60 * 5);

const tx = new Transaction();
const mint_fee = 10;
const [coin] = tx.splitCoins(tx.gas, [mint_fee]);
tx.moveCall({
  package: "0xd89d1288e1d0a69cc7e5a30625c238e2310e4c23221557b819174f8c14b31ef8",
  module: "managed",
  function: "mint",
  arguments: [
    tx.object(
      "0x4b65993b5d2cfdd2bef8f43b78fd65491317d8ee9a7f44c24a8265b7b305201f",
    ),
    tx.pure.u64(22000000000000n),
    tx.pure.address(
      "0x000647e27dfba064eacdb5bfa1f94c963977823de2d47ff86267ac775cc97c92",
    ),
  ],
});
tx.transferObjects(
  [coin],
  tx.pure.address(
    "0x000647e27dfba064eacdb5bfa1f94c963977823de2d47ff86267ac775cc97c92",
  ),
);

const transactions_command = tx.getData().commands;

let packages: string[] = [];

for (const command of transactions_command) {
  if (command.$kind === "MoveCall") {
    packages.push(command.MoveCall.package);
  }
}

for (const pkg of packages) {
  const action = await blocklist.scanPackage(pkg);
  if (action === Action.BLOCK) {
    console.log("BLOCK", pkg);
  }
}
