"use strict";
const fs_1 = require('fs');
const Rx_1 = require('rxjs/Rx');
const readdir$ = Rx_1.Observable.bindNodeCallback(fs_1.readdir);
const stat$ = Rx_1.Observable.bindNodeCallback(fs_1.stat);
function walk(startingPath) {
    return walkHelper(startingPath);
}
exports.walk = walk;
function walkHelper(path) {
    const fileNameInThisPath$ = readdir$(path)
        .concatMap(fileNames => Rx_1.Observable.from(fileNames));
    const fsObject$ = fileNameInThisPath$
        .map(fileName => ({ name: fileName, path: `${path}/${fileName}`, stats: null }));
    const fsObjectWithStats$ = fsObject$
        .concatMap(fsObject => stat$(fsObject.path)
        .map(stats => {
        fsObject.stats = stats;
        return fsObject;
    }));
    const everythingBelow$ = fsObjectWithStats$
        .concatMap(fsObject => fsObject.stats.isDirectory()
        ? walkHelper(fsObject.path)
        : Rx_1.Observable.of(fsObject));
    return everythingBelow$;
}
