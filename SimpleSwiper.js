var AbstractSwiper = require("./AbstractSwiper.js");

// Argument is id of container with slides
var SimpleSwiper = function(options) {

	var _this = this;

	AbstractSwiper.call(this, options);

	this._container = document.querySelector(this._getSelectorForComponent('container'));
	this._items = this._container.children;

	// this._containerSize = this._container.offsetWidth;

	// By default slide has width of enclosing container. Slide margin by default is 0.
	if (typeof options.slideSize === 'undefined') {
		this._options.slideSize = function() {
			return _this._containerSize;
		}
	}

	this._options.containerSize = function() {
		return _this._containerSize;
	}

	this._options.count = this._items.length;

	this._options.onMove = function(coords) {
		for(var i = 0; i < _this._items.length; i++) {
			var item = _this._items[i];

			var direction = _this._options.direction == AbstractSwiper.HORIZONTAL ? 'X' : 'Y';
			item.style.transform = 'translate' + direction + '(' + coords.position + 'px)'
		}

		if (typeof options.onMove !== 'undefined') {
			options.onMove(coords);
		}
	}

	this._positionElements = function() {
		this._containerSize = _this._options.direction == AbstractSwiper.HORIZONTAL ? 
			this._container.offsetWidth : 
			this._container.offsetHeight;

		var distance = 0;

		for(var i = 0; i < this._items.length; i++) {
			var item = this._items[i];

			item.style.position = "absolute";

			if (_this._options.direction == AbstractSwiper.HORIZONTAL) {
				item.style.left = distance;
				item.style.height = "100%";
				item.style.width = this._options.slideSize(i);
				item.style.top = 0;
			}
			else {
				item.style.left = 0;
				item.style.width = "100%";
				item.style.height = this._options.slideSize(i);
				item.style.top = distance;
			}

			item.style["will-change"] = "transform";

			distance += this._options.slideSize(i);
			distance += this._options.slideMarginSize(i);
		}
	}

	// SimpleSwiper has its own layout!
	this.layout = function() {
		this._positionElements();
		AbstractSwiper.prototype.layout.call(this);
	}

	this.init = function() {
		this.layout();
		this.enable();
	}
	
	this.initComponents();

}

// Javascript inheritance of prototype
SimpleSwiper.prototype = Object.create(AbstractSwiper.prototype);


// SimpleSwiper.

module.exports = SimpleSwiper;
