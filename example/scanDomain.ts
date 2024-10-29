import {SuiSecBlocklist} from "suisecblocklist";

async function main() {

    const urls=[
        "https://sui.io",
        "https://app.cetus.zone/swap",
        "https://500-airdrop.top",//block
    ]
    for (let url of urls) {
        const blocklist = new SuiSecBlocklist();
        await blocklist.fetchDomainlist();
        let action = await blocklist.scanDomain(url);
        console.log(action);
    }
}

main().then(r => 0);