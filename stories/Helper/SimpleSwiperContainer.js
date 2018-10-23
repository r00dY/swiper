import React from "react";
import ReactSimpleSwiper from "../../presets/React/ReactSimpleSwiper";


class SimpleSwiperContainer extends React.Component {
    constructor(props) {
        super(props);
        this.slider = React.createRef();
    }

    componentDidMount() {
        this.slider.current.layout();
    }

    render() {
        return (
            <ReactSimpleSwiper
                containerClasses='swiper'
                slideSize={this.props.slideSize}
                rightOffset={() => 100}
                leftOffset={() => 50}
                slideSnapOffset={() => 50}
                slideMargin={() => 20}
                infinite={false}
                ref={this.slider}
            >
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
            </ReactSimpleSwiper>
        );
    }
}

export default SimpleSwiperContainer;