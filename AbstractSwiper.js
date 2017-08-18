var Hammer = require("hammerjs");
require("gsap");
var VerticalScrollDetector = require("./VerticalScrollDetector.js");

var AbstractSwiper = function(optionsArg) {
	var _this = this;

	/**
	 * Resolve options
	 */
	if (typeof optionsArg === 'undefined') { optionsArg = {} };

	var defaultOptions = {
		name: undefined, // must be unique

		direction: AbstractSwiper.HORIZONTAL,

		animationEase: Expo.easeOut,
		animationTime: 0.8,

		count: undefined,

		containerSize: function() { throw "AbstractSwiper: undefined containerSize function!"; }, // relativeX is relatively to this size!!!
		// initMarginSize: function() { return 0; }, // function!
		slideMarginSize: function() { return 0; }, // function!
		slideSize: function() { throw "AbstractSwiper: undefined slideSize function!"; }, // function!

		// callbacks
		onMove: function() {},
		onPanStart: function() {},
		onPanEnd: function() {},
		onStillChange: function() {},
		onActiveSlidesChange: function() {},
		onSnapToEdgeChange: function() {},

		// miscellaneous
		numberOfItemsMovedAtOneAction: 1,
		// numberOfActiveSlides: 1,
		// shouldShowSingleDot: false,

		counterTransformer: function(num) { return "" + num; },

		autoLayoutOnResize: true
	}

	this._options = defaultOptions;

	for(var key in optionsArg) {
		if (!optionsArg.hasOwnProperty(key)) { continue; }
		this._options[key] = optionsArg[key];
	}

	/**
	 *  Set up slide widths and snap points
	 */

	 this._pos = 0;  // current position of slider
	 this._targetSlide = 0; // slide to which animation goes.

	// _this._maxPos; // maximal position of slider (we can overflow behind it, but never snap)
	// _this._snapPoints; // array representing to which position slide should snap.
	// _this._slidePositions; // array representing positions of slides
	// _this._width; // width of whole scrollable area
	// _this._maxTargetSlide; // maximum target slide to which we can animate. It's always the one which is "on left edge" when slider is maximally to the left!
	// _this._activeSlides; // current active slides (cached to know if they changed to call onActiveSlidesChange callback)

	// _this._isFirstSlideSnappedToEdge; // bool values saying if first or last slide are snapped to the edge. (cached to know if they changed to call onSnapToEdgeChange callback when necessary)
	// _this._isLastSlideSnappedToEdge;

	this._onResizeCallback = function() {
		this.layout();
	}

	window.addEventListener('resize', function() {
		if (!_this._options.autoLayoutOnResize) { return; }

		_this._onResizeCallback();
	})

	/**
	 * Others
	 */
	this._isTouched = false;  // true if touch gesture is in progress
	this._isStill = true; // true if at peace - this means that slider is still and there's no touch event active.

	this._animations = [];

	this._panStartPos = 0;

	// These 3 variables detects case of multiple and very quick swipes.
	this._swipeTarget = null;
	this._swipeDirection = 1;
	this._swipeTimer = undefined;

	// this._mc;

	this._enabled = false;


	// this.layout();
}

AbstractSwiper.HORIZONTAL = 0;
AbstractSwiper.VERTICAL = 1;

AbstractSwiper.prototype._getSelectorForComponent = function(component) {
	return '.swiper-' + component + '[data-swiper="' + this._options.name + '"]';
}

AbstractSwiper.prototype.layout = function() {

	this._killAnimations(); // stop all ongoing animations after resize!

	this._slidePositions = [];
	this._snapPoints = [];
	this._width = 0;

	for(var i = 0; i < this._options.count; i++) { // get full _width and _snapPoints
		this._slidePositions.push(this._width);

		this._width += this._options.slideSize(i);

		if (i == this._options.count - 1) { break; }

		this._width += this._options.slideMarginSize(i);
	}

	this._maxPos = Math.max(0, this._width - this._options.containerSize());
	this._maxTargetSlide = undefined;

	for(var i = 0; i < this._slidePositions.length; i++) { // normalize _snapPoints so that rightmost gallery item always snaps to the right side of container
		if (this._slidePositions[i] > this._width - this._options.containerSize()) {
			this._snapPoints[i] = this._maxPos;

			if (typeof this._maxTargetSlide === 'undefined') { this._maxTargetSlide = i; }
		} else {
			this._snapPoints[i] = this._slidePositions[i];
		}
	}

	if (typeof this._maxTargetSlide === 'undefined') { this._maxTargetSlide = this._options.count - 1; }

	this._pos = -this._snapPoints[this._targetSlide];
	this._updatePos();
}

