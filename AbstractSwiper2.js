let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");











var AbstractSwiper = function (optionsArg) {
    var _this = this;

    /**
     * Resolve options
     */
    if (typeof optionsArg === 'undefined') {
        optionsArg = {}
    }


    var defaultOptions = {
        name: undefined, // must be unique

        direction: AbstractSwiper.HORIZONTAL,

        animationEase: Expo.easeOut,
        animationTime: 0.6,

        count: undefined,

        containerSize: function () {
            throw "AbstractSwiper: undefined containerSize function!";
        }, // relativeX is relatively to this size!!!
        // initMarginSize: function() { return 0; }, // function!
        slideMarginSize: function () {
            return 0;
        }, // function!
        slideSize: function () {
            throw "AbstractSwiper: undefined slideSize function!";
        }, // function!
        snapOffset: function () {
            return 0;
        },

        // callbacks - all deprecated
        // Use .on method instead
        onMove: function () {
        },
        onPanStart: function () {
        },
        onPanEnd: function () {
        },
        onStillChange: function () {
        },
        onActiveSlidesChange: function () {
        },

        // miscellaneous
        numberOfItemsMovedAtOneAction: null,//function() { return 1; },
        // numberOfActiveSlides: 1,
        // shouldShowSingleDot: false,

        counterTransformer: function (num) {
            return "" + num;
        },

        autoLayoutOnResize: true,

        infinite: false,

        snapOnlyToAdjacentSlide: true,

        freefloat: false
    };

    this._options = defaultOptions;

    for (var key in optionsArg) {
        if (!optionsArg.hasOwnProperty(key)) {
            continue;
        }
        this._options[key] = optionsArg[key];
    }



    this._onResizeCallback = function () {
        this.layout();
    };

    window.addEventListener('resize', function () {
        if (!_this._options.autoLayoutOnResize) {
            return;
        }

        _this._onResizeCallback();
    });

    /**
     * Others
     */
    this._isTouched = false; // true if touch gesture is in progress
    this._isStill = true; // true if at peace - this means that slider is still and there's no touch event active.

    this._animations = [];

    this._panStartPos = 0;
    this._enabled = false;

    /**
     * Listeners object
     */
    this.listeners = {};

    this._resetCache();
};

AbstractSwiper.HORIZONTAL = 0;
AbstractSwiper.VERTICAL = 1;


/** Helper methods */
AbstractSwiper.prototype._getSelectorForComponent = function (component) {
    return '.swiper-' + component + '[data-swiper="' + this._options.name + '"]';
}

AbstractSwiper.prototype._getMaxTargetSlide = function () {
    if (this._options.infinite) {
        throw "_getMaxTargetSlide method not available in infinite mode"
    }
    ;

    if (this._options.length == 1) {
        return 0;
    } // if 1 slide, then its max target slide

    for (var i = 1; i < this._options.length; i++) {
        if (this._getSlideSnapPos(i) == this._getMaxPos()) {
            return i;
        }
    }

    return this._options.count - 1; // last by default
}


AbstractSwiper.prototype.layout = function () {

    this._killAnimations(); // stop all ongoing animations after resize!

    this._resetCache(); // Reset cache

    // There's a chance that number of items was changed, so let's normalize position.
    var newPos = this._relativePos * this._getValueFromOptions('containerSize');

    // For finite sliders, we can't exceed max position
    if (!this._options.infinite && newPos > this._getMaxPos()) {
        newPos = this._getMaxPos();
    }

    // For no freefloat, we must snap!
    if (!this._options.freefloat) {
        newPos = this._getClosestSnappedPosition(newPos);
    }

    this._updatePos(newPos);
};


AbstractSwiper.prototype._blockScrolling = function () {
    if (this._mc) {
        this._mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
    }
};

AbstractSwiper.prototype._unblockScrolling = function () {
    if (this._mc) {
        var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;
        this._mc.get('pan').set({direction: hammerDirection});
        this._mc.get('swipe').set({direction: hammerDirection});
    }
};

