"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
const Rx_1 = require("rxjs/Rx");
const readdir$ = Rx_1.Observable.bindNodeCallback(fs_1.readdir);
const stat$ = Rx_1.Observable.bindNodeCallback(fs_1.lstat);
function walk(currentDir, dirBlacklist) {
    const dirBlacklistSet = new Set();
    if (dirBlacklist) {
        dirBlacklist.forEach(name => dirBlacklistSet.add(name));
    }
    return walkHelper(currentDir, dirBlacklistSet);
}
exports.walk = walk;
function walkHelper(currentDir, dirBlacklist) {
    return readdir$(currentDir)
        .concatMap(names => Rx_1.Observable.from(names))
        .concatMap(name => {
        const filePath = path.join(currentDir, name);
        return stat$(filePath)
            .map(stats => ({ name, path: filePath, stats }));
    })
        .concatMap(obj => obj.stats.isDirectory()
        ? (dirBlacklist.has(obj.name)
            ? Rx_1.Observable.empty()
            : walkHelper(obj.path, dirBlacklist))
        : Rx_1.Observable.of(obj));
}
