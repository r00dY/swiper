import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import ReactSimpleSwiper from "../src/react/ReactSimpleSwiper";

class SimpleSwiperWithDynamicSlides extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            slidesNum: 10
        };

        this.slider = React.createRef();
    }

    componentDidUpdate() {
        this.slider.current.slider.layout();
    }

    componentDidMount() {
        this.slider.current.slider.layout();
    }

    addNewSlide() {
        this.setState({
            slidesNum: this.state.slidesNum + 1
        });
    }

    render() {
        return (
            <div className='ReactSlider__example'>
                <ReactSimpleSwiper
                    className='swiper'
                    ref={this.slider}
                    slideSize={() => 200}
                    rightOffset={() => 20}
                    leftOffset={() => 20}
                    slideSnapOffset={() => 20}
                    slideMargin={() => 20}
                    infinite={false}
                >
                    {[...Array(this.state.slidesNum).keys()].map((i) => {
                        return <div className="slide">{i} slide</div>;
                    })}
                </ReactSimpleSwiper>

                <div className='ReactSlider__paramSetter'>
                    <p>Slides amount</p>
                    <span>{this.state.slidesNum}</span>
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Add new slide</p>
                    <button onClick={this.addNewSlide.bind(this)}>Add</button>
                </div>
            </div>
        )
    }
}
storiesOf('Slider', module)
    .add('dynamic slides', () =>
        <div>
            <h1>Slider with dynamic slides</h1>

            <SimpleSwiperWithDynamicSlides />
        </div>
    );