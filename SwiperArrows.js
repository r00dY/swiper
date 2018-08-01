let EventSystem = require("./EventSystem");

class SwiperArrows {

    constructor(swiper) {
        this.swiper = swiper;

        EventSystem.register(this);
        EventSystem.addEvent(this, 'clickSpaceNextClicked');
        EventSystem.addEvent(this, 'clickSpacePreviousClicked');
    }

    init() {
        this._clickSpacePrevious = document.querySelector(this.swiper._getSelectorForComponent('click-space-previous'));
        this._clickSpaceNext = document.querySelector(this.swiper._getSelectorForComponent('click-space-next'));

        if (this._clickSpaceNext) {

            this._clickSpaceNextOnClickListener = (e) => {
                e.preventDefault();

                if (this._clickSpaceNext.classList.contains('active')) {
                    this.swiper.moveRight(true);
                }

                this._runEventListeners('clickSpaceNextClicked');
            };

            this._clickSpaceNext.addEventListener('click', this._clickSpaceNextOnClickListener);
        }

        if (this._clickSpacePrevious) {

            this._clickSpacePreviousOnClickListener = (e) => {
                e.preventDefault();

                if (this._clickSpacePrevious.classList.contains("active")) {
                    this.swiper.moveLeft(true);
                }

                this._runEventListeners('clickSpacePreviousClicked');
            };

            this._clickSpacePrevious.addEventListener('click', this._clickSpacePreviousOnClickListener);
        }

        this.swiper.addEventListener('move', () => {
            this._setUpActiveClassOnArrowElements();
        });
        
        this._setUpActiveClassOnArrowElements();
    }

    _setUpActiveClassOnArrowElements() {
        let activeSlides = this.swiper.activeSlides();

        if (!this.swiper.infinite && activeSlides[0] === 0) {
            this._clickSpacePrevious.classList.remove('active');
        } else {
            this._clickSpacePrevious.classList.add('active');
        }

        if (!this.swiper.infinite && activeSlides[activeSlides.length - 1] === this.swiper.count - 1) {
            this._clickSpaceNext.classList.remove('active');
        } else {
            this._clickSpaceNext.classList.add('active');
        }
    }

    deinit() {
        // Unbind clicks on next / previous
        if (this._clickSpaceNext) {
            this._clickSpaceNext.removeEventListener('click', this._clickSpaceNextOnClickListener);
        }

        if (this._clickSpacePrevious) {
            this._clickSpacePrevious.removeEventListener('click', this._clickSpacePreviousOnClickListener);
        }
    }

}

module.exports = SwiperArrows;