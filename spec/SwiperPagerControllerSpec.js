let SwiperEngine = require("../SwiperEngine");
let SwiperPagerController = require("../SwiperPagerController");

let swiper;

function sliderRegular(infinite) {
    swiper = new SwiperEngine();

    swiper.containerSize = 500;
    swiper.count = 5;
    swiper.leftOffset = 100;
    swiper.rightOffset = 200;
    swiper.infinite = infinite;

    swiper.slideSizeFunction = function(n) {
        return 500;
    };

    swiper.slideMargin = function(n) {
        return 0;
    };
    swiper.slideSnapOffset = function(n) {
        return 0;
    };

    swiper.layout();
}

describe("SwiperPager (no animations / finite mode)", function() {

    it("moves properly", function() {
        sliderRegular(true);
        let pagerController = new SwiperPagerController(swiper);
        pagerController.elementClicked(2);

        setTimeout(() => {
            expect(swiper.activeSlides()).toEqual([2]);
        }, 100)
    });
});