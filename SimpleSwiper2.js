let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");

let AbstractSwiper2 = require("./AbstractSwiper2");


class SimpleSwiper2 extends AbstractSwiper2 {

    constructor(name) {
        super(name);

        this._container = document.querySelector(this._getSelectorForComponent('container'));
        this._containerInner = this._container.querySelector('.swiper-items');
        this._items = this._containerInner.children;

        this.addEventListener('move', () => {
            this._onMove();
        });

        this.onResizeListener = () => {
            this.layout();
        };

        // Default resize.
        window.addEventListener('resize', () => {
            this.onResizeListener();
        });

        this._wasLaidOut = false;
    }

    layout() {
        this.eventsBlocked = true;

        this.containerSize = this._container.offsetWidth;
        this.count = this._items.length;

        // previousRelativePosition must be read before super.layout!
        let previousRelativePosition = this._wasLaidOut ? this.pos / this.slideableWidth : undefined;

        super.layout();

        // Reset heights
        this._heights = [];
        for(let i = 0; i < this._items.length; i++) {
            this._heights.push(0);
        }

        if (this._wasLaidOut) {
            this.moveTo(this.slideableWidth * previousRelativePosition, false);
            this.snap(0, false);
        }

        this._positionElements();

        this.eventsBlocked = false;

        this._runEventListeners('move');

        this._wasLaidOut = true;
    }

    _onMove() {
        let oldHeight = Math.max.apply(this, this._heights);

        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];

            let coord = this.slideCoord(i);

            if (!this.isSlideVisible(i)) {
                item.style.display = 'none';
                this._heights[i] = 0;
            } else {
                item.style.display = 'block';
                item.style.transform = 'translate3d(' + coord + 'px, 0px, 0px)';

                if (this._heights[i] == 0) { this._heights[i] = item.offsetHeight; }
            }
        }

        let newHeight = Math.max.apply(this, this._heights);
        if (newHeight != oldHeight) {
            this._containerInner.style.height = newHeight + 'px';
        }
    }

    _positionElements() {
        this._containerInner.style["position"] = "relative";

        for (let n = 0; n < this._items.length; n++) {
            let item = this._items[n];

            item.style["position"] = "absolute";
            item.style["width"] = this.slideSize(n) + 'px';
        }
    }

}


module.exports = SimpleSwiper2;