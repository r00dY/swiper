let EventSystem = require("./EventSystem");
let SwiperArrowsController = require("./SwiperArrowsController");

class SwiperArrows {

    constructor(swiper) {
        this.swiper = swiper;
        this.swiperArrowsController = new SwiperArrowsController(this.swiper);

        this.clickNextListener = this.swiperArrowsController.clickNext.bind(this.swiperArrowsController);
        this.clickPreviousListener = this.swiperArrowsController.clickPrevious.bind(this.swiperArrowsController);
    }

    init() {
        this._clickSpacePrevious = document.querySelector(this.swiper._getSelectorForComponent('click-space-previous'));
        this._clickSpaceNext = document.querySelector(this.swiper._getSelectorForComponent('click-space-next'));

        this.swiperArrowsController.addEventListener('arrowNextActiveStatusChanged', (active) => {
            if (this._clickSpaceNext) {
                active ?
                    this._clickSpaceNext.classList.add('active') :
                    this._clickSpaceNext.classList.remove('active');
            }
        });

        this.swiperArrowsController.addEventListener('arrowPreviousActiveStatusChanged', (active) => {
            if (this._clickSpacePrevious) {
                active ?
                    this._clickSpacePrevious.classList.add('active') :
                    this._clickSpacePrevious.classList.remove('active');
            }
        });

        if (this._clickSpaceNext) {
            this._clickSpaceNext.addEventListener('click', this.clickNextListener);
        }

        if (this._clickSpacePrevious) {
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

module.exports = SwiperArrows;