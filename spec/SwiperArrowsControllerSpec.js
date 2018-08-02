let SwiperArrowsController = require("../SwiperArrowsController");
let SwiperEngine = require("../SwiperEngine");

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

describe("SwiperArrowsController (no animations / finite mode)", function() {

    it ("arrows moves swiper properly", function() {
        sliderRegular(true);

        let swiperArrows = new SwiperArrowsController(swiper);
        swiperArrows.clickPrevious();

        setTimeout(() => {
            expect(swiper.slideCoord(4)).toBe(0)
        }, 100);

        swiperArrows.clickNext();

        setTimeout(() => {
            expect(swiper.slideCoord(5)).toBe(0);
        }, 100);
    });

    it ("changes arrows active status properly", function() {
        sliderRegular(false);

        let swiperArrows = new SwiperArrowsController(swiper);

        swiperArrows.init();

        expect(swiperArrows._arrowPreviousIsActive).toBe(false);
        expect(swiperArrows._arrowNextIsActive).toBe(true);

        swiperArrows.clickNext();

        setTimeout(() => {
            expect(swiperArrows._arrowPreviousIsActive).toBe(true);
        }, 100);

        swiperArrows.clickNext();
        swiperArrows.clickNext();
        swiperArrows.clickNext();

        setTimeout(() => {
            expect(swiperArrows._arrowNextIsActive).toBe(false);
        }, 100);
    });
});