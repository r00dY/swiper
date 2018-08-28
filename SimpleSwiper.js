let TouchSwiper = require("./TouchSwiper");

class SimpleSwiper extends TouchSwiper {

    constructor(name) {
        super(name);

        this._container = document.querySelector(this._getSelectorForComponent('container'));
        this._containerInner = this._container.querySelector('.swiper-items');
        this._items = this._containerInner.children;

        this.addEventListener('move', () => {
            this._onMove();
        });

        this._wasLaidOut = false;

        this.displayNoneAutomatically = true;
    }

    layout() {
        this.blockEvents();

        this.containerSizeFunction = () => this._container.offsetWidth;
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

        this.unblockEvents();

        this._runEventListeners('move');
        this._runEventListeners('activeSlidesChange');
        this._runEventListeners('visibleSlidesChange');

        this._wasLaidOut = true;
    }

    _onMove() {
        let oldHeight = Math.max.apply(this, this._heights);

        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];

            let coord = this.slideCoord(i);

            if (this.displayNoneAutomatically) {

                if (!this.isSlideVisible(i)) {
                    item.style.display = 'none';
                    this._heights[i] = 0;
                } else {
                    item.style.display = 'block';
                    item.style.transform = 'translate3d(' + coord + 'px, 0px, 0px)';

                    if (this._heights[i] == 0) { this._heights[i] = item.offsetHeight; }
                }

            }
            else {
                item.style.transform = 'translate3d(' + coord + 'px, 0px, 0px)';
            }
        }

        if (this.displayNoneAutomatically) {
            let newHeight = Math.max.apply(this, this._heights);
            if (newHeight != oldHeight) {
                this._containerInner.style.height = newHeight + 'px';
            }
        }
    }

    _positionElements() {
        this._containerInner.style["position"] = "relative";

        let maxHeight = 0;

        for (let n = 0; n < this._items.length; n++) {
            let item = this._items[n];

            item.style["position"] = "absolute";
            item.style["width"] = this.slideSize(n) + 'px';

            // All items should be visible
            if (!this.displayNoneAutomatically) {
                item.style["display"] = "block";
            }
        }

        // Set slider height based on highest item.
        if (!this.displayNoneAutomatically) {
            let maxHeight = 0;

            for (let n = 0; n < this._items.length; n++) {
                let item = this._items[n];
                maxHeight = Math.max(item.offsetHeight, maxHeight);
            }

            this._containerInner.style.height = maxHeight + 'px';

        }
    }
}

module.exports = SimpleSwiper;