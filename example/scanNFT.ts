import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiSecBlocklist, Action } from "suisecblocklist";

const client = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

const blocklist = new SuiSecBlocklist();
blocklist.fetchObjectlist();
// setInterval(() => blocklist.fetchObjectlist(), 1000 * 60 * 5);

const address =
  "0x465a02228c92dd41cce21ec5085d9942cfe006742ee2f9911cf5ced9a02c0d6f";
const own_objects = await client.getOwnedObjects({ owner: address });

let object_ids: string[] = [];

for (const object of own_objects.data) {
  const object_id = object.data?.objectId;
  object_ids.push(object_id);
}

const objects_info = await client.multiGetObjects({
  ids: object_ids,
  options: { showType: true },
});

for (const object_info of objects_info) {
  const obj_info = object_info.data;
  const object_id = obj_info.objectId;
  const object_type = obj_info.type;
  if (object_type?.startsWith("0x2::coin::Coin")) continue;

  const action = await blocklist.scanObject(object_type);
  if (action === Action.BLOCK) {
    // block the object, do something
    console.log("BLOCK", object_id, object_type);
  } else {
    console.log("NORMAL", object_id, object_type);
  }
}
