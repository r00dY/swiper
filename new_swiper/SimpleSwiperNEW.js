var AbstractSwiper = require("../AbstractSwiper.js");

// Argument is id of container with slides
var SimpleSwiper = function(gesturesProvider, options, container, innerContainer) {

  var _this = this;

  AbstractSwiper.call(this, gesturesProvider, options);

  this._container = container;
  this._containerInner = innerContainer;

  // By default slide has width of enclosing container. Slide margin by default is 0.
  if (typeof options.containerSize === 'undefined') {

    this._options.containerSize = function() {
      return _this._options.direction == AbstractSwiper.HORIZONTAL ?
      _this._container.offsetWidth :
      _this._container.offsetHeight;
    }

  }

  if (typeof options.slideSize === 'undefined') {
    this._options.slideSize = function() {
      return _this._options.containerSize();
    }
  }

  // Add extra actions to onPanUp and onPanDown
  var tmpOnPanStart = this._options.onPanStart;
  var tmpOnPanEnd = this._options.onPanEnd;

  this._options.onPanStart = function() {
    _this._container.classList.add('panning');
    tmpOnPanStart();
  }

  this._options.onPanEnd = function() {
    setTimeout(function() {
      _this._container.classList.remove('panning');
    }, 0);

    tmpOnPanEnd();
  }


  function init() {
    _this._items = _this._containerInner.children;
    _this._options.count = _this._items.length;
  }

  init();


  this._options.onMove = function(coords) {

    for (var i = 0; i < _this._items.length; i++) {
      var item = _this._items[i];

      var direction = _this._options.direction == AbstractSwiper.HORIZONTAL ? 'X' : 'Y';
      item.style.transform = 'translate' + direction + '(' + coords.positions[i] + 'px)'
    }

    if (typeof options.onMove !== 'undefined') {
      options.onMove(coords);
    }
  }

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
        item.style["width"] = this._options.slideSize(i) + 'px';
        item.style["margin-right"] = this._options.slideMarginSize(i) + 'px';

      } else {

        item.style["position"] = "relative";
        item.style["height"] = this._options.slideSize(i) + 'px';
        item.style["margin-bottom"] = this._options.slideMarginSize(i) + 'px';
      }

      item.style["will-change"] = "transform";

      distance += this._options.slideSize(i);
      distance += this._options.slideMarginSize(i);
    }
  }

  // SimpleSwiper has its own layout!
  this.layout = function() {

    // If container is already removed from DOM do not do anything.
    if (!document.body.contains(this._container)) {
        return;
    }

    init();
    this._positionElements();
    AbstractSwiper.prototype.layout.call(this);
    this.initComponents();
  }

  this.init = function() {
    this.layout();
    this.enable();

    return this;
  }

}

// Javascript inheritance of prototype
SimpleSwiper.prototype = Object.create(AbstractSwiper.prototype);


// SimpleSwiper.

module.exports = SimpleSwiper;
