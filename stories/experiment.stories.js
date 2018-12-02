import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import TouchSpaceExperiment from "../src/components/touchSpace/TouchSpaceExperiment";
import SimpleSlider from "../src/SimpleSlider";
import SimpleSliderContainer from "../src/react/SimpleSliderContainer";

/**
 * 1. Algorithm of scale + translate doesn't work well. When I zoom in a point on edge in PhotoSwipe, then it works perfectly. there's some offset in mine algo.
 * 2.
 */
let standardSnapFunction = function(boundaries, zoomArea) {

    var targetParams = {
        scale: zoomArea.scale
    }

    var half = 1 / (2 * zoomArea.scale);

    zoomArea.top = zoomArea.y - half;
    zoomArea.bottom = zoomArea.y + half;
    zoomArea.left = zoomArea.x - half;
    zoomArea.right = zoomArea.x + half;
    zoomArea.width = half * 2;
    zoomArea.height = half * 2;

    // X
    if (zoomArea.width >= boundaries.width) { targetParams.x = boundaries.left + boundaries.width / 2; }
    else if (zoomArea.left < boundaries.left) { targetParams.x = boundaries.left + half; }
    else if (zoomArea.right > boundaries.left + boundaries.width) { targetParams.x = boundaries.left + boundaries.width - half; }
    else { targetParams.x = zoomArea.x; }

    // Y
    if (zoomArea.height >= boundaries.height) { targetParams.y = boundaries.top + boundaries.height / 2; }
    else if (zoomArea.top < boundaries.top) { targetParams.y = boundaries.top + half; }
    else if (zoomArea.bottom > boundaries.top + boundaries.height) { targetParams.y = boundaries.top + boundaries.height - half; }
    else { targetParams.y = zoomArea.y; }

    return targetParams;
};


