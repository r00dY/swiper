import React from "react";

import SimpleSwiper from "./SimpleSwiper";
import ReactTouchSwiper from "./ReactTouchSwiper";
import SwiperArrows from "./SwiperArrows";
import SwiperPager from "./SwiperPager";

class ReactSimpleSwiper extends ReactTouchSwiper {

    componentDidMount() {
        this.slider = new SimpleSwiper(this.props.name);
        this.slider.slideSizeFunction = this.props.slideSize;

        this.slider.rightOffsetFunction = this.props.rightOffset;

        this.slider.leftOffsetFunction = this.props.leftOffset;

        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;

        this.slider.slideMarginFunction = this.props.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;

        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;

        this.slider.infinite = this.props.infinite;

        this.slider.layout();
        if (this.props.enableTouch) {
            this.slider.enableTouch();
        }

        if (this.props.arrows) {
            this.arrows = new SwiperArrows(this.slider);
            this.arrows.init();
        }

        if (this.props.enablePager) {
            this.pager = new SwiperPager(this.slider);
            this.pager.init();
        }
    }
}

export default ReactSimpleSwiper;