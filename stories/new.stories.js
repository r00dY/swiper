import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import ReactSliderAbsolute from "../src/react/ReactSliderAbsolute";

class SimpleSwiperWithParams extends React.Component {
    constructor(props) {
        super(props);

        this.swiper = React.createRef();
    };

    componentDidMount() {
        this.swiper.current.touchSpace.enable();
    }

    render() {
        return (
            <div>
                <div className={"swiper"}>
                    <ReactSliderAbsolute config={{
                        slideSize: () => 200,
                        slideMargin: () => 20
                    }} ref={this.swiper}>
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
                    </ReactSliderAbsolute>
                </div>
                <button onClick={() => this.swiper.current.engine.moveLeft()}>Left</button>
                <button onClick={() => this.swiper.current.engine.moveRight()}>Right</button>
            </div>
        )
    }
}

storiesOf('Slider', module)
    .add('default', () =>
        <div className='ReactSlider__example'>
            <h1>Default slider</h1>
            <p>With arrows and pager set up. </p>
            <p>There are also slider params to edit, to see how it will look like.</p>
            <p>IMPORTANT!!! Params values are relative to each other.</p>
            <p>Slide size set up to 200 <b>DOES NOT</b> mean 200px. Container size is a point of reference.</p>
            <p>Also quite important fact is that every slide can have different width.</p>

            <SimpleSwiperWithParams />
        </div>
    );