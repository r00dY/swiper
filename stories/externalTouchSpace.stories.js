import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import ReactSimpleSwiper from "../src/react/ReactSimpleSwiper";
import TouchSpace from "../src/components/touchSpace/TouchSpace";


class SimpleSwiperWithExternalTouchSpace extends React.Component {

    constructor(props) {
        super(props);

        this.slider = React.createRef();
        this.touchSpaceNode = React.createRef();
    }

    componentDidUpdate() {
        this.slider.current.slider.layout();
    }

    componentDidMount() {
        this.slider.current.slider.layout();

        // Let's create new touch space which is external.
        this.touchSpace = new TouchSpace(this.slider.current.slider, this.touchSpaceNode.current);
        this.touchSpace.enable();
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    ref={this.slider}
                    className={'swiper'}
                    slideSize={() => 200}
                    rightOffset={() => 100}
                    leftOffset={() => 50}
                    slideSnapOffset={() => 50}
                    slideMargin={() => 20}
                    infinite={false}
                    disableInternalTouchSpace={true} // this flag disables default internal touchSpace of SimpleSwiper
                >
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                    <div className="slide"></div>
                </ReactSimpleSwiper>

                <div ref={this.touchSpaceNode} style={{width: '50%', height: '200px', cursor: 'pointer', background: 'pink', marginTop: '40px'}}>
                    <div>SWIPE HERE</div>
                </div>
            </div>
        );
    }
}

storiesOf('Slider', module)
    .add('external touch space', () =>
        <div className='ReactSlider__example'>
            <h1>Slider with external touch space</h1>

            <SimpleSwiperWithExternalTouchSpace />
        </div>
    );