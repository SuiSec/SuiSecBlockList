import { SuiSecBlocklist } from "suisecblocklist";

async function main() {

    const urls = [
        "https://sui.io",
        "https://sui.io/",
        "deepbook.tech",
        "deepbook.tech/",
        "https://app.cetus.zone/swap",
        "https://a1.b2.deepbook.cetus.zone",
        "https://deepbook.cetus.zone/v2",
        "https://scam-cetus.zone/swap",               //block
        "https://scam.scam-cetus.zone/swap",          //block
        "https://scam1.scam2.scam-cetus.zone/swap",   //block
        "https://scam-cetus.zone/",                   //block
        "scam-cetus.zone/",                           //block
        "https://scam-cetus.zone/",                   //block
        "https://500-airdrop.top",                    //block
        "https://500-airdrop.top/",                   //block
        "500-airdrop.top",                            //block
        "500-airdrop.top/",                           //block
    ]
    const blocklist = new SuiSecBlocklist();
    await blocklist.fetchDomainlist();
    for (let url of urls) {
        let action = await blocklist.scanDomain(url);
        console.log(`${url} ${action}`);
    }
}

main().then(r => 0);