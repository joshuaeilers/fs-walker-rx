"use strict";
const fs_walker_1 = require('../fs-walker');
const path = __dirname + '/testing_dir';
describe('walk', () => {
    it('should find all files under a directory tree', (done) => {
        const expectedValues = [
            `${path}/dir_a/file_a_a`,
            `${path}/dir_b/file_b_b`,
            `${path}/file_a`,
            `${path}/file_b`,
        ];
        let valuesReceived = 0;
        let valuesMatched = 0;
        fs_walker_1.walk(path)
            .subscribe(fsObject => {
            valuesReceived++;
            if (expectedValues.indexOf(fsObject.path) >= 0) {
                valuesMatched++;
            }
        }, err => console.error('error', err), () => {
            expect(valuesReceived).toBe(expectedValues.length);
            expect(valuesReceived).toBe(valuesMatched);
            done();
        });
    });
});
