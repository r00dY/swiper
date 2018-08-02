let EventSystem = require("./EventSystem");

class SwiperArrowsController {

    constructor(swiper, animated) {
        EventSystem.register(this);
        EventSystem.addEvent(this, 'clickSpaceNextClicked');
        EventSystem.addEvent(this, 'clickSpacePreviousClicked');
        EventSystem.addEvent(this, 'arrowNextActiveStatusChanged');
        EventSystem.addEvent(this, 'arrowPreviousActiveStatusChanged');

        this.swiper = swiper;
        this.animated = animated;

        this.clickNext.bind(this);
        this.clickPrevious.bind(this);

        this.arrowNextIsActive = false;
        this.arrowPreviousIsActive = false;
    }

    init() {
        if (!this.swiper.infinite) {
            this.swiper.addEventListener('move', () => {
                this._setActiveState();
            });
            this._setActiveState();
        } else {
            this._runEventListeners('arrowNextActiveStatusChanged', true);
            this._runEventListeners('arrowPreviousActiveStatusChanged', true);
        }
    }

    clickNext() {
        this.swiper.moveRight(this.animated);
        this._runEventListeners('clickSpaceNextClicked');
    }

    clickPrevious() {
        this.swiper.moveLeft(this.animated);
        this._runEventListeners('clickSpacePreviousClicked');
    }

    _setActiveState() {

        let activeSlides = this.swiper.activeSlides();

        // previous arrow
        if (this.arrowPreviousIsActive && activeSlides[0] === 0) {
            this.arrowPreviousIsActive = false;
            this._runEventListeners('arrowPreviousActiveStatusChanged', false);
        }

        if(!this.arrowPreviousIsActive && activeSlides[0] !== 0) {
            this.arrowPreviousIsActive = true;
            this._runEventListeners('arrowPreviousActiveStatusChanged', true);
        }

        // next arrow
        if (this.arrowNextIsActive && activeSlides[activeSlides.length - 1] === this.swiper.count - 1) {
            this.arrowNextIsActive = false;
            this._runEventListeners('arrowNextActiveStatusChanged', false);
        }

        if(!this.arrowNextIsActive && activeSlides[activeSlides.length - 1] !== this.swiper.count - 1) {
            this.arrowNextIsActive = true;
            this._runEventListeners('arrowNextActiveStatusChanged', true);
        }
    }
}

module.exports = SwiperArrowsController;