import SwiperArrowsController from "./SwiperArrowsController";
import EventSystem from "./EventSystem";

class SwiperArrows {

    constructor(swiper, animated = true) {
        EventSystem.register(this);
        EventSystem.addEvent(this, 'clickSpaceNextClicked');
        EventSystem.addEvent(this, 'clickSpacePreviousClicked');

        this.swiper = swiper;
        this.animated = animated;
        this.swiperArrowsController = new SwiperArrowsController(this.swiper);

        this.clickNextListener = () => {
            this.swiperArrowsController.clickNext();
            this._runEventListeners('clickSpaceNextClicked');
        };

        this.clickPreviousListener = () => {
            this.swiperArrowsController.clickPrevious();
            this._runEventListeners('clickSpacePreviousClicked');
        }
    }

    init(arrowLeft, arrowRight) {
        this._clickSpacePrevious = arrowLeft ? arrowLeft : document.querySelector(this.swiper._getSelectorForComponent('click-space-previous'));
        this._clickSpaceNext = arrowRight ? arrowRight : document.querySelector(this.swiper._getSelectorForComponent('click-space-next'));

        if (this._clickSpaceNext) {
            this.swiperArrowsController.addEventListener('arrowNextActiveStatusChanged', (active) => {
                active ?
                    this._clickSpaceNext.classList.add('active') :
                    this._clickSpaceNext.classList.remove('active');
            });
            this._clickSpaceNext.addEventListener('click', this.clickNextListener);
        }

        if (this._clickSpacePrevious) {
            this.swiperArrowsController.addEventListener('arrowPreviousActiveStatusChanged', (active) => {
                active ?
                    this._clickSpacePrevious.classList.add('active') :
                    this._clickSpacePrevious.classList.remove('active');
            });
            this._clickSpacePrevious.addEventListener('click', this.clickPreviousListener);
        }

        this.swiperArrowsController.init();
    }

    deinit() {
        // Unbind clicks on next / previous
        if (this._clickSpaceNext) {
            this._clickSpaceNext.removeEventListener('click', this.clickNextListener);
        }

        if (this._clickSpacePrevious) {
            this._clickSpacePrevious.removeEventListener('click', this.clickPreviousListener);
        }
    }

}

export default SwiperArrows;