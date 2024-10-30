import {SuiSecBlocklist} from "suisecblocklist";

async function main() {

    const urls=[
        "https://sui.io",
        "https://app.cetus.zone/swap",
        "https://scam-cetus.zone/swap",//block
        "https://scam.scam-cetus.zone/swap",//block
        "https://500-airdrop.top",//block
    ]
    const blocklist = new SuiSecBlocklist();
    await blocklist.fetchDomainlist();
    for (let url of urls) {
        let action = await blocklist.scanDomain(url);
        console.log(`${url} ${action}`);
    }
}

main().then(r => 0);