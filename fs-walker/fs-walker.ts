import { readdir, lstat, Stats } from 'fs'
import * as path from 'path'
import { Observable } from 'rxjs/Rx'

const readdir$ = Observable.bindNodeCallback(readdir)
const stat$ = Observable.bindNodeCallback(lstat)

export interface FsObject {
  name: string
  path: string
  stats: Stats
}

export function walk(currentDir: string, dirBlacklist?: string[]): Observable<FsObject> {
  const dirBlacklistSet = new Set<string>()
  if (dirBlacklist) {
    dirBlacklist.forEach(name => dirBlacklistSet.add(name))
  }
  return walkHelper(currentDir, dirBlacklistSet)
}

function walkHelper(currentDir: string, dirBlacklist: Set<string>) {
  return readdir$(currentDir)
    .concatMap(names => Observable.from(names))
    .concatMap(name => {
      const filePath = path.join(currentDir, name)
      return stat$(filePath)
        .map(stats => ({ name, path: filePath, stats }))
    })
    .concatMap(obj =>
      obj.stats.isDirectory()
        ? (
          dirBlacklist.has(obj.name)
            ? Observable.empty()
            : walkHelper(obj.path, dirBlacklist)
        )
        : Observable.of(obj)
    )
}
