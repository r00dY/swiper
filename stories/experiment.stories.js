import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import TouchSpaceExperiment from "../src/components/touchSpace/TouchSpaceExperiment";
import SimpleSlider from "../src/SimpleSlider";
import SimpleSliderContainer from "../src/react/SimpleSliderContainer";

import ReactZoomer from '../src/react/ReactZoomer';

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
            this.touchSpace.zoomer = this.refs[`ref${this.slider.activeSlides()[0]}`].zoomer;
        });

        // this.slider.touchSpace.enable();
        // Let's create new touch space which is external.
        this.touchSpace = new TouchSpaceExperiment(this.slider, this.simpleSliderNodeRef.current);
        this.touchSpace.zoomer = this.refs['ref0'].zoomer;
        this.touchSpace.enable();

        this.refs['ref0'].zoomer.itemSize = {
            width: 800,
            height: 300
        };

    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <div className={"swiper"} ref={this.simpleSliderNodeRef} style={{position: "relative"}}>
                    <div>
                        <ReactZoomer ref={'ref0'} style={{
                            height: "600px"
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: "100%",
                                width: "100%"
                            }}>
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
                        </ReactZoomer>

                        <ReactZoomer ref={'ref1'} style={{
                            height: "600px"
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: "100%",
                                width: "100%"
                            }}>
                                <div style={{
                                    backgroundColor: "blue",
                                    fontSize: "300px",
                                    height: "400px",
                                    width: "100%",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    ABC
                                </div>
                            </div>
                        </ReactZoomer>

                        <ReactZoomer ref={'ref2'} style={{
                            height: "600px"
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: "100%",
                                width: "100%"
                            }}>
                                <div style={{
                                    backgroundColor: "yellow",
                                    fontSize: "300px",
                                    height: "600px",
                                    width: "200px",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    R
                                </div>
                            </div>
                        </ReactZoomer>

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