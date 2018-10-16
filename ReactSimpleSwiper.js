import React from "react";

import SimpleSwiper from "./SimpleSwiper";
import ReactTouchSwiper from "./ReactTouchSwiper";

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
        this.count = this.props.children.length
    }
}

export default ReactSimpleSwiper;