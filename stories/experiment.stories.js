import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import TouchSpaceExperiment from "../src/components/touchSpace/TouchSpaceExperiment";
import SimpleSlider from "../src/SimpleSlider";
import SimpleSliderContainer from "../src/react/SimpleSliderContainer";

import Zoomer from './Zoomer';

class Test extends React.Component {

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
        this.slider.slideSizeFunction = () => 800;
        this.slider.slideSnapOffsetFunction = () => 0;
        this.slider.leftOffsetFunction = () => 0;
        this.slider.rightOffsetFunction = () => 0;
        this.slider.displayNoneAutomatically = false;
        this.slider.layout();

        this.slider.addEventListener('activeSlidesChange', () => {
            this.touchSpace.zoomer = this.refs[`ref${this.slider.activeSlides()[0]}`];
        });

        // Let's create new touch space which is external.
        this.touchSpace = new TouchSpaceExperiment(this.slider, this.simpleSliderNodeRef.current);
        this.touchSpace.zoomer = this.refs['ref0'];
        this.touchSpace.enable();

    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <div className={"swiper"} ref={this.simpleSliderNodeRef} style={{position: "relative"}}>
                    <div>
                        <Zoomer ref={'ref0'} style={{position: "relative"}}>
                            <div className={"slideWithImage"}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: "600px"}}>

                                    <div style={{
                                        backgroundColor: "red",
                                        fontSize: "300px",
                                        height: "300px",
                                        width: "100%",
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        XXX
                                    </div>
                                </div>
                            </div>
                        </Zoomer>

                        <Zoomer ref={'ref1'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </Zoomer>

                        <Zoomer ref={'ref2'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </Zoomer>

                        <Zoomer ref={'ref3'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </Zoomer>
                    </div>
                </div>
            </div>
        );
    }
}

storiesOf('Experiment', module)
    .add('test', () =>
        <div className='ReactSlider__example'>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <Test />
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
            <h1>Test</h1>
        </div>
    );