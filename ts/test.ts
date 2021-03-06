import {PeriodicPolling, PollInfo} from "./";
import * as request from "superagent";

// get my public ip address from ipify.org
// reference: https://www.ipify.org/
let getMyPublicIP = async (pi: PollInfo) => {
    let url = "https://api.ipify.org";
    let ret = await request.get(url).query({"format": "json"}).timeout(15000);
    if (ret.status === 200 && ret.body && typeof ret.body.ip === "string" && ret.body.ip) {
        return ret.body.ip as string;
    } else {
        throw `unable to determine my public ip address from ${url}`;
    }
};

let pp = PeriodicPolling.get(getMyPublicIP, 30);    // periodic poll my public ip address in 30 sec interval

pp.on("before-poll", (pi: PollInfo) => {
    console.log("");
    console.log(`${new Date().toISOString()}: <before-poll>: pi=${JSON.stringify(pi)}`);
}).on("polled", (myIP: string, pi: PollInfo) => {
    console.log(`${new Date().toISOString()}: <polled>: pi=${JSON.stringify(pi)}, myIP=${JSON.stringify(myIP)}`);
}).on("error", (err: any, pi: PollInfo) => {
    console.error(`${new Date().toISOString()}: !!! <error>: pi=${JSON.stringify(pi)}, err=${JSON.stringify(err)}`);
}).start();