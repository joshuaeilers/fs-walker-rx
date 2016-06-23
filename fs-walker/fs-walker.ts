import { readdir, stat, Stats } from 'fs'
import { Observable } from 'rxjs/Rx'

const readdir$ = Observable.bindNodeCallback(readdir)
const stat$ = Observable.bindNodeCallback(stat)

export interface FsObject {
  name: string
  path: string
  stats: Stats
}

export function walk(startingPath): Observable<FsObject> {
  return walkHelper(startingPath)
}

function walkHelper(path) {
  const fileNameInThisPath$ = readdir$(path)
    .concatMap(fileNames => Observable.from(fileNames))

  const fsObject$ = fileNameInThisPath$
    .map(fileName => ({ name: fileName, path: `${path}/${fileName}`, stats: null }))

  const fsObjectWithStats$ = fsObject$
    .concatMap(fsObject =>
      stat$(fsObject.path)
        .map(stats => {
          fsObject.stats = stats
          return fsObject
        })
    )

  const everythingBelow$ = fsObjectWithStats$
    .concatMap(fsObject =>
      fsObject.stats.isDirectory()
        ? walkHelper(fsObject.path)
        : Observable.of(fsObject)
    )

  return everythingBelow$
}
