export interface PollInfo {
    id: string;
    time: Date;
    prevPollId?: string;
    interPollMS?: number;
}
export declare type PollingFunction<T> = (pollInfo: PollInfo) => Promise<T>;
export interface IPeriodicPolling<T> {
    readonly started: boolean;
    start(): void;
    stop(): void;
    on(event: "error", listner: (err: any, pollInfo: PollInfo) => void): this;
    on(event: "before-poll", listner: (pollInfo: PollInfo) => void): this;
    on(event: "polled", listner: (value: T, pollInfo: PollInfo) => void): this;
}
export declare class PeriodicPolling {
    static get<T>(pollFunc: PollingFunction<T>, intervalSeconds: number): IPeriodicPolling<T>;
}
