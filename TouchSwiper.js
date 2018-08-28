let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");

let SwiperEngine = require("./SwiperEngine");

class TouchSwiper extends SwiperEngine {

    constructor(name) {
        super();

        this._name = name;
        this._touchSpace = document.querySelector(this._getSelectorForComponent('touch-space'));
    }

    enableTouch() {
        if (this._enabled) { return; }
        this._enabled = true;

        this._mc = new Hammer(this._touchSpace, { domEvents: false });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});

        let swiped = false;

        let isTouched = false;
        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };

        // Preventing dragging of links and img might be "wanted effect"!!! That's why we don't set user-drag on all children of slider.
        // Maybe on desktop we want items in slider to be draggable? And we want to disable touch? It should be done by slider developer.
        // maybe we should make this user-drag on all children
        // Users can easily do this in CSS for only touch devices. Easy.

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

                        this._blockScrolling();

                        isTouched = true;
                        swiped = false;

                        this.stopMovement();
                        this._panStartPos = this.pos;

                        this._touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback
                    }

                    if (isTouched && !swiped) {
                        this.moveTo(this._panStartPos - delta, false);
                    }

                    break;

                case "panend":

                    if (isTouched) {

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            this._touchSpace.removeEventListener('click', stopPropagationCallback, true);
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


module.exports = TouchSwiper;