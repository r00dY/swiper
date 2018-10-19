import React from "react";
import PropTypes from "prop-types";
import TouchSwiper from "../../TouchSwiper";

class ReactFadeSwiper extends React.Component {
    constructor(props) {
        super(props);
        this.touchSpace = React.createRef();
        this.state = {
            slidesVisibility: []
        };
    }

    componentDidUpdate() {

        // this.slider.layout();
        // this.slider.disableTouch();
        // this.layoutSlider(this.slider.activeSlides()[0]);
    }

    componentDidMount() {
        this.layoutSlider();
    }

    layoutSlider() {
        this.slider = new TouchSwiper(this.touchSpace.current);

        this.slider._initialSlide = this.props.initialSlide;

        this.slider.slideSizeFunction = this.props.slideSize;

        this.slider.rightOffsetFunction = this.props.rightOffset;

        this.slider.leftOffsetFunction = this.props.leftOffset;

        this.slider.slideSnapOffsetFunction = this.props.slideSnapOffset;

        this.slider.slideMarginFunction = this.props.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = this.props.snapOnlyToAdjacentSlide;

        this.slider.containerSizeFunction = this.props.containerSize;

        this.slider.displayNoneAutomatically = this.props.displayNoneAutomatically;

        this.slider.infinite = this.props.infinite;

        this.slider.count = this.props.children.length;

        this.slider.addEventListener('move', () => {
            this.onMove();
            if (this.props.onMove) {
                this.props.onMove();
            }
        });

        this.slider.layout();

        this.slider.enableTouch();

        this.count = this.props.children.length
    }

    onMove() {
        let visibilities = [];
        for(let i = 0; i < this.props.children.length; i++ ) {
            visibilities.push(this.slider.slideVisibility(i))
        }

        this.setState({
            slidesVisibility: visibilities
        });

    }

    getSlideStyles(index) {
        let slideStyles = {};
        let visibility = this.state.slidesVisibility[index];

        if (visibility < 0.01) {
            slideStyles.display = 'none';
        } else {
            slideStyles.display = 'block';
            slideStyles.opacity = visibility;
        }

        return slideStyles;
    }

    render() {
        return(
            <div className={this.props.containerClasses} style={this.props.containerStyles} ref={this.touchSpace}>
                <div className={this.props.innerContainerClasses} >
                    {this.props.children.map((slide, index) =>
                        <div style={this.getSlideStyles(index)}>{slide}</div>
                    )}
                </div>
            </div>
        );
    }
}

ReactFadeSwiper.defaultProps = {
    initialSlide: 0
};

ReactFadeSwiper.propTypes = {
    containerSize: PropTypes.func.isRequired,
    slideSize: PropTypes.func.isRequired,
    slideMargin: PropTypes.func.isRequired,
    slideSnapOffset: PropTypes.func.isRequired,
    leftOffset: PropTypes.func.isRequired,
    rightOffset: PropTypes.func.isRequired,
    containerClasses: PropTypes.string,
    innerContainerClasses: PropTypes.string,
    containerStyles: PropTypes.object,
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    initialSlide: PropTypes.number,
    onMove: PropTypes.func
};

export default ReactFadeSwiper;