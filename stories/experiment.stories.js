import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import TouchSpaceExperiment from "../src/components/touchSpace/TouchSpaceExperiment";
import SimpleSlider from "../src/SimpleSlider";
import SimpleSliderContainer from "../src/react/SimpleSliderContainer";

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

        this.state = {
            transform: Object.assign({}, this._currentParams),
        };

        this.pinchstart = this.pinchstart.bind(this);
        this.pinchend = this.pinchend.bind(this);
        this.pinch = this.pinch.bind(this);
    }

    _combineCurrentWithRelative(params) {
        let s = params.scale / this._pinchStartEvent.scale;

        let centerRelative = {
            x: (1 / (s * 2)) + this._pinchStartCenterRelativePosition.x * (1 - 1 / s),
            y: (1 / (s * 2)) + this._pinchStartCenterRelativePosition.y * (1 - 1 / s)
        };

        let tX = params.x / this.state.containerSize.width - this._pinchStartCenterRelativePosition.x;
        let tY = params.y / this.state.containerSize.height - this._pinchStartCenterRelativePosition.y;

        return {
            x: centerRelative.x / this._currentParams.scale + this._currentParams.x - 1 / (2 * this._currentParams.scale) - tX / (s * this._currentParams.scale),
            y: centerRelative.y / this._currentParams.scale + this._currentParams.y - 1 / (2 * this._currentParams.scale) - tY / (s * this._currentParams.scale),
            scale: this._currentParams.scale * s
        }
    }

    _onMove(params) {
        // console.log('on move', params);

        this.setState({
            transform: {
                x: params.x,
                y: params.y,
                scale: params.scale
            }

        });
    }

    _snapToBoundaries(params) {

        if (params.scale < 1) { params.scale = 1 };
        if (params.scale > 4) { params.scale = 4 };

        this._currentParams = Object.assign({}, standardSnapFunction(this._boundaries, params));
        this._onMove(this._currentParams);
    }


    pinchstart(params) {
        this._isPinching = true;
        this._pinchStartCenterRelativePosition = {
            x: params.x / this.state.containerSize.width,
            y: params.y / this.state.containerSize.height
        };

        this._pinchStartEvent = params;
    }

    pinch(p) {

        console.log(p);
        // console.log('pinch', ev.center.x / this.state.containerSize.width, ev.center.y / this.state.containerSize.height, ev.scale);

        let params = this._combineCurrentWithRelative(p);

        params.scale = Math.max(params.scale, 1);
        params.scale = Math.min(params.scale, 5);

        this._onMove(params);

        this._pinchPreviousEvent = p;
    }

    pinchend() {
        this._currentParams = Object.assign({}, this._combineCurrentWithRelative(this._pinchPreviousEvent));
        this._snapToBoundaries(this._currentParams);

        this._pinchPreviousEvent = undefined;
    }

    componentDidMount() {
        this.setState({
            containerSize: {
                width: this.containerRef.current.clientWidth,
                height: this.containerRef.current.clientHeight
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
        this.slider.slideSizeFunction = () => 600;
        this.slider.slideSnapOffsetFunction = () => 100;
        this.slider.leftOffsetFunction = () => 100;
        this.slider.rightOffsetFunction = () => 100;
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

        this.touchSpace.isGestureIntercepted = (ev) => {

            // if (ev.type.startsWith('pinch')) {
            //
            //     let pincher = this.refs['ref0'].current;
            //
            //     console.log('pinch intercepted!', ev.type);
            //
            //     // switch(ev.type) {
            //     //     case 'pinchstart':
            //     //         pincher.pinchStart(ev);
            //     //         break;
            //     //     case 'pinchend':
            //     //     case 'pinchcancel':
            //     //         pincher.pinchend();
            //     //         break;
            //     //     case 'pinchin':
            //     //     case 'pinchout':
            //     //     case 'pinchmove':
            //     //         pincher.pinchmove(ev);
            //     //         break;
            //     //     default:
            //     //         break;
            //     // }
            //
            //
            //     return true;
            // }


            if (this.state.scale > 1) {

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
                            <div className={"slideWithImage"}><div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: "yellow", fontSize: "100px", height: "600px"}}>XXX</div></div>
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