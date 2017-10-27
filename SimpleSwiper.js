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

        var oldHeight = Math.max.apply(this, _this._heights);

        for (var i = 0; i < _this._items.length; i++) {
            var item = _this._items[i];

            if (visibilities[i] == 0) {
                item.style.display = 'none';

                _this._heights[i] = 0;
            } else {
                item.style.display = 'block';
                item.style.transform = 'translate3d(' + coords.absolutePositions[i] + 'px, 0px, 0px)';

                if (_this._heights[i] == 0) { _this._heights[i] = item.offsetHeight; }
            }
        }

        var newHeight = Math.max.apply(this, _this._heights);
        if (newHeight != oldHeight) {
            _this._containerInner.style.height = newHeight + 'px';
        }

    });

    this._positionElements = function() {
        _this._containerInner.style["position"] = "relative";

        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];

            item.style["position"] = "absolute";
            item.style["width"] = this._getValueFromOptions('slideSize', i) + 'px';
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

        // Reset heights
        _this._heights = [];
        for(var i = 0; i < this._items.length; i++) {
            _this._heights.push(0);
        }

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


// SimpleSwiper
module.exports = SimpleSwiper;
