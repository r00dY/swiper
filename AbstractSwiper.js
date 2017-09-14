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
    snapOffset: function() { return 0; },

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

    autoLayoutOnResize: true,

    infinite: false
  }

  this._options = defaultOptions;

  for (var key in optionsArg) {
    if (!optionsArg.hasOwnProperty(key)) { continue; }
    this._options[key] = optionsArg[key];
  }

  /**
   *  Set up slide widths and snap points
   */

  this._pos = 0; // current position of slider (whole container)
  this._slideState = {} // 1 - normal, -1 moved to the back


  // this._slidePos = {}; // positions of specific slides

  this._targetSlide = 0; // slide to which animation goes.

  // _this._maxPos; // maximal position of slider (we can overflow behind it, but never snap)
  // _this._snapPoints; // array representing to which position slide should snap.
  // _this._slidePositions; // array representing positions of slides
  // _this._width; // width of whole scrollable area
  // _this._maxTargetSlide; // maximum target slide to which we can animate. It's always the one which is "on left edge" when slider is maximally to the left!
  // _this._activeSlides; // current active slides (cached to know if they changed to call onActiveSlidesChange callback)

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
  this._isTouched = false; // true if touch gesture is in progress
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

// Helper layout functions!
AbstractSwiper.prototype._getSlideableWidth = function() {
  var result = 0;
  for (var i = 0; i < this._options.count; i++) { // get full _width and _snapPoints

    result += this._options.slideSize(i);

    if (i == this._options.count - 1 && !this._options.infinite) { break; } // total slideable width can't include right margin of last element unless we are at infinite scrolling!

    result += this._options.slideMarginSize(i);
  }

  return result;
}

AbstractSwiper.prototype._getSlideInitPos = function(slide) {
  var result = 0;
  for (var i = 0; i < slide; i++) { // get full _width and _snapPoints
    result += this._options.slideSize(i);
    result += this._options.slideMarginSize(i);
  }

  return result;
}

AbstractSwiper.prototype._getMaxPos = function() {
  if (this._options.infinite) { throw "_getMaxPos method not available in infinite mode" };

  return Math.max(0, this._getSlideableWidth() - this._options.containerSize());
}

AbstractSwiper.prototype._getSlideSnapPos = function(slide) {
  if (this._options.infinite) { return this._getSlideInitPos(slide); } // in case of infinite, snap position is always slide position

  return Math.min(this._getSlideInitPos(slide), this._getMaxPos());
}

AbstractSwiper.prototype._getMaxTargetSlide = function() {
  if (this._options.infinite) { throw "_getMaxTargetSlide method not available in infinite mode" };

  if (this._options.length == 1) { return 0; } // if 1 slide, then its max target slide

  for(var i = 1; i < this._options.length; i++) {
    if (this._getSlideSnapPos(i) == this._getMaxPos()) {
      return i;
    }
  }

  return this._options.count - 1; // last by default
}


AbstractSwiper.prototype.layout = function() {

  this._killAnimations(); // stop all ongoing animations after resize!

  // There's a chance that number of items was changed, so let's normalize targetSlide.
  if (this._targetSlide >= this._options.count) {
    this._targetSlide = this._options.count - 1;
  }

  this._pos = this._getSlideSnapPos(this._targetSlide);//-this._snapPoints[this._targetSlide];

  this._updatePos();
}

/**
 * Get array of -1, 1, 0 values, which mean that either element is on the left of edge, on the right, or active -> let's call it "orientation".
 */
AbstractSwiper.prototype.getSlideOrientation = function(i) {
  var leftEdge = this.getSlidePosition(i) + this._getSlideInitPos(i);
  var rightEdge = leftEdge + this._options.slideSize(i);

  if (rightEdge < 0) {
    return -1;
  } else if (leftEdge > this._options.containerSize()) {
    return 1;
  } else if (leftEdge <= 0 && rightEdge >= this._options.containerSize()) {
    return 0;
  } else if (leftEdge >= 0 && rightEdge <= this._options.containerSize()) {
    return 0;
  } else if (leftEdge <= 0) {
    return -1;
  } else if (rightEdge >= this._options.containerSize()) {
    return 1;
  }
}

