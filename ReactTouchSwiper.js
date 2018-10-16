import React from "react";
import TouchSwiper from "./TouchSwiper";
import PropTypes from "prop-types";

class ReactTouchSwiper extends React.Component {
    constructor(props) {
        super(props);
        this.slider = null;
        this.count = 0;
    }

    componentDidMount() {
        this.slider = new TouchSwiper(this.props.name);
        this.slider.slideSizeFunction = this.props.slideSize;

        this.slider.rightOffsetFunction = this.props.rightOffset;

        this.slider.leftOffsetFunction = this.props.leftOffset;

        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;

        this.slider.slideMarginFunction = this.props.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;

        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;

        this.slider.infinite = this.props.infinite;
        if (this.props.enableTouch) {
            this.slider.enableTouch();
        }
        this.count = this.props.children.length
    }

    addEventListener(eventName, listener) {
        this.slider.addEventListener(eventName, listener);
    }

    moveTo(pos, animated, side) {
        this.slider.moveTo(pos, animated, side);
    }

    moveToSlide(n, animated, direction) {
        this.slider.moveToSlide(n, animated, direction);
    }

    moveRight(animated) {
        this.slider.moveRight(animated);
    }

    moveLeft(animated) {
        this.slider.moveLeft(animated);
    }

    slideVisibility(n) {
        return this.slider.slideVisibility(n);
    }

    isSlideVisible(n) {
        return this.slider.slideVisibility(n);
    }

    visibleSlides() {
        return this.slider.visibleSlides();
    }

    activeSlides() {
        return this.slider.activeSlides();
    }

    isSlideActive(n) {
        return this.slider.isSlideActive(n);
    }

    render() {
        return (
            <div className="ReactSlider">
                <div className="swiper swiper-touch-space swiper-container" data-swiper={this.props.name}>
                    <div className="swiper-items">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

ReactTouchSwiper.propTypes = {
    name: PropTypes.string.isRequired,
    slideMargin: PropTypes.func.isRequired,
    slideSnapOffset: PropTypes.func.isRequired,
    displayNoneAutomatically: PropTypes.bool,
    enableTouch: PropTypes.bool,
    slideSize: PropTypes.func,
    rightOffset: PropTypes.func,
    leftOffset: PropTypes.func,
    infinite: PropTypes.bool,
    snapOnlyToAdjacentSlide: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element)
};

export default ReactTouchSwiper;