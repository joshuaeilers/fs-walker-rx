import { readdir, lstat, Stats } from 'fs'
import { Observable } from 'rxjs/Rx'
import * as path from 'path'

const readdir$ = Observable.bindNodeCallback(readdir)
const stat$ = Observable.bindNodeCallback(lstat)

export interface FsObject {
  name: string
  path: string
  stats: Stats
}

export function walk(currentDir: string, dirBlacklist?: string[]): Observable<FsObject> {
  let dirBlacklistSet = new Set<string>()
  if (dirBlacklist) {
    dirBlacklist.forEach(name => dirBlacklistSet.add(name))
  }
  return walkHelper(currentDir, dirBlacklistSet)
}

function walkHelper(currentDir: string, dirBlacklist: Set<string>) {
  const fileNameInThisPath$ = readdir$(currentDir)
    .concatMap(fileNames => Observable.from(fileNames))

  const fsObject$ = fileNameInThisPath$
    .map(fileName => ({ name: fileName, path: path.join(currentDir, fileName), stats: null }))

  const fsObjectWithStats$ = fsObject$
    .concatMap(fsObject =>
      stat$(fsObject.path)
        .map(stats => {
          fsObject.stats = stats
          return fsObject
        })
    )

  const everythingBelow$ = fsObjectWithStats$
    .concatMap(fsObject => {
      if (fsObject.stats.isDirectory()) {
        if (dirBlacklist.has(fsObject.name)) {
          return Observable.empty()
        } else {
          return walkHelper(fsObject.path, dirBlacklist)
        }
      } else {
        return Observable.of(fsObject)
      }
    })

  return everythingBelow$
}