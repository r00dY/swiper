import TouchSpace from "../components/touchSpace/TouchSpace";
import AbstractSlider from "../AbstractSlider";

class SliderAbsolute {

    constructor(container, config) {
        this.config = config;

        this._container = container;
        this._containerInner = container.firstElementChild;
        this._items = this._containerInner.children;
    }

    layout() {
        if (!this.engine) {
            let config = Object.assign({}, this.config, {
                containerSize: this._container.clientWidth,
                count: this._items.length
            });
            this.engine = new AbstractSlider(config);
        }

        // Reset heights
        this._heights = [];
        for(let i = 0; i < this._items.length; i++) {
            this._heights.push(0);
        }

        this._positionElements();
        this._onMove();

        this.engine.addEventListener('move', () => {
            this._onMove();
        });

        this.touchSpace = new TouchSpace(this.engine, this._container); // internal touch space. No need to enable it. Very low cost if not enabled.
    }

    _onMove() {
        let oldHeight = Math.max.apply(this, this._heights);

        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];

            let transform = `translate3d(${this.engine.state.slides[i].coord}px, 0px, 0px)`;

            if (this.config.displayNoneAutomatically) {

                if (this.engine.slides[i].visibility === 0) {
                    item.style.display = 'none';
                    this._heights[i] = 0;
                } else {
                    item.style.display = 'block';
                    item.style.transform = transform;

                    if (this._heights[i] == 0) { this._heights[i] = item.offsetHeight; }
                }

            }
            else {
                item.style.transform = transform;
            }
        }

        if (this.config.displayNoneAutomatically) {
            let newHeight = Math.max.apply(this, this._heights);
            if (newHeight != oldHeight) {
                this._containerInner.style.height = newHeight + 'px';
            }
        }
    }

    _positionElements() {
        this._containerInner.style["position"] = "relative";

        for (let n = 0; n < this._items.length; n++) {
            let item = this._items[n];

            item.style["position"] = "absolute";
            item.style["width"] = this.engine.state.slides[n].size + 'px';

            // All items should be visible
            if (!this.config.displayNoneAutomatically) {
                item.style["display"] = "block";
            }
        }

        // Set slider height based on highest item.
        if (!this.config.displayNoneAutomatically) {
            let maxHeight = 0;

            for (let n = 0; n < this._items.length; n++) {
                let item = this._items[n];
                maxHeight = Math.max(item.offsetHeight, maxHeight);
            }

            this._containerInner.style.height = maxHeight + 'px';
        }
    }
}

export default SliderAbsolute;