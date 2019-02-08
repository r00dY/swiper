import TouchSpace from "./components/touchSpace/TouchSpace";
import AbstractSlider from "./AbstractSlider";

class SimpleSwiper  {

    constructor(config) {
        // if (!config.container) { throw new Error("SimpleSwiper: 'container' must be in config and must be node"); }
        if (!config.slideSize) { throw new Error("SimpleSwiper: 'slideSize' must be in config"); }
        if (!config.count) { throw new Error("SimpleSwiper: 'count' must be in config"); }

        // this._container = config.container;
        // this._containerInner = this._container.firstElementChild;
        // this._items = this._containerInner.children;
        //
        //
        // this._container = container;



    }

}

export default SimpleSwiper;