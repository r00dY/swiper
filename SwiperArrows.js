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
                    this.swiper.moveLeft(true);
                }

                this._runEventListeners('clickSpaceNextClicked');
            };

            this._clickSpaceNext.addEventListener('click', this._clickSpaceNextOnClickListener);
        }

        if (this._clickSpacePrevious) {

            this._clickSpacePreviousOnClickListener = (e) => {
                e.preventDefault();

                if (this._clickSpacePrevious.classList.contains("active")) {
                    this.swiper.moveRight(true);
                }

                this._runEventListeners('clickSpacePreviousClicked');
            };

            this._clickSpacePrevious.addEventListener('click', this._clickSpacePreviousOnClickListener);
        }
    }

    _onUpdate() {
        //!!! TODO
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