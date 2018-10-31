import React from "react";
import ReactSimpleSwiper from "../../presets/React/ReactSimpleSwiper";


class SimpleSwiperContainer extends React.Component {
    constructor(props) {
        super(props);
        this.slider = React.createRef();


        this.state = {
            activeSlides: []
        }
    }

    componentDidMount() {
        this.slider.current.layout();
    }

    onMove() {
        if (this.state.activeSlides.join("-") !== this.slider.current.activeSlides().join("-")) {
            this.setState({
                activeSlides: this.slider.current.activeSlides(),
            });
        }
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    containerClasses='swiper'
                    slideSize={this.props.slideSize}
                    rightOffset={() => 100}
                    leftOffset={() => 50}
                    slideSnapOffset={() => 50}
                    slideMargin={() => 20}
                    infinite={false}
                    onMove={this.onMove.bind(this)}
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

                <div className='activeSlidesInfo'><span>Active slides:</span> {this.state.activeSlides.join(', ')}</div>
            </div>
        );
    }
}

export default SimpleSwiperContainer;