/**
 * Get array of -1, 1, 0 values, which mean that either element is on the left of edge, on the right, or active -> let's call it "orientation".
 */
AbstractSwiper.prototype.getSlideOrientation = function(i) {
  var leftEdge = this._slidePositions[i];
  var rightEdge = leftEdge + this._options.slideSize(i);

  var containerLeftEdge = -this._pos;
  var containerRightEdge = -this._pos + this._options.containerSize();

  if (rightEdge < containerLeftEdge) {
    return -1;
  }
  else if (leftEdge > containerRightEdge) {
    return 1;
  }
  else if (leftEdge <= containerLeftEdge && rightEdge >= containerRightEdge) {
    return 0;
  }
  else if (leftEdge >= containerLeftEdge && rightEdge <= containerRightEdge) {
    return 0;
  }
  else if (leftEdge <= containerLeftEdge) {
    return -1;
  }
  else if (rightEdge >= containerRightEdge) {
    return 1;
  }
}

/**
 * Get array of how much visible in container is each slide.
 */
AbstractSwiper.prototype.getSlidePercentOfVisibility = function(i) {

  var orientation = this.getSlideOrientation(i);

	var leftEdge = this._slidePositions[i];
	var rightEdge = leftEdge + this._options.slideSize(i);

	var containerLeftEdge = -this._pos;
	var containerRightEdge = -this._pos + this._options.containerSize();

	if (rightEdge < containerLeftEdge) {
		return 0;
	}
	else if (leftEdge > containerRightEdge) {
		return 0;
	}
	else if (leftEdge <= containerLeftEdge && rightEdge >= containerRightEdge) {
		return 1;
	}
	else if (leftEdge >= containerLeftEdge && rightEdge <= containerRightEdge) {
		return 1;
	}
	else if (leftEdge <= containerLeftEdge) {
		return (rightEdge - containerLeftEdge) / this._options.slideSize(i);
	}
	else if (rightEdge >= containerRightEdge) {
		return (containerRightEdge - leftEdge) / this._options.slideSize(i);
	}
}

AbstractSwiper.prototype.isSlideActive = function(i) {
	return this.getSlidePercentOfVisibility(i) >= 0.5;
}

// AbstractSwiper.prototype.isSlideFullyVisible = function(i) {
// 	return this.getSlidePercentOfVisibility(i) >= 0.99;
// }

// Get slide to which we should snap gallery when pan down (no swipes);
AbstractSwiper.prototype.getSnapSlide = function() {

	if (-this._pos < 0) {
		return 0;
	}

	if (-this._pos > this._maxPos) {
		return this._options.count - 1;
	}

	var slideOnEdge = this._options.count - 1; // default
	for (var i = 0; i < this._slidePositions.length; i++) {

		if (this._slidePositions[i] > -this._pos) {
			slideOnEdge = (i - 1);
			break;
		}
	}

	if (this.isSlideActive(slideOnEdge)) {
		return slideOnEdge;
	}

	return Math.min(slideOnEdge + 1, this._options.count - 1);
}

/**
 * 1. There's always at least one active slide
 * 2. Active slides are always the ones that are at least 50% visible in container!
 */
AbstractSwiper.prototype.getActiveSlides = function() {
	var newActiveSlides = [];

	for(var i = 0; i < this._options.count; i++) {
		if (this.isSlideActive(i)) {
			newActiveSlides.push(i);
		}
	}

	if (newActiveSlides.length == 0) { // If not a single active slide
		var visibilityPercentages = this.getSlidesVisibilityPercentages();

		var maxVisibility = 0, maxIndex = 0;
		for(var i = 0; i < this._options.count; i++) {
			if (visibilityPercentages[i] > maxVisibility) {
				maxIndex = i;
			}
		}

		return [maxIndex];
	}

	return newActiveSlides;
}

