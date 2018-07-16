let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");

let NewSwiper = require("./NewSwiper");

class AbstractSwiper2 {

    constructor(name) {
        this._name = name;

        this._eventListeners = {
            'move': [],
            'animationStart': [],
            'animationEnd': [],
            'stillnessChange': [],
            'touchup': [],
            'touchdown': [],
        };

        this._isTouched = false;
        this._isStill = true;
    }

    layout() {
        this._swiper = new NewSwiper();
        if (typeof this.containerSize !== "undefined") { this._swiper.containerSize = this.containerSize; }
        if (typeof this.count !== "undefined") { this._swiper.count = this.count; }
        if (typeof this.slideSizeFunction !== "undefined") { this._swiper.slideSizeFunction = this.slideSizeFunction; }
        if (typeof this.slideMarginFunction !== "undefined") { this._swiper.slideMarginFunction = this.slideMarginFunction; }
        if (typeof this.slideSnapOffsetFunction !== "undefined") { this._swiper.slideSnapOffsetFunction = this.slideSnapOffsetFunction; }
        if (typeof this.leftOffset !== "undefined") { this._swiper.leftOffset = this.leftOffset; }
        if (typeof this.rightOffset !== "undefined") { this._swiper.rightOffset = this.rightOffset; }
        if (typeof this.overscrollFunction !== "undefined") { this._swiper.overscrollFunction = this.overscrollFunction; }
        if (typeof this.infinite !== "undefined") { this._swiper.infinite = this.infinite; }
        if (typeof this.animationEase !== "undefined") { this._swiper.animationEase = this.animationEase; }
        if (typeof this.animationTime !== "undefined") { this._swiper.animationTime = this.animationTime; }
        if (typeof this.snapOnlyToAdjacentSlide !== "undefined") { this._swiper.snapOnlyToAdjacentSlide = this.snapOnlyToAdjacentSlide; }

        this._swiper.addEventListener('move', () => { this._runEventListeners('move'); });
        this._swiper.addEventListener('animationStart', () => { this._runEventListeners('animationStart'); });
        this._swiper.addEventListener('animationEnd', () => { this._runEventListeners('animationEnd'); });
        this._swiper.addEventListener('stillnessChange', () => { this._runEventListeners('stillnessChange'); });
        this._swiper.addEventListener('touchup', () => { this._runEventListeners('touchup'); });
        this._swiper.addEventListener('touchdown', () => { this._runEventListeners('touchdown'); });

        this._swiper.init();
    }

    addEventListener(event, callback) {
        this._eventListeners[event].push(callback);
    }

    enableTouch() {
        if (this._enabled) { return; }
        this._enabled = true;

        this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), { domEvents: false });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});

        let swiped = false;

        this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", (ev) => {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }

            let delta = ev.deltaX;

            switch (ev.type) {
                case "swipeleft":
                case "swipeup":

                    if (this._isTouched) {
                        this._swiper.snap(Math.abs(ev.velocityX) * 1000, true);
                        swiped = true;
                    }

                    break;

                case "swiperight":
                case "swipedown":

                    if (this._isTouched) {
                        this._swiper.snap(-Math.abs(ev.velocityX) * 1000, true);
                        swiped = true;
                    }

                    break;

                case "panstart":
                    break;

                case "panup":
                case "pandown":
                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _this._isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
                    if (!this._isTouched) {
                        return;
                    }

                case "panleft":
                case "panright":
                    if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement

                    if (!this._isTouched) {

                        this._swiper.touchdown();

                        document.querySelector(this._getSelectorForComponent('touch-space')).classList.add('panning'); // adds 'panning' class which prevents links from being clicked.

                        this._blockScrolling();

                        this._isTouched = true;
                        swiped = false;

                        this._swiper.stopMovement();
                        this._panStartPos = this._swiper.pos;
                    }

                    if (this._isTouched && !swiped) {
                        this._swiper.moveTo(this._panStartPos - delta, false);
                    }

                    break;

                case "panend":

                    if (this._isTouched) {

                        this._swiper.touchup();

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            document.querySelector(this._getSelectorForComponent('touch-space')).classList.remove('panning');
                        }, 0);

                        this._unblockScrolling();

                        this._isTouched = false;

                        if (!swiped) {
                            this._swiper.snap(0, true);
                        }

                        swiped = false;
                    }
                    break;
            }
        });

    }

    disableTouch() {
        if (!this._enabled) {
            return;
        }
        this._enabled = false;

        this._mc.destroy();
        this._mc = undefined;
    }

    isTouched() {
        return this._swiper.isTouched();
    }

    isStill() {
        return this._swiper.isStill();
    }

    _blockScrolling() {
        if (this._mc) {
            this._mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
            this._mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
        }
    };

    _unblockScrolling() {
        if (this._mc) {
            this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL});
            this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL});
        }
    };

    _runEventListeners(event) {
        this._eventListeners[event].forEach((callback) => {
            callback();
        });
    }

    _getSelectorForComponent(component) {
        return '.swiper-' + component + '[data-swiper="' + this._name + '"]';
    }

}


module.exports = AbstractSwiper2;