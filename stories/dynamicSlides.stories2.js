import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.css";

import SimpleSlider from "../src/SimpleSlider";

class SimpleSwiperWithDynamicSlides extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            slidesNum: 10
        };

        this.simpleSwiperNodeRef = React.createRef();
    }

    componentDidUpdate() {
        this.slider.layout();
    }

    componentDidMount() {
        this.slider = new SimpleSlider(this.simpleSwiperNodeRef.current);
        this.slider.slideSizeFunction = () => 200;
        this.slider.touchSpace.enable();
        this.slider.layout();
    }

    addNewSlide() {
        this.setState({
            slidesNum: this.state.slidesNum + 1
        });
    }

    render() {
        return (
            <div className='ReactSlider__example'>

                <div className={"swiper"} ref={this.simpleSwiperNodeRef}>
                    <div>
                        {[...Array(this.state.slidesNum).keys()].map((i) => {
                            return <div className="slide">{i} slide</div>;
                        })}
                    </div>
                </div>

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

            <SimpleSwiperWithDynamicSlides/>
        </div>
    );