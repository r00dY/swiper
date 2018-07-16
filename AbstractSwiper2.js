let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");

let NewSwiper = require("./NewSwiper");

class AbstractSwiper2 extends NewSwiper {

    constructor(name) {
        super();

        this._name = name;
    }

    enableTouch() {
        if (this._enabled) { return; }
        this._enabled = true;

        this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), { domEvents: false });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});

        let swiped = false;

        let isTouched = false;

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

                    if (isTouched) {
                        this.snap(Math.abs(ev.velocityX) * 1000, true);
                        swiped = true;
                    }

                    break;

                case "swiperight":
                case "swipedown":

                    if (isTouched) {
                        this.snap(-Math.abs(ev.velocityX) * 1000, true);
                        swiped = true;
                    }

                    break;

                case "panstart":
                    break;

                case "panup":
                case "pandown":
                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
                    if (!isTouched) {
                        return;
                    }

                case "panleft":
                case "panright":
                    if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement

                    if (!isTouched) {

                        this.touchdown();

                        document.querySelector(this._getSelectorForComponent('touch-space')).classList.add('panning'); // adds 'panning' class which prevents links from being clicked.

                        this._blockScrolling();

                        isTouched = true;
                        swiped = false;

                        this.stopMovement();
                        this._panStartPos = this.pos;
                    }

                    if (isTouched && !swiped) {
                        this.moveTo(this._panStartPos - delta, false);
                    }

                    break;

                case "panend":

                    if (isTouched) {

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            document.querySelector(this._getSelectorForComponent('touch-space')).classList.remove('panning');
                        }, 0);

                        this._unblockScrolling();

                        isTouched = false;

                        if (!swiped) {
                            this.snap(0, true);
                        }

                        swiped = false;

                        this.touchup();
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

    _getSelectorForComponent(component) {
        return '.swiper-' + component + '[data-swiper="' + this._name + '"]';
    }

}


module.exports = AbstractSwiper2;