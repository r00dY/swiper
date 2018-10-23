import React from "react";
import ReactSimpleSwiper from "../../presets/React/ReactSimpleSwiper";

class SimpleSwiperWithDynamicSlides extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            slides: props.slides,
            initalSlide: 0
        };

        this.slider = React.createRef();
    }

    componentDidUpdate() {
        this.slider.current.layout();
    }
    
    componentDidMount() {
        this.slider.current.layout();
    }

    addNewSlide() {
        let slides = this.state.slides;
        slides.push(<div className="slide">Dynamically added slide</div>);
        this.setState({slides});
        this.slider.current.moveToSlide(slides.length - 3);
    }

    render() {
        return (
            <div className='ReactSlider__example'>
                <ReactSimpleSwiper
                    containerClasses='swiper'
                    enableTouch={true}
                    ref={this.slider}
                    slideSize={() => 200}
                    rightOffset={() => 20}
                    leftOffset={() => 20}
                    slideSnapOffset={() => 20}
                    slideMargin={() => 20}
                    infinite={true}
                    relayout={true}
                    initialSlide={this.state.initalSlide}
                >
                    {this.state.slides}
                </ReactSimpleSwiper>


                <div className='ReactSlider__paramSetter'>
                    <p>Slides amount</p>
                    <span>{this.state.slides.length}</span>
                </div>


                <div className='ReactSlider__paramSetter'>
                    <p>Add new slide</p>
                    <button onClick={this.addNewSlide.bind(this)}>Add</button>
                </div>
            </div>
        )
    }
}

export default SimpleSwiperWithDynamicSlides;