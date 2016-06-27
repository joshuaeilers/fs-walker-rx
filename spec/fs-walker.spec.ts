import { walk } from '../fs-walker'

const path = `${__dirname}/testing_dir`

describe('walk', () => {
  it('should find all files under a directory tree', (done) => {
    const expected = [
      `${path}/dir_a/file_a_a`,
      `${path}/dir_b/file_b_b`,
      `${path}/file_a`,
      `${path}/file_b`,
    ]

    let i = 0

    walk(path)
      .subscribe(
        fsObject => expect(fsObject.path).toBe(expected[i++]),
        err => console.error('error', err),
        () => {
          expect(i).toBe(expected.length)
          done()
        }
      )
  })

  it('should not enter blacklisted directories', (done) => {
    const expected = [
      `${path}/file_a`,
      `${path}/file_b`,
    ]

    let i = 0

    walk(path, ['dir_a', 'dir_b'])
      .subscribe(
        fsObject => expect(fsObject.path).toBe(expected[i++]),
        err => console.error('error', err),
        () => {
          expect(i).toBe(expected.length)
          done()
        }
      )
  })
})
