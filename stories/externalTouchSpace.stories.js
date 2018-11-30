import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

// import ReactSimpleSwiper from "../src/react/ReactSimpleSwiper";
import TouchSpace from "../src/components/touchSpace/TouchSpace";
import SimpleSlider from "../src/SimpleSlider";


class SimpleSwiperWithExternalTouchSpace extends React.Component {

    constructor(props) {
        super(props);

        this.simpleSliderNodeRef = React.createRef();
        this.touchSpaceNode = React.createRef();
    }

    componentDidUpdate() {
        this.slider.layout();
    }

    componentDidMount() {
        this.slider = new SimpleSlider(this.simpleSliderNodeRef.current);
        this.slider.slideSizeFunction = () => 200;
        this.slider.layout();

        // We don't enable this.slider.touchSpace!!!

        // Let's create new touch space which is external.
        this.touchSpace = new TouchSpace(this.slider, this.touchSpaceNode.current);
        this.touchSpace.enable();
    }

    render() {
        return (
            <div>
                <div className={"swiper"} ref={this.simpleSliderNodeRef}>
                    <div>
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
                    </div>
                </div>

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