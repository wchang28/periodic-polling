import * as events from "events";
import * as uuid from "uuid";

export interface PollInfo {
    id: string;
    time: Date;
    prevPollId?: string;
    interPollMS?: number;
}

export type PollingFunction<T> = (pollInfo: PollInfo) => Promise<T>;

export interface IPeriodicPolling<T> {
    readonly started: boolean;
    start(): void;
    stop(): void;
    on(event: "error", listner: (err: any, pollInfo: PollInfo) => void): this;
    on(event: "before-poll", listner: (pollInfo: PollInfo) => void): this
    on(event: "polled", listner: (value: T, pollInfo: PollInfo) => void): this;
}

class PeriodicPollingClass<T> extends events.EventEmitter {
    private __timer: NodeJS.Timer;
    private __currPollInfo: PollInfo;
    constructor(private __pollFunc: PollingFunction<T>, private __intervalSeconds: number) {
        super();
        this.__timer = null;
        this.__currPollInfo = null;
    }
    private pollingProc() {
        this.stop();
        let pollInfo: PollInfo = {id: uuid.v4(), time: new Date(), prevPollId: null, interPollMS: null};
        if (this.__currPollInfo) {
            pollInfo.prevPollId = this.__currPollInfo.id;
            pollInfo.interPollMS = pollInfo.time.getTime() - this.__currPollInfo.time.getTime();
        }
        this.__currPollInfo = pollInfo;
        this.emit("before-poll", pollInfo);
        this.__pollFunc(pollInfo)
        .then((value: T) => {
            this.emit("polled", value, pollInfo);
            this.__timer = setTimeout(this.pollingProc.bind(this), this.__intervalSeconds * 1000);
        }).catch((err: any) => {
            this.emit("error", err, pollInfo);
            this.__timer = setTimeout(this.pollingProc.bind(this), this.__intervalSeconds * 1000);
        });
    }
    public get started(): boolean {
        return (this.__timer !== null); 
    }
    public start() {
        if (!this.__timer) {
            this.__currPollInfo = null;
            this.pollingProc();
        }
    }
    public stop() {
        if (this.__timer) {
            clearTimeout(this.__timer);
            this.__timer = null;
        }
    }
}

export class PeriodicPolling {
    public static get<T>(pollFunc: PollingFunction<T>, intervalSeconds: number): IPeriodicPolling<T> {
        return new PeriodicPollingClass<T>(pollFunc, intervalSeconds);
    }
}
