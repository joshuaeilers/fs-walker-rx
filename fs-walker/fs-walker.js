"use strict";
const fs_1 = require('fs');
const Rx_1 = require('rxjs/Rx');
const path = require('path');
const readdir$ = Rx_1.Observable.bindNodeCallback(fs_1.readdir);
const stat$ = Rx_1.Observable.bindNodeCallback(fs_1.lstat);
function walk(currentDir, dirBlacklist) {
    let dirBlacklistSet = new Set();
    if (dirBlacklist) {
        dirBlacklist.forEach(name => dirBlacklistSet.add(name));
    }
    return walkHelper(currentDir, dirBlacklistSet);
}
exports.walk = walk;
function walkHelper(currentDir, dirBlacklist) {
    const fileNameInThisPath$ = readdir$(currentDir)
        .concatMap(fileNames => Rx_1.Observable.from(fileNames));
    const fsObject$ = fileNameInThisPath$
        .map(fileName => ({ name: fileName, path: path.join(currentDir, fileName), stats: null }));
    const fsObjectWithStats$ = fsObject$
        .concatMap(fsObject => stat$(fsObject.path)
        .map(stats => {
        fsObject.stats = stats;
        return fsObject;
    }));
    const everythingBelow$ = fsObjectWithStats$
        .concatMap(fsObject => {
        if (fsObject.stats.isDirectory()) {
            if (dirBlacklist.has(fsObject.name)) {
                return Rx_1.Observable.empty();
            }
            else {
                return walkHelper(fsObject.path, dirBlacklist);
            }
        }
        else {
            return Rx_1.Observable.of(fsObject);
        }
    });
    return everythingBelow$;
}
