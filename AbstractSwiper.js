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
    animationTime: 0.6,

    count: undefined,

    containerSize: function() { throw "AbstractSwiper: undefined containerSize function!"; }, // relativeX is relatively to this size!!!
    // initMarginSize: function() { return 0; }, // function!
    slideMarginSize: function() { return 0; }, // function!
    slideSize: function() { throw "AbstractSwiper: undefined slideSize function!"; }, // function!
    snapOffset: function() { return 0; },

    // callbacks - all deprecated
    // Use .on method instead
    onMove: function() {},
    onPanStart: function() {},
    onPanEnd: function() {},
    onStillChange: function() {},
    onActiveSlidesChange: function() {},

    // miscellaneous
    numberOfItemsMovedAtOneAction: function() { return 1; },
    // numberOfActiveSlides: 1,
    // shouldShowSingleDot: false,

    counterTransformer: function(num) { return "" + num; },

    autoLayoutOnResize: true,

    infinite: false,

    snapOnlyToAdjacentSlide: true,

    freefloat: false
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
  this._relativePos = 0; // this is kept only for the purpose of changing number of items. It's important to keep old relativePos to keep old position right in new layout.
  this._slideState = {} // 1 - normal, -1 moved to the back

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
  this._enabled = false;

  /**
   * Listeners object
   */
  this.listeners = {};

  this._resetCache();
}

AbstractSwiper.HORIZONTAL = 0;
AbstractSwiper.VERTICAL = 1;

/** CACHE MANAGEMENT */
AbstractSwiper.prototype._getValueFromOptions = function(key, arg1) {

  if (key == 'containerSize') { // no arguments
    if (typeof this._CACHE[key] === 'undefined') {
      this._CACHE[key] = (this._options[key])();
    }
    return this._CACHE[key];
  }
  else { // single argument

    if (typeof this._CACHE[key][arg1] === 'undefined') {
      this._CACHE[key][arg1] = (this._options[key])(arg1);
    }
    return this._CACHE[key][arg1];
  }
}

AbstractSwiper.prototype._resetCache = function(key) {
  this._CACHE = {
    'containerSize': undefined,
    'slideMarginSize': {},
    'slideSize': {},
    'snapOffset': {}
  };
}

/** Helper methods */
AbstractSwiper.prototype._getSelectorForComponent = function(component) {
  return '.swiper-' + component + '[data-swiper="' + this._options.name + '"]';
}

// Helper layout functions!
AbstractSwiper.prototype._getSlideableWidth = function() {
  var result = 0;
  for (var i = 0; i < this._options.count; i++) { // get full _width and _snapPoints

    result += this._getValueFromOptions('slideSize', i);

    if (i == this._options.count - 1 && !this._options.infinite) { break; } // total slideable width can't include right margin of last element unless we are at infinite scrolling!

    result += this._getValueFromOptions('slideMarginSize', i);
  }

  return result;
}

AbstractSwiper.prototype._getSlideInitPos = function(slide) {
  var result = 0;
  for (var i = 0; i < slide; i++) { // get full _width and _snapPoints
    result += this._getValueFromOptions('slideSize', i);
    result += this._getValueFromOptions('slideMarginSize', i);
  }

  return result;
}

AbstractSwiper.prototype._getMaxPos = function() {
  if (this._options.infinite) { throw "_getMaxPos method not available in infinite mode" };

  return Math.max(0, this._getSlideableWidth() - this._getValueFromOptions('containerSize'));
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
}

/**
 * Get array of -1, 1, 0 values, which mean that either element is on the left of edge, on the right, or active -> let's call it "orientation".
 */
AbstractSwiper.prototype.getSlideOrientation = function(i) {
  var leftEdge = this.getSlidePosition(i);
  var rightEdge = leftEdge + this._getValueFromOptions('slideSize', i);

  var leftContainerEdge = this._getValueFromOptions('snapOffset', i);
  var rightContainerEdge = this._getValueFromOptions('snapOffset', i) + this._getValueFromOptions('containerSize');

  if (rightEdge < leftContainerEdge) {
    return -1;
  } else if (leftEdge > rightContainerEdge) {
    return 1;
  } else if (leftEdge <= leftContainerEdge && rightEdge >= rightContainerEdge) {
    return 0;
  } else if (leftEdge >= leftContainerEdge && rightEdge <= rightContainerEdge) {
    return 0;
  } else if (leftEdge <= leftContainerEdge) {
    return -1;
  } else if (rightEdge >= rightContainerEdge) {
    return 1;
  }
}

