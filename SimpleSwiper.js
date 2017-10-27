var AbstractSwiper = require("./AbstractSwiper.js");

// Argument is id of container with slides
var SimpleSwiper = function(options) {

  var _this = this;

  AbstractSwiper.call(this, options);

  this._container = document.querySelector(this._getSelectorForComponent('container'));
  this._containerInner = this._container.querySelector('.swiper-items');

  // By default slide has width of enclosing container. Slide margin by default is 0.
  if (typeof options.containerSize === 'undefined') {

    this._options.containerSize = function() {
      return _this._container.offsetWidth;
    }

  }

  if (typeof options.slideSize === 'undefined') {
    this._options.slideSize = function() {
      return _this._options.containerSize();
    }
  }

  // Add extra actions to onPanUp and onPanDown
  this.on('touchdown', function() {
    _this._container.classList.add('panning');
  });

  this.on('touchup', function() {
    setTimeout(function() {
      _this._container.classList.remove('panning');
    }, 0);
  });

  function init() {
    _this._items = _this._containerInner.children;
    _this._options.count = _this._items.length;
  }

  init();


  this.on('move', function(coords) {

    var visibilities = _this.getSlidesVisibilityPercentages();

    for (var i = 0; i < _this._items.length; i++) {
      var item = _this._items[i];

    //   if (visibilities[i] == 0) {
    //     item.style.visibility = 'hidden';
    //   }
    //   else {
    //     item.style.visibility = 'visible';
        var direction = _this._options.direction == AbstractSwiper.HORIZONTAL ? 'X' : 'Y';
        item.style.transform = 'translate' + direction + '(' + coords.positions[i] + 'px)';
    //   }
    }

  });

  this._positionElements = function() {
    var distance = 0;

    if (_this._options.direction == AbstractSwiper.HORIZONTAL) {
        _this._containerInner.style["display"] = "flex";
        _this._containerInner.style["width"] = "1000000px";
        _this._containerInner.style["overflow"] = "1000000px";
        _this._containerInner.style["flex-flow"] = "row nowrap";
    }
    else {
        _this._containerInner.style["display"] = "flex";
        _this._containerInner.style["height"] = "1000000px";
        _this._containerInner.style["width"] = "1000000px";
        _this._containerInner.style["flex-flow"] = "column nowrap";
    }


    for (var i = 0; i < this._items.length; i++) {
      var item = this._items[i];

      if (_this._options.direction == AbstractSwiper.HORIZONTAL) {
        item.style["position"] = "relative";
        item.style["width"] = this._getValueFromOptions('slideSize', i) + 'px';
        item.style["margin-right"] = this._getValueFromOptions('slideMarginSize', i) + 'px';

      } else {

        item.style["position"] = "relative";
        item.style["height"] = this._getValueFromOptions('slideSize', i) + 'px';
        item.style["margin-bottom"] = this._getValueFromOptions('slideMarginSize', i) + 'px';
      }

      // item.style["will-change"] = "transform";
      // item.style["display"] = "block";

      distance += this._getValueFromOptions('slideSize', i);
      distance += this._getValueFromOptions('slideMarginSize', i);
    }
  }

  // SimpleSwiper has its own layout!
  this.layout = function() {

    // If container is already removed from DOM do not do anything.
    if (!document.body.contains(this._container)) {
        return;
    }

    init();

    AbstractSwiper.prototype.layout.call(this);
    this._positionElements();

    this.initComponents();
  }

  this.init = function() {
    this.layout();
    this.enable();
  }

}

// Javascript inheritance of prototype
SimpleSwiper.prototype = Object.create(AbstractSwiper.prototype);


// SimpleSwiper
module.exports = SimpleSwiper;
