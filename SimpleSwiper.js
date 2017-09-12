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
      return _this._options.direction == AbstractSwiper.HORIZONTAL ?
      _this._container.offsetWidth :
      _this._container.offsetHeight;
      // return _this._containerSize;
    }

  }

  if (typeof options.slideSize === 'undefined') {
    this._options.slideSize = function() {
      return _this._options.containerSize();
    }
  }


  function init() {
    _this._items = _this._containerInner.children;
    _this._options.count = _this._items.length;
  }

  init();


  this._options.onMove = function(coords) {
    // console.log(coords.positions);

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
    // this._containerSize = _this._options.direction == AbstractSwiper.HORIZONTAL ?
    //   this._container.offsetWidth :
    //   this._container.offsetHeight;

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
        item.style["width"] = this._options.slideSize(i);
        item.style["margin-right"] = this._options.slideMarginSize(i);

      } else {

        item.style["position"] = "relative";
        item.style["height"] = this._options.slideSize(i);
        item.style["margin-bottom"] = this._options.slideMarginSize(i);

        // this._containerInner.style["height"] = "1000000px";
        // this._containerInner.style["flex-flow"] = "column nowrap";


        // item.style.left = 0;
        // item.style.width = "100%";
        // item.style.height = this._options.slideSize(i);
        // item.style.top = distance;
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
  }

}

// Javascript inheritance of prototype
SimpleSwiper.prototype = Object.create(AbstractSwiper.prototype);


// SimpleSwiper.

module.exports = SimpleSwiper;
