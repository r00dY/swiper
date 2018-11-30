import EventSystem from "../../helpers/EventSystem";

class SwiperArrowsController {

    constructor(swiper, animated) {
        EventSystem.register(this);
        EventSystem.addEvent(this, 'arrowNextActiveStatusChanged');
        EventSystem.addEvent(this, 'arrowPreviousActiveStatusChanged');

        this.swiper = swiper;
        this.animated = animated;

        this.clickNext.bind(this);
        this.clickPrevious.bind(this);

        this.arrowNextIsActive = false;
        this.arrowPreviousIsActive = false;

        if (this.swiper.infinite) {
            this.arrowNextIsActive = true;
            this.arrowPreviousIsActive = true;
        }

        this.moveListener = () => {
            this._setActiveState();
        };
    }

    init() {
        if (!this.swiper.infinite) {
            this.swiper.addEventListener('move', this.moveListener);
            this._setActiveState();
        } else {
            this._runEventListeners('arrowNextActiveStatusChanged', true);
            this._runEventListeners('arrowPreviousActiveStatusChanged', true);
        }
    }

    clickNext() {
        this.swiper.moveRight(this.animated);
    }

    clickPrevious() {
        this.swiper.moveLeft(this.animated);
    }

    deinit() {
        this.swiper.removeEventListener('move', this.moveListener);
    }

    _setActiveState() {

        let activeSlides = this.swiper.activeSlides();

        // previous arrow
        if (activeSlides[0] === 0) {
            this.arrowPreviousIsActive = false;
            this._runEventListeners('arrowPreviousActiveStatusChanged', false);
        }

        if(activeSlides[0] !== 0) {
            this.arrowPreviousIsActive = true;
            this._runEventListeners('arrowPreviousActiveStatusChanged', true);
        }

        // next arrow
        if (activeSlides[activeSlides.length - 1] === this.swiper.count - 1) {
            this.arrowNextIsActive = false;
            this._runEventListeners('arrowNextActiveStatusChanged', false);
        }

        if(activeSlides[activeSlides.length - 1] !== this.swiper.count - 1) {
            this.arrowNextIsActive = true;
            this._runEventListeners('arrowNextActiveStatusChanged', true);
        }
    }
}

export default SwiperArrowsController;