AbstractSwiper.prototype.getSlidesVisibilityPercentages = function() {
	var visibilities = [];

	for(var i = 0; i < this._options.count; i++) {
		visibilities.push(this.getSlidePercentOfVisibility(i));
	}

	return visibilities;
}


AbstractSwiper.prototype.getSlidesOrientations = function() {
  var orientations = [];

  for(var i = 0; i < this._options.count; i++) {
    orientations.push(this.getSlideOrientation(i));
  }

  return orientations;
}

/**
 * Is snapped to left / right
 */
AbstractSwiper.prototype.isFirstSlideSnappedToEdge = function() {
	return -this._pos <= 1;
}

AbstractSwiper.prototype.isLastSlideSnappedToEdge = function() {
	return -this._pos >= this._maxPos - 1;
}


AbstractSwiper.prototype._killAnimations = function() {
	for(var i = 0; i < this._animations.length; i++) {
		this._animations[i].kill();
	}
	this._animations = [];
}

AbstractSwiper.prototype.getCount = function() {
	return this._options.count;
}

AbstractSwiper.prototype.setStill = function(status) {
	if (status == this._isStill) { return; }
	this._isStill = status;

	this._options.onStillChange(this._isStill);
}

AbstractSwiper.prototype.enable = function() {
	var _this = this;

	if (this._enabled) { return; }
	this._enabled = true;

	this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), { domEvents: true });

	var lastMove = 1;
	var swiped = false;

	var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;

	this._mc.get('pan').set({ direction: hammerDirection, threshold: 10 });
	this._mc.get('swipe').set({ direction: hammerDirection, threshold: 10 });

	function onPanStart(ev) {

		if (ev.distance > 50) {
			// prevents weird bug, when on pan start there's a HUGE distance and huge deltas on Chrome.
			// When we are on slider and we start scrolling in vertical direction (body scroll) starting with touch space of slider, slider gets unexpected panstart and one panleft/panright with HUGE delta.
			return;
		}

		if (!_this._isTouched) {

			_this._options.onPanStart();

			_this._isTouched = true;
			swiped = false;

			_this._killAnimations();

			_this._panStartPos = -_this._pos;

			_this.setStill(false);
		}
	}

	_this._mc.on("pan panup panleft panright pandown panstart panend swipe swipeleft swiperight swipeup swipedown", function(ev) {

		var delta = _this._options.direction == AbstractSwiper.HORIZONTAL ? ev.deltaX : ev.deltaY;

		switch(ev.type) {

			// case "swipeleft":
			// case "swipeup":

			// 	console.log('swipe', ev);

			// 	if (_isTouched) {

			// 		if (_swipeDirection == 1 && _swipeTarget != null) {
			// 			_swipeTarget = Math.min(_swipeTarget + 1, options.count - 1);
			// 		}
			// 		else {
			// 			_swipeTarget = getNextSlide(_pos);//Math.min(Math.ceil(_pos), options.count - 1);
			// 		}

			// 		_swipeDirection = 1;

			// 		_this.goTo(_swipeTarget);

			// 		clearTimeout(_swipeTimer);
			// 		_swipeTimer = setTimeout(function() { _swipeTarget = null; }, 600);

			// 		swiped = true;
			// 	}

			// break;
			// case "swiperight":
			// case "swipedown":

			// 	if (_isTouched) {

			// 		if (_swipeDirection == 2 && _swipeTarget != null) {
			// 			_swipeTarget = Math.max(_swipeTarget - 1, 0.0);
			// 		}
			// 		else {
			// 			_swipeTarget = Math.max(Math.floor(_pos), 0.0);
			// 		}

			// 		_swipeDirection = 2;
			// 		_this.goTo(_swipeTarget);

			// 		clearTimeout(_swipeTimer);
			// 		_swipeTimer = setTimeout(function() { _swipeTarget = null; }, 600);

			// 		swiped = true;
			// 	}

			// break;
			case "panstart":
			break;

			case "panleft":
				if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
			case "panup":
				onPanStart(ev); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

				if (_this._isTouched && !swiped) {
					_this._pan(delta, _this._panStartPos);
					lastMove = 1;
				}

			break;

			case "panright":
				if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
			case "pandown":

				onPanStart(ev); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

				if (_this._isTouched && !swiped) {
					_this._pan(delta, _this._panStartPos);
					lastMove = 2;
				}

			break;

			case "panend":

				if (_this._isTouched) {

					_this._options.onPanEnd();

					_this._isTouched = false;

					if (!swiped) {
						_this.goTo(_this.getSnapSlide());
					}

					swiped = false;
				}
			break;
		}
	});
};