class PinchZoomable extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();

        this._boundaries = {
            top: 0,
            left: 0,
            width: 1,
            height: 1
        };

        // this._currentParams are current x, y and scale. They change after pinchend, not changing during pinchmove
        this._currentParams = { x: 0.5, y: 0.5, scale: 1 };
        this._lastParamsBeforeBeingPinched = { x: 0.5, y: 0.5, scale: 1 };

        // this._paramsBeforeSession = { x: 0.5, y: 0.5, scale: 1 };

        this.state = {
            transform: Object.assign({}, this._currentParams),
        };

        this.pinchstart = this.pinchstart.bind(this);
        this.pinchend = this.pinchend.bind(this);
        this.pinch = this.pinch.bind(this);
        this.getParams = this.getParams.bind(this);
        this.resetZoom = this.resetZoom.bind(this);
    }

    _updateParams(inputParams) {
        let s = inputParams.scale / this._pinchStartValues.inputParams.scale;

        // this "short diff" algorithm will never work because we keep only diff here. We don' have info about absolute place and this is neccessay to keep consistent.
        
        let centerRelative = {
            x: (1 / (s * 2)) + this._pinchStartValues.inputParams.x / this.state.containerSize.width * (1 - 1 / s),
            y: (1 / (s * 2)) + this._pinchStartValues.inputParams.y / this.state.containerSize.height * (1 - 1 / s)
        };

        // let tX = inputParams.x / this.state.containerSize.width - this._initialInputParams.x;
        // let tY = inputParams.y / this.state.containerSize.height - this._initialInputParams.y;
        let tX = (inputParams.x - this._pinchStartValues.inputParams.x) / this.state.containerSize.width;
        let tY = (inputParams.y - this._pinchStartValues.inputParams.y) / this.state.containerSize.height;

        this._currentParams = {
            x: centerRelative.x / this._pinchStartValues.params.scale + this._pinchStartValues.params.x - 1 / (2 * this._pinchStartValues.params.scale) - tX / (s * this._pinchStartValues.params.scale),
            y: centerRelative.y / this._pinchStartValues.params.scale + this._pinchStartValues.params.y - 1 / (2 * this._pinchStartValues.params.scale) - tY / (s * this._pinchStartValues.params.scale),
            scale: this._pinchStartValues.params.scale * s
        };
    }

    _onMove() {
        this.setState({
            transform: {
                x: this._currentParams.x,
                y: this._currentParams.y,
                scale: this._currentParams.scale
            }
        });
    }

    _snapToBoundaries() {
        this._currentParams.scale = Math.max(1, this._currentParams.scale);
        this._currentParams.scale = Math.min(5, this._currentParams.scale);

        this._currentParams = Object.assign({}, standardSnapFunction(this._boundaries, this._currentParams));
    }

    resetZoom() {
        this._currentParams = {
            x: 0.5,
            y: 0.5,
            scale: 1
        };

        this._onMove();
    }

    pinchstart(inputParams) {
        if (this._isPinching) { return; }
        this._isPinching = true;

        this._pinchStartValues = {
            params: Object.assign({}, this._currentParams),
            inputParams: inputParams
        };
    }

    pinch(inputParams) {
        this._updateParams(inputParams);
        this._onMove();
    }

    pinchend() {
        if (!this._isPinching) { return; }
        this._isPinching = false;

        this._snapToBoundaries();
        this._onMove();

        this._pinchStartValues = undefined;
    }

    getParams() {
        return this._currentParams;
    }

    componentDidMount() {
        this.setState({
            containerSize: {
                width: 800,//this.containerRef.current.clientWidth,
                height: 600,//this.containerRef.current.clientHeight
            }
        });
    }

    render() {
        let translateX = 0;
        let translateY = 0;

        if (this.state.containerSize) {
            translateX =  (0.5 - this.state.transform.x) * this.state.transform.scale * this.state.containerSize.width;
            translateY = (0.5 - this.state.transform.y) * this.state.transform.scale * this.state.containerSize.height;
        }

        return <div ref={this.containerRef} style={{overflow: "hidden"}}>
            <div style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${this.state.transform.scale})`,
                transformOrigin: "50% 50%"
            }}>
            {this.props.children}
            </div>
        </div>
    }
}


class Test extends React.Component {

    constructor(props) {
        super(props);

        this.simpleSliderNodeRef = React.createRef();
        this.touchSpaceNode = React.createRef();

        this.state = {
            scale: 1
        };

        this.ref = React.createRef();

        this.scaleRef = 1;
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

        // We don't enable this.slider.touchSpace!!!

        // Let's create new touch space which is external.
        this.touchSpace = new TouchSpaceExperiment(this.slider, this.simpleSliderNodeRef.current);
        this.touchSpace.enable();

        this.touchSpace.addEventListener('pinch', (params) => {
            this.setState({
               scale: params.scale * this.scaleRef
            });
            console.log('pinch', params);

            // console.log(this.ref);
            this.ref.current.pinch(params);
            // this.refs['ref0'].current.pinch(params);
        });

        this.touchSpace.addEventListener('pinchstart', (params) => {
            this.scaleRef = this.state.scale;

            this.ref.current.pinchstart(params);
            // this.refs['ref0'].current.pinchstart(params);
        });

        this.touchSpace.addEventListener('pinchend', (params) => {
            this.setState({
                scale: Math.max(this.state.scale, 1)
            });

            this.ref.current.pinchend(params);
            // this.refs['ref0'].current.pinchend(params);
        });

        this.touchSpace.addEventListener('doubletap', (params) => {

            if (this.ref.current.getParams().scale > 1) {
                this.ref.current.resetZoom();
            }
            else {
                this.ref.current.pinchstart(Object.assign({}, params, { scale: 1 }));
                this.ref.current.pinch(Object.assign({}, params, { scale: 3 }));
                this.ref.current.pinchend();
            }
        });

        this.touchSpace.isGestureIntercepted = (ev) => {

            console.log(this.ref.current.getParams());

            if (this.ref.current.getParams().scale > 1) {

                let params = {
                    x: ev.deltaX,
                    y: ev.deltaY,
                    scale: 1
                };

                switch(ev.type) {
                    case 'panstart':
                        this.ref.current.pinchstart(params);
                        break;
                    case 'panleft':
                    case 'panright':
                    case 'panup':
                    case 'pandown':
                        this.ref.current.pinch(params);
                        break;
                    case 'panend':
                        this.ref.current.pinchend(params);
                    default:
                        break;

                }

                return true;
            }

            return false;
        }
    }

    render() {
        return (
            <div style={{position: "relative"}}>
                {/*<SimpleSliderContainer className={"swiper"} ref={this.simpleSliderNodeRef}>*/}

                <div className={"swiper"} ref={this.simpleSliderNodeRef} style={{position: "relative"}}>
                    <div>
                        <PinchZoomable ref={this.ref} style={{position: "relative"}}>
                            <div className={"slideWithImage"}><div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: "yellow", fontSize: "300px", height: "600px"}}>XXX</div></div>
                        </PinchZoomable>

                        <PinchZoomable ref={'ref1'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </PinchZoomable>

                        <PinchZoomable ref={'ref2'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </PinchZoomable>

                        <PinchZoomable ref={'ref3'}>
                            <div className={"slideWithImage"}><img src={"https://via.placeholder.com/600x600"} draggable={false}/></div>
                        </PinchZoomable>
                    </div>
                </div>

                <div>Scale: {this.state.scale}</div>

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
        </div>
    );