/**
 * Get array of how much visible in container is each slide.
 */
AbstractSwiper.prototype.getSlidePercentOfVisibility = function(i) {

  var leftEdge = this.getSlidePosition(i) + this._getSlideInitPos(i);
  var rightEdge = leftEdge + this._options.slideSize(i);

  if (rightEdge < 0) {
    return 0;
  } else if (leftEdge > this._options.containerSize()) {
    return 0;
  } else if (leftEdge <= 0 && rightEdge >= this._options.containerSize()) {
    return 1;
  } else if (leftEdge >= 0 && rightEdge <= this._options.containerSize()) {
    return 1;
  } else if (leftEdge <= 0) {
    return (rightEdge - 0) / this._options.slideSize(i);
  } else if (rightEdge >= this._options.containerSize()) {
    return (this._options.containerSize() - leftEdge) / this._options.slideSize(i);
  }
}

AbstractSwiper.prototype.getSlidePosition = function(i) {
  return -this._pos + this._options.snapOffset() + this._slideState[i] * this._getSlideableWidth();
}


AbstractSwiper.prototype.isSlideActive = function(i) {

  return this.getActiveSlides().indexOf(i) > -1;

  // return this.getSlidePercentOfVisibility(i) >= 0.5;
}

// AbstractSwiper.prototype.isSlideFullyVisible = function(i) {
//  return this.getSlidePercentOfVisibility(i) >= 0.99;
// }

// Get slide to which we should snap gallery when pan down (no swipes);
AbstractSwiper.prototype.getSnapSlide = function() {

  var minDistance = 99999999;
  var index;

  for(var i = 0; i < this._options.count; i++) {

    var distance = Math.abs(this.getSlidePosition(i) + this._getSlideInitPos(i));

    if (distance < minDistance) {
      index = i;
      minDistance = distance;
    }
  }

  return index;
}

/**
 * 1. There's always at least one active slide
 * 2. Active slides are always the ones that are at least 50% visible in container!
 */