AbstractSwiper.prototype.disable = function() {
	if (!this._enabled) { return; }
	this._enabled = false;
	this._mc.off("pan panup panleft panright pandown panstart panend swipe swipeleft swiperight swipeup swipedown");
}

AbstractSwiper.prototype.goToNext = function(animated) {
	this.goTo(Math.min(this._targetSlide + this._options.numberOfItemsMovedAtOneAction, this._options.count - 1), animated);
}

AbstractSwiper.prototype.goToPrevious = function(animated) {
	this.goTo(Math.max(this._targetSlide - this._options.numberOfItemsMovedAtOneAction, 0), animated);
}


AbstractSwiper.prototype._pan = function(deltaX, startX) {

	var position = -startX + deltaX;

	if (-position < 0) {
		var rest = position / this._options.containerSize();
		position = 0.3 * Math.log(rest + 1) * this._options.containerSize();
	}
	if (-position > this._maxPos) {
		var rest = (-position - this._maxPos) / this._options.containerSize();
		position = - (this._maxPos + 0.3 * Math.log(rest + 1) * this._options.containerSize());
	}

	this._pos = position;

	this._updatePos();
}

AbstractSwiper.prototype._updatePos = function() {

		// Invoke callback if active slides changed
	var shouldUpdateComponents = false;

	var currentActiveSlides = this.getActiveSlides();

	if (typeof this._activeSlides === 'undefined' || currentActiveSlides.join(",") != this._activeSlides.join(",")) {
		this._activeSlides = currentActiveSlides;
		this._options.onActiveSlidesChange(this._activeSlides);

		shouldUpdateComponents = true;
	}

	// Invoke callback if gallery became snapped to some edge
	var isFirstSlideSnappedToEdge = this.isFirstSlideSnappedToEdge();
	var isLastSlideSnappedToEdge = this.isLastSlideSnappedToEdge();

	if (isFirstSlideSnappedToEdge !== this._isFirstSlideSnappedToEdge || isLastSlideSnappedToEdge !== this._isLastSlideSnappedToEdge) {
		this._options.onSnapToEdgeChange(isFirstSlideSnappedToEdge || isLastSlideSnappedToEdge);

		this._isFirstSlideSnappedToEdge = isFirstSlideSnappedToEdge;
		this._isLastSlideSnappedToEdge = isLastSlideSnappedToEdge;

		shouldUpdateComponents = true;
	}

	if (shouldUpdateComponents) {
		this._componentsUpdate();
	}

	// Invoke onMove callback!
	this._options.onMove({
		position: this._pos
	});
}

AbstractSwiper.prototype.goToPos = function(pos, animated) {
  var _this = this;

  if (typeof animated === 'undefined') { animated = true; }

  // Don't initiate animation if we're already in the same spot! It would wrongly set "still" callback and "empty animation" would run.
  if (Math.abs(-pos - this._pos) < 1) {
    return;
  }

  this._targetSlide = Math.min(slide, this._maxTargetSlide);

  this.setStill(false);

  var tmp = { pos: _this._pos }

  this._killAnimations();

    var anim1 = TweenMax.to(tmp, animated ? this._options.animationTime : 0, { pos: -pos, ease: this._options.animationEase, onUpdate: function() {

      _this._pos = tmp.pos;
      _this._updatePos();

    }, onComplete: function() {

      _this._animations = [];

      _this._swipeTarget = null;

    _this.setStill(true);

    }});

    this._animations = [anim1];

}