AbstractSwiper.prototype.enable = function () {
    var _this = this;

    if (this._enabled) {
        return;
    }
    this._enabled = true;

    this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), {domEvents: false});

    var swiped = false;

    var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;

    this._mc.get('pan').set({direction: hammerDirection, threshold: 20});
    this._mc.get('swipe').set({direction: hammerDirection, threshold: 20});

    function onPanStart(ev) {

        if (!_this._isTouched) {

            // Add 'panning' class

            document.querySelector(_this._getSelectorForComponent('touch-space')).classList.add('panning');

            // Events onPanStart
            _this._options.onPanStart();
            _this._invokeListeners('touchdown');

            _this._isTouched = true;
            swiped = false;

            _this._killAnimations();

            _this._panStartPos = _this._pos;

            _this.setStill(false);
        }
    }

    _this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", function (ev) {

        // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
        // https://github.com/hammerjs/hammer.js/issues/1050
        if (ev.srcEvent.type == "pointercancel") {
            return;
        }

        var delta = _this._options.direction == AbstractSwiper.HORIZONTAL ? ev.deltaX : ev.deltaY;

        switch (ev.type) {
            case "swipeleft":
            case "swipeup":

                if (_this._isTouched) {
                    var v = Math.abs(ev.velocityX) * 1000;
                    var newPos = _this._getNextPositionFromVelocity(v);
                    _this.moveTo(newPos);

                    swiped = true;
                }

                break;


            case "swiperight":
            case "swipedown":

                if (_this._isTouched) {

                    var v = -Math.abs(ev.velocityX) * 1000;
                    var newPos = _this._getNextPositionFromVelocity(v);
                    _this.moveTo(newPos);
                    swiped = true;
                }

                break;
            case "panstart":
                break;


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


                onPanStart(ev); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

                if (_this._isTouched && !swiped) {
                    _this._pan(delta, _this._panStartPos);
                }

                break;

            case "panend":

                if (_this._isTouched) {

                    // Remove panning class when we're not touching slider
                    setTimeout(function () {
                        document.querySelector(_this._getSelectorForComponent('touch-space')).classList.remove('panning');
                    }, 0);

                    // Events touchup.
                    _this._options.onPanEnd(); // deprecated
                    _this._invokeListeners('touchup'); // new way

                    _this._isTouched = false;

                    if (!swiped) {

                        var pos = _this._pos;

                        if (_this._options.freefloat && !_this._options.infinite) {
                            pos = this._normalizePos(pos, false);
                        }
                        else if (!_this._options.freefloat) {
                            pos = _this._getClosestSnappedPosition(pos);
                        }

                        _this.moveTo(pos);
                    }

                    swiped = false;
                }
                break;
        }
    });
};

AbstractSwiper.prototype.disable = function () {
    if (!this._enabled) {
        return;
    }
    this._enabled = false;

    this._mc.destroy();
    this._mc = undefined;
}

AbstractSwiper.prototype.goToNext = function (animated) {

    if (this._options.numberOfItemsMovedAtOneAction == null) {
        this.moveTo(this._getClosestSnappedPosition(this._pos + this._getValueFromOptions('containerSize')));
        return;
    }

    this.goTo(this._getSlideFromOffset((this._options.numberOfItemsMovedAtOneAction)()), animated, 1);
}

AbstractSwiper.prototype.goToPrevious = function (animated) {

    if (this._options.numberOfItemsMovedAtOneAction == null) {
        this.moveTo(this._getClosestSnappedPosition(this._pos - this._getValueFromOptions('containerSize')));
        return;
    }

    this.goTo(this._getSlideFromOffset(-(this._options.numberOfItemsMovedAtOneAction)()), animated, -1);
}

AbstractSwiper.prototype._getSlideFromOffset = function (offset) {

    var leftMostActiveSlide = this.getActiveSlides()[0];
    var newSlide = leftMostActiveSlide + offset;

    if (this._options.infinite) {

        newSlide = newSlide % this._options.count;
        if (newSlide < 0) {
            newSlide += this._options.count
        }
    }

    else {

        if (newSlide < 0) {
            newSlide = 0;
        }
        else if (newSlide > this._getMaxTargetSlide()) {
            newSlide = this._getMaxTargetSlide();
        }
    }

    return newSlide;
}


AbstractSwiper.prototype._pan = function (deltaX, startX) {
    this._updatePos(startX - deltaX);
}


/**
 * LISTENERS
 */
AbstractSwiper.prototype.on = function (event, listener) {
    if (typeof this.listeners[event] === 'undefined') {
        this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
}

AbstractSwiper.prototype._invokeListeners = function (event, p1, p2, p3, p4) {
    if (typeof this.listeners[event] === 'undefined') {
        return;
    }

    this.listeners[event].forEach(function (listener) {
        listener(p1, p2, p3, p4);
    });
}




module.exports = AbstractSwiper;
