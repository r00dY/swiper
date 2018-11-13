import SwiperArrowsController from "../SwiperArrowsController";
import SwiperEngine from "../SwiperEngine";

let swiper;

function sliderRegular(infinite) {
    swiper = new SwiperEngine();

    swiper.containerSizeFunction = () => 500;
    swiper.count = 5;
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

        let swiperArrows = new SwiperArrowsController(swiper, false);
        swiperArrows.clickPrevious();

        expect(swiper.slideCoord(4)).toBe(0);

        swiperArrows.clickNext();
        expect(swiper.slideCoord(5)).toBe(0);

    });

    it ("changes arrows active status properly for finite slider", function() {
        sliderRegular(false);

        let swiperArrows = new SwiperArrowsController(swiper, false);

        swiperArrows.init();

        expect(swiperArrows.arrowPreviousIsActive).toBe(false);
        expect(swiperArrows.arrowNextIsActive).toBe(true);

        swiperArrows.clickNext();

        expect(swiperArrows.arrowPreviousIsActive).toBe(true);

        swiperArrows.clickNext();
        swiperArrows.clickNext();
        swiperArrows.clickNext();
        expect(swiperArrows.arrowNextIsActive).toBe(false);
    });

    it ("changes arrows active status properly for infinite slider", function() {
        sliderRegular(true);

        let swiperArrows = new SwiperArrowsController(swiper, false);

        swiperArrows.init();

        expect(swiperArrows.arrowPreviousIsActive).toBe(true);
        expect(swiperArrows.arrowNextIsActive).toBe(true);

        swiperArrows.clickNext();

        expect(swiperArrows.arrowPreviousIsActive).toBe(true);

        swiperArrows.clickNext();
        swiperArrows.clickNext();
        swiperArrows.clickNext();
        expect(swiperArrows.arrowNextIsActive).toBe(true);
    });
});