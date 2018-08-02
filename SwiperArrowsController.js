let EventSystem = require("./EventSystem");

class SwiperArrowsController {

    constructor(swiper) {
        EventSystem.register(this);
        EventSystem.addEvent(this, 'clickSpaceNextClicked');
        EventSystem.addEvent(this, 'clickSpacePreviousClicked');
        EventSystem.addEvent(this, 'arrowNextActiveStatusChanged');
        EventSystem.addEvent(this, 'arrowPreviousActiveStatusChanged');

        this.swiper = swiper;

        this.clickNext.bind(this);
        this.clickPrevious.bind(this);

        this._arrowNextIsActive = false;
        this._arrowPreviousIsActive = false;
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
        this.swiper.moveRight(true);
        this._runEventListeners('clickSpaceNextClicked');
    }

    clickPrevious() {
        this.swiper.moveLeft(true);
        this._runEventListeners('clickSpacePreviousClicked');
    }

    _setActiveState() {

        let activeSlides = this.swiper.activeSlides();

        // previous arrow
        if (this._arrowPreviousIsActive && activeSlides[0] === 0) {
            this._arrowPreviousIsActive = false;
            this._runEventListeners('arrowPreviousActiveStatusChanged', false);
        }

        if(!this._arrowPreviousIsActive && activeSlides[0] !== 0) {
            this._arrowPreviousIsActive = true;
            this._runEventListeners('arrowPreviousActiveStatusChanged', true);
        }

        // next arrow
        if (this._arrowNextIsActive && activeSlides[activeSlides.length - 1] === this.swiper.count - 1) {
            this._arrowNextIsActive = false;
            this._runEventListeners('arrowNextActiveStatusChanged', false);
        }

        if(!this._arrowNextIsActive && activeSlides[activeSlides.length - 1] !== this.swiper.count - 1) {
            this._arrowNextIsActive = true;
            this._runEventListeners('arrowNextActiveStatusChanged', true);
        }
    }
}

module.exports = SwiperArrowsController;