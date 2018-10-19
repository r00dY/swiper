import React from "react";

import SimpleSwiper from "../../SimpleSwiper";
import PropTypes from "prop-types";

class ReactSimpleSwiper extends React.Component {

    constructor(props) {
        super(props);

        this.container = React.createRef();
    }

    componentDidUpdate() {
        if(this.props.enableTouch) {
            this.slider.enableTouch();
        } else {
            this.slider.disableTouch();
        }

        this.slider.infinite = this.props.infinite;
        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;
        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;

        this.slider.layout();
    }

    componentDidMount() {
        this.layoutSlider();
    }

    layoutSlider() {
        this.slider = new SimpleSwiper(
            this.container.current,
            this.container.current
        );

        this.slider._initialSlide = this.props.initialSlide;

        this.slider.slideSizeFunction = this.props.slideSize;

        this.slider.rightOffsetFunction = this.props.rightOffset;

        this.slider.leftOffsetFunction = this.props.leftOffset;

        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;

        this.slider.slideMarginFunction = this.props.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;

        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;

        this.slider.infinite = this.props.infinite;

        this.slider.count = this.props.children.length;

        this.slider.addEventListener('move', () => {
            if (this.props.onMove) {
                this.props.onMove();
            }
        });

        this.slider.layout();

        if (this.props.enableTouch) {
            this.slider.enableTouch();
        }
        this.count = this.props.children.length
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
    moveToSlide(n) {
        this.slider.moveToSlide(n);
    }

    render() {
        return (
            <div className={this.props.containerClasses} style={this.props.containerStyles} ref={this.container}>
                <div className={this.props.innerContainerClasses}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

ReactSimpleSwiper.defaultProps = {
    displayNoneAutomatically: true,
    initialSlide: 0,
    enableTouch: true,
};

ReactSimpleSwiper.propTypes = {
    slideSize: PropTypes.func,
    slideMargin: PropTypes.func.isRequired,
    slideSnapOffset: PropTypes.func.isRequired,
    displayNoneAutomatically: PropTypes.bool,
    enableTouch: PropTypes.bool,
    rightOffset: PropTypes.func,
    leftOffset: PropTypes.func,
    infinite: PropTypes.bool,
    snapOnlyToAdjacentSlide: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    touchSpace: PropTypes.element,
    containerClasses: PropTypes.string,
    containerStyles: PropTypes.object,
    innerContainerClasses: PropTypes.string,
    initialSlide: PropTypes.number,
};

export default ReactSimpleSwiper;