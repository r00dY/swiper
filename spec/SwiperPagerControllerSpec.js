import AbstractSlider from "../src/AbstractSlider";
import SwiperPagerController from "../src/components/pager/SwiperPagerController";

let swiper;

function sliderRegular(infinite) {
    swiper = new AbstractSlider();

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

describe("SwiperPagerController (no animations / finite mode)", function() {

    it("changes properly active elements", function() {
        sliderRegular(true);

        let pagerController = new SwiperPagerController(swiper, false);

        pagerController.init();

        expect(pagerController.activeElements).toEqual([0]);

        pagerController.elementClicked(2);

        expect(pagerController.activeElements).toEqual([2]);
    });
});