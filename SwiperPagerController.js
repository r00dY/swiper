
class SwiperPagerController {
    constructor(swiper) {
        this.swiper = swiper;
    }

    elementClicked(elementIndex) {
        this.swiper.moveToSlide(elementIndex);
    }
}

module.exports = SwiperPagerController;