/**
 * Get array of how much visible in container is each slide.
 */
AbstractSwiper.prototype.getSlidePercentOfVisibility = function(i) {

  var leftEdge = this.getSlidePosition(i);
  var rightEdge = leftEdge + this._getValueFromOptions('slideSize', i);

  var leftContainerEdge = this._getValueFromOptions('snapOffset', i);
  var rightContainerEdge = this._getValueFromOptions('snapOffset', i) + this._getValueFromOptions('containerSize');

  if (rightEdge < leftContainerEdge) {
    return 0;
  } else if (leftEdge > rightContainerEdge) {
    return 0;
  } else if (leftEdge <= leftContainerEdge && rightEdge >= rightContainerEdge) {
    return 1;
  } else if (leftEdge >= leftContainerEdge && rightEdge <= rightContainerEdge) {
    return 1;
  } else if (leftEdge <= leftContainerEdge) {
    return (rightEdge - leftContainerEdge) / this._getValueFromOptions('slideSize', i);
  } else if (rightEdge >= rightContainerEdge) {
    return (rightContainerEdge - leftEdge) / this._getValueFromOptions('slideSize', i);
  }
}

AbstractSwiper.prototype.getSlidePosition = function(i) {
  return -this._pos + this._getValueFromOptions('snapOffset', i) + this._slideState[i] * this._getSlideableWidth() + this._getSlideInitPos(i);
}


AbstractSwiper.prototype.isSlideActive = function(i) {
  return this.getActiveSlides().indexOf(i) > -1;
}


AbstractSwiper.prototype._getClosestSnappedPosition = function(pos, side) {

  // Side means if we snap to specific side. If 0, to the closest, -1 to the left, 1 to the right.
  if (typeof side === 'undefined') { side = 0; }

  var normalizedPos = this._normalizePos(pos);

  var minDistance, index;

  // Let's find slide which distance to normalisedPos is minimum
  for(var i = 0; i < this._options.count; i++) {

    var distance = normalizedPos - this._getSlideInitPos(i);

    if (Math.abs(distance) < Math.abs(minDistance) || minDistance === undefined) {
      index = i;
      minDistance = distance;
    }
  }

  // In case of infinite slider let's just adjust real position (not normalized) with calculated delta to closest snapped position.
  if (this._options.infinite) {
    var result = pos - minDistance;
  }
  else { // In case of finite slide, we can safely just takie initial position of found slide.
    var result = this._getSlideInitPos(index);
  }

  // If side is not default, we want to assure that closest snapped position is on the right hand side of current position.
  // If result is < pos, then we don't have to nothing because condition is already met. In other case,
  // we need to take next slide instead of current one.
  if (side == 1 && result < pos) {

    // We change position to next slide position.
    var newResult = result - this._getSlideInitPos(index) + this._getSlideInitPos(this._getSlideFromOffset(1));

    // In case of infinite sliders next slide position may be smaller than current because of wrapping. Below we take care of this case.
    if (newResult < result) { newResult += this._getSlideableWidth(); }

  }
  // This condition is analogous to the above one.
  else if (side == -1 && result > pos) {
    var newResult = result - this._getSlideInitPos(index) + this._getSlideInitPos(this._getSlideFromOffset(-1));

    if (newResult > result) { newResult -= this._getSlideableWidth(); }
  }
  else {
    newResult = result;
  }

  // If slider is not infinite, we must normalise calculated position so that it doesn't exceed minimum and maximum position.
  if (!this._options.infinite) {
    newResult = this._normalizePos(newResult, false);

    // newResult = Math.min(this._getMaxPos(), newResult);
    // newResult = Math.max(0, newResult);
  }

  return newResult;
}



/**
 * 1. There's always at least one active slide
 * 2. Active slides are always the ones that are at least 50% visible in container!
 */
