import React from "react";
import SimpleSwiper from "../native/SimpleSwiper";

// import PropTypes from "prop-types";
// import EventSystem from "../helpers/EventSystem";

class ReactSimpleSwiper extends React.Component {

    constructor(props) {
        super(props);

        this.infinite = this.props.infinite;
        this.container = React.createRef();
    }

    componentDidUpdate() {
        this._updateSliderBasedOnProps();
    }

    componentDidMount() {
        this.slider = new SimpleSwiper(
            this.container.current,
        );

        this._registerEventListeners();
        this._updateSliderBasedOnProps();
    }

    render() {
        return (
            <div className={this.props.className} style={this.props.style} ref={this.container}>
                <div className={this.props.innerContainerClasses}>
                    {this.props.children}
                </div>
            </div>
        )
    }

    /**
     * Helpers making API of ReactSimpleSwiper more React-friendly
     */

    _registerEventListeners() {
        this.slider.addEventListener('move', () => { if (this.props.onMove) { this.props.onMove(); } });
        this.slider.addEventListener('animationStart', () => { if (this.props.onAnimationStart) { this.props.onAnimationStart(); } });
        this.slider.addEventListener('animationEnd', () => { if (this.props.onAnimationEnd) { this.props.onAnimationEnd(); } });
        this.slider.addEventListener('stillnessChange', () => { if (this.props.onStillnessChange) { this.props.onStillnessChange(); } });
        this.slider.addEventListener('touchdown', () => { if (this.props.onTouchDown) { this.props.onTouchDown(); } });
        this.slider.addEventListener('touchup', () => { if (this.props.onTouchUp) { this.props.onTouchUp(); } });
        this.slider.addEventListener('activeSlidesChange', () => { if (this.props.onActiveSlidesChange) { this.props.onActiveSlidesChange(); } });
        this.slider.addEventListener('visibleSlidesChange', () => { if (this.props.onVisibleSlidesChange) { this.props.onVisibleSlidesChange(); } });
    }

    _updateSliderBasedOnProps() {

        // SimpleSwiper - enable / disable touch
        if (this.props.disableInternalTouchSpace) {
            this.slider.touchSpace.disable()
        } else {
            this.slider.touchSpace.enable();
        }

        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;

        // SwiperEngine
        this.slider.animationEngine = this.props.animationEngine;
        this.slider.slideSizeFunction = this.props.slideSize;
        this.slider.slideMarginFunction = this.props.slideMargin;
        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;
        this.slider.rightOffsetFunction = this.props.rightOffset;
        this.slider.leftOffsetFunction = this.props.leftOffset;
        this.slider.overscrollFunction = this.props.overscrollFunction;
        this.slider.infinite = this.props.infinite;
        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;
        this.slider.initialSlide = this.props.initialSlide;
        this.slider.initialPos = this.props.initialPos;
    }
}

// ReactSimpleSwiper.defaultProps = {
//     displayNoneAutomatically: true,
//     initialSlide: 0,
//     enableTouch: true,
//     disableInternalTouchSpace: false
// };
//
// ReactSimpleSwiper.propTypes = {
//     slideSize: PropTypes.func,
//     slideMargin: PropTypes.func.isRequired,
//     slideSnapOffset: PropTypes.func.isRequired,
//     rightOffset: PropTypes.func,
//     leftOffset: PropTypes.func,
//     displayNoneAutomatically: PropTypes.bool,
//     infinite: PropTypes.bool,
//     snapOnlyToAdjacentSlide: PropTypes.bool,
//     children: PropTypes.arrayOf(PropTypes.element).isRequired,
//     className: PropTypes.string,
//     style: PropTypes.object,
//     initialSlide: PropTypes.number,
//     initialPos: PropTypes.number,
//     onMove: PropTypes.func,
//     onVisibleSlidesChange: PropTypes.func,
//     onActiveSlidesChange: PropTypes.func,
//     disableInternalTouchSpace: PropTypes.bool
// };

export default ReactSimpleSwiper;