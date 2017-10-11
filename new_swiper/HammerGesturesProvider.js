let AbstractSwiper = require('../AbstractSwiper');
let VerticalScrollDetector = require("../VerticalScrollDetector.js");
let Hammer = require("hammerjs");

export default class HammerGesturesProvider {
    constructor(selector, _options, animationsProvider) {

        /** options = {direction, freefloat, infinite, onPanStart, onPanEnd} */
        this._mc = new Hammer(document.querySelector(selector), { domEvents: true });
        this._options = _options;
        this.hammerDirection = _options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;
        this._enabled = false;
        this._isStill = false;
        this.animationsProvider = animationsProvider;
        this.swiped = false;
        this._panStartPos = 0;
    }
    blockScrolling() {
        this._mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this._mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    }
    unblockScrolling() {
        let hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;
        this._mc.get('pan').set({ direction: hammerDirection });
        this._mc.get('swipe').set({ direction: hammerDirection });
    }

    enable(swiper) {
        if (this._enabled) { return; }
        this._enabled = true;

        this._mc.get('pan').set({ direction: this.hammerDirection, threshold: 20 });
        this._mc.get('swipe').set({ direction: this.hammerDirection, threshold: 20 });

        let _this = this;

        this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", function(ev) {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") { return; }
            var delta = _this._options.direction == AbstractSwiper.HORIZONTAL ? ev.deltaX : ev.deltaY;

            switch (ev.type) {
                case "panstart":
                    console.log('panstart');
                    console.log(swiper.getCurrentPosition());
                    break;
                case "swipeleft":
                case "swipeup":
                    if (!_this._isTouched) {
                        break;
                    }

                    var v = Math.abs(ev.velocityX) * 1000;
                    var newPos = swiper._getNextPositionFromVelocity(v);
                    swiper.moveTo(newPos);

                    _this.swiped = true;
                    break;

                case "swiperight":
                case "swipedown":
                    if (!this._isTouched) {
                        break;
                    }
                        var v = -Math.abs(ev.velocityX) * 1000;
                        var newPos = swiper._getNextPositionFromVelocity(v);
                        swiper.moveTo(newPos);
                        _this.swiped = true;
                    break;
                case "panstart":
                    break;

                case "panup":
                case "pandown":
                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when this._isTouched is false, Android would too eagerly start "panning" instaed of waiting for scroll.
                    if (!_this._isTouched) { return; }

                case "panleft":
                case "panright":
                    if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
                    _this._onPanStart(swiper.getCurrentPosition()); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved
                    if (_this._isTouched && !_this.swiped) {
                        swiper._updatePos(delta - _this._panStartPos);
                    }
                    break;

                case "panend":
                    if (_this._isTouched) {
                        _this._options.onPanEnd();
                        _this._isTouched = false;

                        if (!this.swiped) {
                            var pos = swiper.getCurrentPosition();
                            if (_this._options.freefloat && !this._options.infinite) {
                                pos = swiper._normalizePos(pos, false);
                            }
                            else if (!_this._options.freefloat) {
                                pos = swiper._getClosestSnappedPosition(pos);
                            }

                            swiper.moveTo(pos);
                        }
                        _this.swiped = false;
                    }
                    console.log('panend');
                    console.log(swiper.getCurrentPosition());
                    break;
            }
        });
    }

    disable() {
        if (!this._enabled) { return; }
        this._enabled = false;
        this._mc.off("pan panup panleft panright pandown panstart panend swipe swipeleft swiperight swipeup swipedown");
    }

    _onPanStart(pos) {
        if (!this._isTouched) {
            this._options.onPanStart();
            this._isTouched = true;
            this.swiped = false;
            this.animationsProvider.killAnimations();
            this._panStartPos = pos;
            this.animationsProvider.setStill(this, false);
        }
    }
}
