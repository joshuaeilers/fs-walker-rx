# file-walker-rx

This module allows recursive traversal of the file system starting from a path. Since it uses Observables, any kind filtering or operators can be applied before subscribing.

**Example**

```
var walk = require('fs-walker').walk

var path = process.env.HOME + '/Desktop'

walk(path)
  .filter(fsObject => fsObject.name.endsWith('.js'))
  .subscribe(
    fsObject => console.log('found a js file ' + fsObject.name),
    err => console.error('error', err),
    () => console.log('done')
  )
```