AbstractSwiper.prototype.getActiveSlides = function() {
  var newActiveSlides = [];

  for (var i = 0; i < this._options.count; i++) {
    if (this.getSlidePercentOfVisibility(i) >= 0.5) {
      newActiveSlides.push(i);
    }
  }

  if (newActiveSlides.length == 0) { // If not a single active slide
    var visibilityPercentages = this.getSlidesVisibilityPercentages();

    var maxVisibility = 0,
      maxIndex = 0;
    for (var i = 0; i < this._options.count; i++) {
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

  for (var i = 0; i < this._options.count; i++) {
    visibilities.push(this.getSlidePercentOfVisibility(i));
  }

  return visibilities;
}


AbstractSwiper.prototype.getSlidesOrientations = function() {
  var orientations = [];

  for (var i = 0; i < this._options.count; i++) {
    orientations.push(this.getSlideOrientation(i));
  }

  return orientations;
}

AbstractSwiper.prototype._killAnimations = function() {
  for (var i = 0; i < this._animations.length; i++) {
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
    console.log('pan start');
    if (!_this._isTouched) {

      _this._options.onPanStart();

      _this._isTouched = true;
      swiped = false;

      _this._killAnimations();

      _this._panStartPos = _this._pos;

      _this.setStill(false);
    }
  }

  _this._mc.on("pan panup panleft panright pandown panstart panend swipe swipeleft swiperight swipeup swipedown", function(ev) {

    var delta = _this._options.direction == AbstractSwiper.HORIZONTAL ? ev.deltaX : ev.deltaY;

    switch (ev.type) {

      case "swipeleft":
      case "swipeup":

         console.log('swipe left', ev);

         if (_this._isTouched) {

            _this._getSlideFromOffset(1);

            // var newTarget = Math.min(_this._targetSlide + 1, _this._getMaxTargetSlide());
             _this.goTo(_this._getSlideFromOffset(1));

             swiped = true;


      //        if (_swipeDirection == 1 && _swipeTarget != null) {
      //            _swipeTarget = Math.min(_swipeTarget + 1, options.count - 1);
      //        }
      //        else {
      //            _swipeTarget = getNextSlide(_pos);//Math.min(Math.ceil(_pos), options.count - 1);
      //        }

      //        _swipeDirection = 1;

      //        _this.goTo(_swipeTarget);

      //        clearTimeout(_swipeTimer);
      //        _swipeTimer = setTimeout(function() { _swipeTarget = null; }, 600);

      //        swiped = true;
         }

      break;
      case "swiperight":
      case "swipedown":

         console.log('swipe right', ev);

         if (_this._isTouched) {

            // var newTarget = Math.max(_this._targetSlide - 1, 0);
             _this.goTo(_this._getSlideFromOffset(-1));

             swiped = true;


             // if (_swipeDirection == 2 && _swipeTarget != null) {
             //     _swipeTarget = Math.max(_swipeTarget - 1, 0.0);
             // }
             // else {
             //     _swipeTarget = Math.max(Math.floor(_pos), 0.0);
             // }

             // _swipeDirection = 2;
             // _this.goTo(_swipeTarget);

             // clearTimeout(_swipeTimer);
             // _swipeTimer = setTimeout(function() { _swipeTarget = null; }, 600);

             // swiped = true;
         }

      break;
      case "panstart":
        break;

      case "panleft":
        console.log('panleft');
        if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
      case "panup":
        onPanStart(ev); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

        if (_this._isTouched && !swiped) {
          _this._pan(delta, _this._panStartPos);
          lastMove = 1;
        }

        break;

      case "panright":
        console.log('panright');
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

AbstractSwiper.prototype._getSlideFromOffset = function(offset) {

  var newSlide = this._targetSlide + offset;

  if (this._options.infinite) {

    newSlide = newSlide % this._options.count;
    if (newSlide < 0) { newSlide += this._options.count }
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



AbstractSwiper.prototype.goToNext = function(animated) {

  // if (this._options.infinite) {
  //   var slide = this._targetSlide + this._options.numberOfItemsMovedAtOneAction;
  //   if (slide >= this._options.count) { slide -= this._options.count; }
  // }
  // else {
  //   var slide = Math.min(this._targetSlide + this._options.numberOfItemsMovedAtOneAction, this._options.count - 1);
  // }

  // this.goTo(slide, animated);


  this.goTo(this._getSlideFromOffset(this._options.numberOfItemsMovedAtOneAction), animated);
}

AbstractSwiper.prototype.goToPrevious = function(animated) {

  // if (this._options.infinite) {
  //   var slide = this._targetSlide - this._options.numberOfItemsMovedAtOneAction;
  //   if (slide < 0) { slide += this._options.count; }
  // }
  // else {
  //   var slide = Math.max(this._targetSlide - this._options.numberOfItemsMovedAtOneAction, 0);
  // }

  // this.goTo(slide, animated);

  this.goTo(this._getSlideFromOffset(-this._options.numberOfItemsMovedAtOneAction), animated);
}

AbstractSwiper.prototype._normalizePosForInfinite = function(position) {
  if (position < 0) {
    return position + this._getSlideableWidth();
  } else if (position >= this._getSlideableWidth()) {
    return position - this._getSlideableWidth();
  }

  return position;
}

// Overfscroll function for noninfinite sliders. If it's f(x) = x it will be linear. x = 1 means entire container width movement.
AbstractSwiper.prototype._overscrollFunction = function(val) {
  return 0.3 * Math.log(1 + val);
}


AbstractSwiper.prototype._pan = function(deltaX, startX) {

  var position = startX - deltaX;

  if (!this._options.infinite) { // overflow bounce effect

    if (position < 0) {
      var rest = -position / this._options.containerSize();

      position = -this._overscrollFunction(rest) * this._options.containerSize();
    }
    if (position > this._getMaxPos()) {
      var rest = (position - this._getMaxPos()) / this._options.containerSize();
      position = this._getMaxPos() + this._overscrollFunction(rest) * this._options.containerSize();
    }

  }
  else { // in case of infinite, position is always in range <0; MAX_WIDTH> for simplicity
    position = this._normalizePosForInfinite(position);
  }

  this._pos = position;

  this._updatePos();
}

AbstractSwiper.prototype._updatePos = function() {

  var positions = {};

  if (this._options.infinite) {

    // Wrap positions!
    for(var i = 0; i < this._options.count; i++) {

      var rightEdge = this._getSlideInitPos(i) - this._pos + this._options.snapOffset() + this._options.slideSize(i);

      // Every element which is totally hidden on the left hand side of container gets transferred to the right
      if (rightEdge < 0) {
        this._slideState[i] = 1;
      }
      // Every element which right edge is bigger then slideable width should be moved to the left
      else if (rightEdge > this._getSlideableWidth()) {
        this._slideState[i] = -1;
      }
      else {
        this._slideState[i] = 0;
      }

      positions[i] = -this._pos + this._options.snapOffset() + this._slideState[i] * this._getSlideableWidth();
    }
  }
  else {
    for(var i = 0; i < this._options.count; i++) {
      this._slideState[i] = 0;
      positions[i] = -this._pos;
    }
  }

  // console.log(this._pos);
  // console.log(this._slideState);

  // // Take snapOffset into account
  // var positionsWithOffset = {}
  // for(var i = 0; i < this._options.count; i++) {
  //   positionsWithOffset[i] = positions[i] + this._options.snapOffset();
  // }

  // // console.log(positions, positionsWithOffset);

  // this._slidePos = positions;



  // Invoke callback if active slides changed
  var shouldUpdateComponents = false;

  var currentActiveSlides = this.getActiveSlides();

  if (typeof this._activeSlides === 'undefined' || currentActiveSlides.join(",") != this._activeSlides.join(",")) {

    this._activeSlides = currentActiveSlides;
    this._options.onActiveSlidesChange(this._activeSlides);

    shouldUpdateComponents = true;
  }

  if (shouldUpdateComponents) {
    this._componentsUpdate();
  }

  // Invoke onMove callback!
  this._options.onMove({
    positions: positions
  });
}

AbstractSwiper.prototype.goTo = function(slide, animated) {
  var _this = this;

  if (typeof animated === 'undefined') { animated = true; }

  var pos = this._getSlideSnapPos(slide);//this._snapPoints[slide];
  var diff = Math.abs(pos - this._pos);

  // Don't initiate animation if we're already in the same spot! It would wrongly set "Still" callback and "empty animation" would run.
  if (diff < 1) {  return; }

  // in case of infinite slider, we must take strategy of shortest path. So if we go from 10th slide (last) to 1st, we go one slide right, not 10 slides left.
  if (this._options.infinite && diff > this._getSlideableWidth() / 2) {
    if (pos - this._pos > 0) {
      pos -= this._getSlideableWidth();
    }
    else {
      pos += this._getSlideableWidth();
    }
  }

  this._targetSlide = this._options.infinite ? slide : Math.min(slide, this._getMaxTargetSlide()); // if not infinite, max target slide is limited.

  this.setStill(false);

  var tmp = { pos: _this._pos }

  this._killAnimations();

  var anim1 = TweenMax.to(tmp, animated ? this._options.animationTime : 0, {
    pos: pos,
    ease: this._options.animationEase,
    onUpdate: function() {

      _this._pos = _this._options.infinite ? _this._normalizePosForInfinite(tmp.pos) : tmp.pos; // if infinite, we need to normalize position here.
      _this._updatePos();

    },
    onComplete: function() {

      _this._animations = [];

      _this._swipeTarget = null;

      _this.setStill(true);

    }
  });

  this._animations = [anim1];
}

/**
 *
 * COMPONENTS
 *
 */

AbstractSwiper.prototype.deinitComponents = function() {

  // Unbind clicks on next / previous
  if (this._clickSpaceNext) {
    this._clickSpaceNext.removeEventListener('click', this._clickSpaceNextOnClickListener);
  }

  if (this._clickSpacePrevious) {
    this._clickSpacePrevious.removeEventListener('click', this._clickSpacePreviousOnClickListener);
  }

  // Reset pager items to single item + remove listener

  if (this._pagerItems) {
    for (var i = 0; i < this._pagerItems.length; i++) {

      // Let's leave first element alive, just unbind listener
      if (i == 0) {
        this._pagerItems[i].removeEventListener('click', this._pagerItemsOnClickListeners[i]);
      }
      else { // rest elements -> out.
        this._pagerItems[i].remove();
      }
    }
  }

}


AbstractSwiper.prototype.initComponents = function() {

  this.deinitComponents();

  var _this = this;

  // Arrows
  this._clickSpacePrevious = document.querySelector(this._getSelectorForComponent('click-space-previous'));
  this._clickSpaceNext = document.querySelector(this._getSelectorForComponent('click-space-next'));

  if (this._clickSpaceNext) {

    this._clickSpaceNextOnClickListener = function(e) {
      e.preventDefault();

      if (_this._clickSpaceNext.classList.contains('active')) {
        _this.goToNext();
      }
    }

    _this._clickSpaceNext.addEventListener('click', this._clickSpaceNextOnClickListener);
  }

  if (this._clickSpacePrevious) {

    this._clickSpacePreviousOnClickListener = function(e) {
      e.preventDefault();

      if (_this._clickSpacePrevious.classList.contains("active")) {
        _this.goToPrevious();
      }
    }

    _this._clickSpacePrevious.addEventListener('click', this._clickSpacePreviousOnClickListener);

  }

  //Pager
  this._pagerItemTemplate = document.querySelector(this._getSelectorForComponent('pager-item'));

  if (this._pagerItemTemplate) {
    for (var i = 0; i < this._options.count - 1; i++) {
      var pagerItem = this._pagerItemTemplate.cloneNode(true);
      this._pagerItemTemplate.parentNode.insertBefore(pagerItem, this._pagerItemTemplate.nextSibling);
    }
  }

  this._pagerItems = document.querySelectorAll(this._getSelectorForComponent('pager-item'));
  this._pagerItemsOnClickListeners = [];

  for (var i = 0; i < this._pagerItems.length; i++) {

    (function(i) {

      _this._pagerItemsOnClickListeners[i] = function(e) {
        _this.goTo(i);
        e.preventDefault();
      }

      _this._pagerItems[i].addEventListener('click', _this._pagerItemsOnClickListeners[i]);

    })(i);
  }

  // Counter
  this._counterAll = document.querySelector(this._getSelectorForComponent('counter-all'));
  this._counterCurrent = document.querySelector(this._getSelectorForComponent('counter-current'));

  this._componentsUpdate();
}

AbstractSwiper.prototype._componentsUpdate = function() {

  // Arrows
  if (this._clickSpaceNext) {
    this._clickSpaceNext.classList.add('active');

    if (!this._options.infinite && this.getActiveSlides().indexOf(this._options.count - 1) > -1) {
      this._clickSpaceNext.classList.remove('active');
    }
  }

  if (this._clickSpacePrevious) {
    this._clickSpacePrevious.classList.add('active');

    if (!this._options.infinite && this.getActiveSlides().indexOf(0) > -1) {
      this._clickSpacePrevious.classList.remove('active');
    }
  }

  // Pager items
  if (this._pagerItemTemplate) {
    for (var j = 0; j < this._pagerItems.length; j++) {
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