AbstractSwiper.prototype.getActiveSlides = function() {
  var _this = this;

  var newActiveSlides = [];

  for (var i = 0; i < this._options.count; i++) {
    if (this.getSlidePercentOfVisibility(i) >= 0.5) {
      newActiveSlides.push({
        index: i,
        pos: _this.getSlidePosition(i)
      });
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

  newActiveSlides.sort(function (a, b) {
    return a.pos > b.pos;
  });

  var result = newActiveSlides.map(function(x) { return x.index });

  return result;
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

  if (this._isStill) {
    this._unblockScrolling();
  }
  else {
    this._blockScrolling();
  }

  // events
  this._options.onStillChange(this._isStill); // deprecated
  this._invokeListeners('equilibriumChange', this._isStill); // new way
}

AbstractSwiper.prototype._blockScrolling = function() {
  if (this._mc) {
    this._mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    this._mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
  }
}

AbstractSwiper.prototype._unblockScrolling = function() {
  if (this._mc) {
    var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;
    this._mc.get('pan').set({ direction: hammerDirection });
    this._mc.get('swipe').set({ direction: hammerDirection });
  }
}

AbstractSwiper.prototype.enable = function() {
  var _this = this;

  if (this._enabled) { return; }
  this._enabled = true;

  this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), { domEvents: false });

  var swiped = false;

  var hammerDirection = this._options.direction == AbstractSwiper.HORIZONTAL ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;

  this._mc.get('pan').set({ direction: hammerDirection, threshold: 20 });
  this._mc.get('swipe').set({ direction: hammerDirection, threshold: 20 });

  function onPanStart(ev) {

    if (!_this._isTouched) {

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

  _this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", function(ev) {

    // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
    // https://github.com/hammerjs/hammer.js/issues/1050
    if (ev.srcEvent.type == "pointercancel") { return; }

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
        if (!_this._isTouched) { return; }

      case "panleft":
      case "panright":
        if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
        onPanStart(ev); // onPanStart is on first panleft / panright, because its deferred until treshold is achieved

        if (_this._isTouched && !swiped) {
          _this._pan(delta, _this._panStartPos);
        }

        break;

      case "panend":

        if (_this._isTouched) {

          // Events
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

AbstractSwiper.prototype.disable = function() {
  if (!this._enabled) { return; }
  this._enabled = false;

  this._mc.destroy();
  this._mc = undefined;
}

AbstractSwiper.prototype.goToNext = function(animated) {
  this.goTo(this._getSlideFromOffset((this._options.numberOfItemsMovedAtOneAction)()), animated, 1);
}

AbstractSwiper.prototype.goToPrevious = function(animated) {
  this.goTo(this._getSlideFromOffset(-(this._options.numberOfItemsMovedAtOneAction)()), animated, -1);
}

AbstractSwiper.prototype._getSlideFromOffset = function(offset) {

  var leftMostActiveSlide = this.getActiveSlides()[0];
  var newSlide = leftMostActiveSlide + offset;

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

AbstractSwiper.prototype._getNextPositionFromVelocity = function(v) {

  // In case of freefloat just add s.

  var s = 0.2 * v * this._options.animationTime / 2;
  var targetPos = this._pos + s; // targetPos at this stage is not snapped to any slide.

  if (this._options.freefloat) {

    if (!this._options.infinite) {
      targetPos = this._normalizePos(targetPos, false);
    }

    return targetPos;
  }

  // If this options is true, we want to snap to as closest slide as possible and not further.
  // This is necessary because when you have slider when slide is 100% width, strong flick gestures
  // would make swiper move 2 or 3 positions to right / left which feels bad. This flag should be
  // disabled in case of "item swiper" when couple of items are visible in viewport at the same time.
  if (this._options.snapOnlyToAdjacentSlide) {
    targetPos = v < 0 ? this._pos - 1 : this._pos + 1;
  }

  return this._getClosestSnappedPosition(targetPos, v < 0 ? -1 : 1);
}

AbstractSwiper.prototype._normalizePos = function(position, overscroll) {

  if (this._options.infinite) {

    position = position % this._getSlideableWidth();
    if (position < 0) { position += this._getSlideableWidth(); } // this is needed because Javascript is shit and doesn't correctly calculate modulo on negative numbers.

    return position;
  }
  else {

    // If overscroll is true, we run _overscrollFunction on position. If not, we simply limit min / max position.
    if (typeof overscroll === 'undefined') { overscroll = true; }

    if (overscroll) {
      if (position < 0) {
        var rest = -position / this._getValueFromOptions('containerSize');
        position = -this._overscrollFunction(rest) * this._getValueFromOptions('containerSize');
      }
      if (position > this._getMaxPos()) {
        var rest = (position - this._getMaxPos()) / this._getValueFromOptions('containerSize');
        position = this._getMaxPos() + this._overscrollFunction(rest) * this._getValueFromOptions('containerSize');
      }
    }
    else {
      if (position < 0) { position = 0; }
      if (position > this._getMaxPos()) { position = this._getMaxPos(); }
    }

    return position;
  }

}

// Overfscroll function for noninfinite sliders. If it's f(x) = x it will be linear. x = 1 means entire container width movement.
AbstractSwiper.prototype._overscrollFunction = function(val) {
  return 0.6 * Math.log(1 + val);
}


AbstractSwiper.prototype._pan = function(deltaX, startX) {
  this._updatePos(startX - deltaX);
}

AbstractSwiper.prototype._updatePos = function(pos) {
  var positions = {};
  var absolutePositions = {};

  var normalizedPos = this._normalizePos(pos);

  if (this._options.infinite) {

    this._pos = normalizedPos; // In case of infinite we enforce normalization

    // Wrap positions!
    for(var i = 0; i < this._options.count; i++) {

      var rightEdge = this._getSlideInitPos(i) - this._pos + this._getValueFromOptions('snapOffset', i) + this._getValueFromOptions('slideSize', i);

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

      positions[i] = -this._pos + this._getValueFromOptions('snapOffset', i) + this._slideState[i] * this._getSlideableWidth();
    }
  }
  else {

    this._pos = pos;

    for(var i = 0; i < this._options.count; i++) {
      this._slideState[i] = 0;

      positions[i] = -normalizedPos + this._getValueFromOptions('snapOffset', i);
    }
  }

  for(var i = 0; i < this._options.count; i++) {
    absolutePositions[i] = positions[i] + this._getSlideInitPos(i);
  }


  this._relativePos = this._pos / this._getValueFromOptions('containerSize');

  // Invoke callback if active slides changed
  var shouldUpdateComponents = false;

  var currentActiveSlides = this.getActiveSlides();

  if (typeof this._activeSlides === 'undefined' || currentActiveSlides.join(",") != this._activeSlides.join(",")) {

    this._activeSlides = currentActiveSlides;

    // events
    this._options.onActiveSlidesChange(this._activeSlides); // deprecated
    this._invokeListeners('activeSlidesChange', this._activeSlides); // new way

    shouldUpdateComponents = true;
  }

  if (shouldUpdateComponents) {
    this._componentsUpdate();
  }

  // Callbacks
  this._options.onMove({ positions: positions }); // deprecated
  this._invokeListeners('move', { positions: positions, absolutePositions: absolutePositions }); // new way


}

AbstractSwiper.prototype.moveTo = function(pos, animated) {

  if (typeof animated === 'undefined') { animated = true; }

  var _this = this;

  // Don't initiate animation if we're already in the same spot! It would wrongly set "Still" callback and "empty animation" would run.
  var diff = Math.abs(pos - this._pos);
  if (diff < 1) {  return; }

  this._killAnimations();

  if (animated) {

    this.setStill(false);
    var tmp = { pos: _this._pos }

    var anim1 = TweenMax.to(tmp, this._options.animationTime, {
      pos: pos,
      ease: this._options.animationEase,
      onUpdate: function() {

        _this._updatePos(tmp.pos);

      },
      onComplete: function() {

        _this._animations = [];
        _this.setStill(true);

      }
    });

    this._animations = [anim1];
  }
  else {
    _this._updatePos(pos);
  }

}

// If side = 0, shortest path, 1 -> always right, -1 always left
AbstractSwiper.prototype.goTo = function(slide, animated, side) {
  var _this = this;

  if (typeof animated === 'undefined') { animated = true; }
  if (typeof side === 'undefined') { side = 0; }

  var pos = this._getSlideSnapPos(slide);

  // In case of infinite slider, we must take strategy of shortest path. So if we go from 10th slide (last) to 1st, we go one slide right, not 10 slides left.

  if (this._options.infinite) {

    if (side == 0) { // shortest path strategy

      if (Math.abs(pos - this._pos) > this._getSlideableWidth() / 2) {
        if (pos - this._pos > 0) {
          pos -= this._getSlideableWidth();
        }
        else {
          pos += this._getSlideableWidth();
        }
      }
    }
    else if (side == 1 && pos - this._pos < 0) { // force right movement
      pos += this._getSlideableWidth();
    }
    else if (side == -1 && pos - this._pos > 0) { // force left movement
      pos -= this._getSlideableWidth();
    }

  }

  if (animated) {
    _this.moveTo(pos);
  }
  else {
    _this._updatePos(pos);
  }

}

/**
 * LISTENERS
 */
AbstractSwiper.prototype.on = function(event, listener) {
  if (typeof this.listeners[event] === 'undefined') {
    this.listeners[event] = [];
  }

  this.listeners[event].push(listener);
}

AbstractSwiper.prototype._invokeListeners = function(event, p1, p2, p3, p4) {
  if (typeof this.listeners[event] === 'undefined') { return; }

  this.listeners[event].forEach(function(listener) {
    listener(p1, p2, p3, p4);
  });
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
