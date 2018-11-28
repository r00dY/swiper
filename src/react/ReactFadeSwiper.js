import React from "react";
import FadeSwiper from "../native/FadeSwiper";
import PropTypes from "prop-types";


class ReactFadeSwiper extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    componentDidUpdate() {
        this.slider.infinite = this.props.infinite;
        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;
    }

    componentDidMount() {
        this.slider = new FadeSwiper(this.container.current);

        this.slider._initialSlide = this.props.initialSlide;

        this.slider.slideSizeFunction = this.props.slideSize;

        this.slider.rightOffsetFunction = this.props.rightOffset;

        this.slider.leftOffsetFunction = this.props.leftOffset;

        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;

        this.slider.slideMarginFunction = this.props.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = true;

        this.slider.containerSizeFunction = this.props.containerSize;

        this.slider.infinite = this.props.infinite;

        this.slider.count = this.props.children.length;
        this.count = this.props.children.length;

        this.slider.addEventListener('visibleSlidesChange', () => {
            if (this.props.onVisibleSlidesChange) {
                this.props.onVisibleSlidesChange();
            }
        });

        this.slider.addEventListener('activeSlidesChange', () => {
            if (this.props.onActiveSlidesChange) {
                this.props.onActiveSlidesChange();
            }
        });

        this.slider.addEventListener('move', () => {
            if (this.props.onMove) {
                this.props.onMove();
            }
        });

        this.slider.enableTouch();
    }

    layout() {
        this.slider.layout();
    }

    /** This function is necessary for swiper arrows to work */
    moveRight() {
        this.slider.moveRight();
    }

    /** This function is necessary for swiper arrows to work */
    moveLeft() {
        this.slider.moveLeft();
    }

    /** This function is necessary for swiper arrows to work */
    addEventListener(event, cb) {
        this.slider.addEventListener(event, cb);
    }

    /** This function is necessary for swiper arrows to work */
    activeSlides() {
        return this.slider.activeSlides();
    }

    /** This function is necessary for swiper pager to work */
    moveToSlide(n, animated) {
        this.slider.moveToSlide(n, animated);
    }


    visibleSlides() {
        return this.slider.visibleSlides();
    }

    slideVisibility(n) {
        return this.slider.slideVisibility(n);
    }

    render() {
        return (
            <div className={this.props.containerClasses} ref={this.container}>
                {this.props.children}
            </div>
        );
    }
}

ReactFadeSwiper.defaultProps = {
    initialSlide: 0,
};


ReactFadeSwiper.propTypes = {
    slideSize: PropTypes.func.isRequired,
    slideMargin: PropTypes.func.isRequired,
    slideSnapOffset: PropTypes.func.isRequired,
    containerSize: PropTypes.func.isRequired,
    rightOffset: PropTypes.func.isRequired,
    leftOffset: PropTypes.func.isRequired,
    infinite: PropTypes.bool,
    onVisibleSlidesChange: PropTypes.func,
    onActiveSlidesChange: PropTypes.func,
    onMove: PropTypes.func,
    initialSlide: PropTypes.number,
    containerClasses: PropTypes.string,
    snapOnlyToAdjacentSlide: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    containerStyles: PropTypes.object,
    relayout: PropTypes.bool,
};

export default ReactFadeSwiper;