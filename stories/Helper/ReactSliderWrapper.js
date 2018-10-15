import React from "react";
import ReactSimpleSwiper from "../../ReactSimpleSwiper";
import "./ReactSliderWrapper.scss"

class ReactSliderWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.slider = React.createRef();
    }

    goToSlide(n) {
        this.slider.current.moveToSlide(n -1);
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    enablePager={true}
                    enableTouch={true}
                    displayNoneAutomatically={this.props.displayNoneAutomatically}
                    name='swiper-1'
                    ref={this.slider}
                    slideSize={() => {
                        return 200;
                    }}

                    rightOffset={() => {
                        return 40;
                    }}

                    leftOffset={() => {
                        return 40;
                    }}

                    slideSnapOffset={() => {
                        return 20;
                    }}

                    slideMargin={() => {
                        return 40;
                    }}
                    snapOnlyToAdjacentSlide={true}

                    arrows={[
                        <button>PREV</button>,
                        <button>NEXT</button>
                    ]}

                    infinite={this.props.infinite}
                >
                    {this.props.slides}
                </ReactSimpleSwiper>
                <button onClick={this.goToSlide.bind(this, 1)}>Go to first slide</button>
                <button onClick={this.goToSlide.bind(this, this.props.slides.length)}>Go to last slide</button>
            </div>
        )
    }
}

export default ReactSliderWrapper;