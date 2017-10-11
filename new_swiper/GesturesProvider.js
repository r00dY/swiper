let Hammer = require('hammerjs');
let AbstractSwiper = require('./AbstractSwiperNEW');
let VerticalScrollDetector = require("../VerticalScrollDetector.js");


export default class GesturesProvider {
    constructor(options, container) {
        /** options = {direction} */

        this._mc = new Hammer(container, {domEvents: true});

        this._isTouched = false;

        this._options = {
            direction: AbstractSwiper.HORIZONTAL,
            onPanStart: function () {
            },
            onPanEnd: function () {
            },
        };
        for (let key in options) {
            if (!options.hasOwnProperty(key)) {
                continue;
            }
            this._options[key] = options[key];
        }

        // @TODO - remove from AbstractSwiper
        this._panStartPos = 0;

    }

    enable(swiper) {
        var swiped = false;
        var _this = this;

        var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;

        this._mc.get('pan').set({direction: hammerDirection, threshold: 20});
        this._mc.get('swipe').set({direction: hammerDirection, threshold: 20});

        function onPanStart() {
            if (_this._isTouched) {
                return;
            }
            _this._options.onPanStart();
            _this._isTouched = true;
            swiped = false;
            swiper._killAnimations();
            _this._panStartPos = swiper._pos;
            swiper.setStill(false);
        }

        _this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", function (ev) {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }

            var delta = _this._options.direction == AbstractSwiper.HORIZONTAL ? ev.deltaX : ev.deltaY;

            switch (ev.type) {
                // case "swipeleft":
                // case "swipeup":
                //
                //     if (_this._isTouched) {
                //         var v = Math.abs(ev.velocityX) * 1000;
                //         var newPos = swiper._getNextPositionFromVelocity(v);
                //         swiper.moveTo(newPos);
                //
                //         swiped = true;
                //     }
                //
                //     break;
                //
                //
                // case "swiperight":
                // case "swipedown":
                //
                //     if (_this._isTouched) {
                //
                //         var v = -Math.abs(ev.velocityX) * 1000;
                //         var newPos = swiper._getNextPositionFromVelocity(v);
                //         swiper.moveTo(newPos);
                //         swiped = true;
                //     }
                //
                //     break;

                case "panup":
                case "pandown":
                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _this._isTouched is false, Android would too eagerly start "panning" instaed of waiting for scroll.
                    if (!_this._isTouched) {
                        return;
                    }

                case "panleft":
                case "panright":
                    if (VerticalScrollDetector.isScrolling()) {
                        break;
                    } // if body is scrolling then not allow for horizontal movement
                    onPanStart(); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

                    if (_this._isTouched && !swiped) {
                        swiper._pan(delta, _this._panStartPos);
                    }

                    break;

                case "panend":

                    if (_this._isTouched) {
                        _this._options.onPanEnd();
                        _this._isTouched = false;

                        if (!swiped) {
                            var pos = swiper._pos;
                            if (_this._options.freefloat && !_this._options.infinite) {
                                pos = swiper._normalizePos(pos, false);
                            } else if (!_this._options.freefloat) {
                                pos = swiper._getClosestSnappedPosition(pos);
                            }

                            swiper.moveTo(pos);
                        }
                        swiped = false;
                    }
                    break;
            }
        });
    }

    unblockScrolling() {
        var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;
        this._mc.get('pan').set({direction: hammerDirection});
        this._mc.get('swipe').set({direction: hammerDirection});
    }


    blockScrolling() {
        this._mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
    }
}
