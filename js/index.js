"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var uuid = require("uuid");
var PeriodicPollingClass = /** @class */ (function (_super) {
    __extends(PeriodicPollingClass, _super);
    function PeriodicPollingClass(__pollFunc, __intervalSeconds) {
        var _this = _super.call(this) || this;
        _this.__pollFunc = __pollFunc;
        _this.__intervalSeconds = __intervalSeconds;
        _this.__timer = null;
        _this.__currPollInfo = null;
        return _this;
    }
    PeriodicPollingClass.prototype.pollingProc = function () {
        var _this = this;
        this.stop();
        var pollInfo = { id: uuid.v4(), time: new Date(), prevPollId: null, interPollMS: null };
        if (this.__currPollInfo) {
            pollInfo.prevPollId = this.__currPollInfo.id;
            pollInfo.interPollMS = pollInfo.time.getTime() - this.__currPollInfo.time.getTime();
        }
        this.__currPollInfo = pollInfo;
        this.emit("before-poll", pollInfo);
        this.__pollFunc(pollInfo)
            .then(function (value) {
            _this.emit("polled", value, pollInfo);
            _this.__timer = setTimeout(_this.pollingProc.bind(_this), _this.__intervalSeconds * 1000);
        }).catch(function (err) {
            _this.emit("error", err, pollInfo);
            _this.__timer = setTimeout(_this.pollingProc.bind(_this), _this.__intervalSeconds * 1000);
        });
    };
    Object.defineProperty(PeriodicPollingClass.prototype, "started", {
        get: function () {
            return (this.__timer !== null);
        },
        enumerable: true,
        configurable: true
    });
    PeriodicPollingClass.prototype.start = function () {
        if (!this.__timer) {
            this.__currPollInfo = null;
            this.pollingProc();
        }
    };
    PeriodicPollingClass.prototype.stop = function () {
        if (this.__timer) {
            clearTimeout(this.__timer);
            this.__timer = null;
        }
    };
    return PeriodicPollingClass;
}(events.EventEmitter));
var PeriodicPolling = /** @class */ (function () {
    function PeriodicPolling() {
    }
    PeriodicPolling.get = function (pollFunc, intervalSeconds) {
        return new PeriodicPollingClass(pollFunc, intervalSeconds);
    };
    return PeriodicPolling;
}());
exports.PeriodicPolling = PeriodicPolling;
//# sourceMappingURL=index.js.map