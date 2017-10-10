require('../new_swiper/bundle')

console.log(SimpleSwiperFactory);
// var xx = new SimpleSwiper({
//     name: 'demo-1'
// });

let assert = require('assert');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });
});
