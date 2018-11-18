import {PeriodicPolling, PollInfo} from "./";

let pp = PeriodicPolling.get(async (pi: PollInfo) => {
    return 1;
}, 10);

pp.on("before-poll", (pi: PollInfo) => {
    console.log(`<before-poll>: pi=${JSON.stringify(pi)}`);
}).on("polled", (value: number, pi: PollInfo) => {
    console.log(`<polled>: pi=${JSON.stringify(pi)}, value=${JSON.stringify(value)}`);
}).on("error", (err: any, pi: PollInfo) => {
    console.error(`!!! <error>: pi=${JSON.stringify(pi)}, err=${JSON.stringify(err)}`);
}).start();