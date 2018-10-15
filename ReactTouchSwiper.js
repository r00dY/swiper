import React from "react";
import TouchSwiper from "./TouchSwiper";
import PropTypes from "prop-types";
import SwiperArrows from "./SwiperArrows";
import SwiperPager from "./SwiperPager";

class ReactTouchSwiper extends React.Component {
    constructor(props) {
        super(props);
        this.slider = null;
        this.arrows = null;
        this.pager = null;
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

        if (this.props.arrows) {
            this.arrows = new SwiperArrows(this.slider);
            this.arrows.init();
        }

        if (this.props.enablePager) {
            this.pager = new SwiperPager(this.slider);
            this.pager.init();
        }
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

    renderPager() {
        return (
            <div className="pager">
                <div className="swiper-pager-item" data-swiper={this.props.name}>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="ReactSlider">
                <div className="swiper swiper-touch-space swiper-container" data-swiper={this.props.name}>
                    <div className="swiper-items">
                        {this.props.children}
                    </div>
                </div>
                {React.cloneElement(this.props.arrows[0], {className: this.props.arrows[0].props.className + ' swiper-click-space-previous', 'data-swiper': this.props.name})}
                {React.cloneElement(this.props.arrows[1], { className: this.props.arrows[1].props.className + ' swiper-click-space-next', 'data-swiper': this.props.name} )}

                {this.props.enablePager? this.renderPager() : null}
            </div>
        );
    }
}

ReactTouchSwiper.propTypes = {
    name: PropTypes.string.isRequired,
    slideMargin: PropTypes.func.isRequired,
    slideSnapOffset: PropTypes.func.isRequired,
    displayNoneAutomatically: PropTypes.bool,
    enablePager: PropTypes.bool,
    arrows: PropTypes.arrayOf(PropTypes.element),
    enableTouch: PropTypes.bool,
    slideSize: PropTypes.func,
    rightOffset: PropTypes.func,
    leftOffset: PropTypes.func,
    infinite: PropTypes.bool,
    snapOnlyToAdjacentSlide: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element)
};

export default ReactTouchSwiper;