AbstractSwiper.prototype.goTo = function(slide, animated) {
	var _this = this;

	if (typeof animated === 'undefined') { animated = true; }

	var pos = this._snapPoints[slide];

	// Don't initiate animation if we're already in the same spot! It would wrongly set "Still" callback and "empty animation" would run.
	if (Math.abs(-pos - this._pos) < 1) {
		return;
	}

	this._targetSlide = Math.min(slide, this._maxTargetSlide);

	this.setStill(false);

	var tmp = { pos: _this._pos }

	this._killAnimations();

    var anim1 = TweenMax.to(tmp, animated ? this._options.animationTime : 0, { pos: -pos, ease: this._options.animationEase, onUpdate: function() {

    	_this._pos = tmp.pos;
    	_this._updatePos();

    }, onComplete: function() {

    	_this._animations = [];

    	_this._swipeTarget = null;

		_this.setStill(true);

    }});

    this._animations = [anim1];
}

/**
 *
 * COMPONENTS
 *
 */
AbstractSwiper.prototype.initComponents = function() {
	var _this = this;

	// Arrows
	this._clickSpacePrevious = document.querySelector(this._getSelectorForComponent('click-space-previous'));
	this._clickSpaceNext = document.querySelector(this._getSelectorForComponent('click-space-next'));

	if (this._clickSpaceNext) {
		this._clickSpaceNext.onclick = function(e) {
			e.preventDefault();

			if (_this._clickSpaceNext.classList.contains('active')) {
				_this.goToNext();
			}
		};
	}

	if (this._clickSpacePrevious) {
		this._clickSpacePrevious.onclick = function(e) {
			e.preventDefault();

			if (_this._clickSpacePrevious.classList.contains("active")) {
				_this.goToPrevious();
			}
		};
	}

	//Pager
	this._pagerItemTemplate = document.querySelector(this._getSelectorForComponent('pager-item'));

	if (this._pagerItemTemplate) {
		for(var i = 0; i < this._options.count - 1; i++) {
			var pagerItem = this._pagerItemTemplate.cloneNode(true);
			this._pagerItemTemplate.parentNode.insertBefore(pagerItem, this._pagerItemTemplate.nextSibling);
		}
	}

	this._pagerItems = document.querySelectorAll(this._getSelectorForComponent('pager-item'));

	for(var i = 0; i < this._pagerItems.length; i++) {

		(function(i) {
			_this._pagerItems[i].onclick = function(e) {
				_this.goTo(i);
				e.preventDefault();
			}
		})(i);
	}

	// Counter
	this._counterAll = document.querySelector(this._getSelectorForComponent('counter-all'));
	this._counterCurrent = document.querySelector(this._getSelectorForComponent('counter-current'));

}

AbstractSwiper.prototype._componentsUpdate = function() {

	// Arrows
	if (this._clickSpaceNext) {
		this._clickSpaceNext.classList.add('active');

		if (this.isLastSlideSnappedToEdge()) {
			this._clickSpaceNext.classList.remove('active');
		}
	}

	if (this._clickSpacePrevious) {
		this._clickSpacePrevious.classList.add('active');

		if (this.isFirstSlideSnappedToEdge()) {
			this._clickSpacePrevious.classList.remove('active');
		}
	}

	// Pager items
	if (this._pagerItemTemplate) {
		for(var j = 0; j < this._pagerItems.length; j++) {
			this._pagerItems[j].classList.remove('active');

			if (this.isSlideActive(j)) {
				this._pagerItems[j].classList.add('active');
			}
		}
	}

	// Counter
	if (this._counterCurrent) {
		this._counterCurrent.innerHTML = this._options.counterTransformer(this.getActiveSlides()[0] + 1);
	}

	if (this._counterAll) {
		this._counterAll.innerHTML = this._options.counterTransformer(this._options.count);
	}
}


module.exports = AbstractSwiper;


