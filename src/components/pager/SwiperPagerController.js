import EventSystem from "../../helpers/EventSystem";

class SwiperPagerController {
    constructor(swiper, animated) {
        this.swiper = swiper;
        this.animated = animated;
        this.activeElements = [];
        EventSystem.register(this);
        EventSystem.addEvent(this, 'activeElementsChanged');

        this.swiper.addEventListener('activeSlidesChange', () => {
            this._activeElementsChanged();
        });
    }

    init() {
        this.activeElements = this.swiper.activeSlides();
    }

    elementClicked(elementIndex) {
        this.swiper.moveToSlide(elementIndex, this.animated);
        this._activeElementsChanged();
    }

    _activeElementsChanged() {
        this.activeElements = this.swiper.activeSlides();
        this._runEventListeners('activeElementsChanged', this.activeElements);
    }
}

export default SwiperPagerController;