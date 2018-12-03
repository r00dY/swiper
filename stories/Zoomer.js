import React from "react";
import AnimationEngine from 'src/animationEngines/AnimationEngine';

let getZoomArea = function(zoomArea) {

    let half = 1 / (2 * zoomArea.scale);

    return {
        top: zoomArea.y - half,
        bottom: zoomArea.y + half,
        left: zoomArea.x - half,
        right: zoomArea.x + half,
        width: half * 2,
        height: half * 2,
        half: half,
        x: zoomArea.x,
        y: zoomArea.y
    };
};

let getEdge = function(boundaries, params) {
    let zoomArea = getZoomArea(params);

    return {
        right: boundaries.left + boundaries.width - zoomArea.half,
        left: boundaries.left + zoomArea.half,
        top: boundaries.top + zoomArea.half,
        bottom: boundaries.top + boundaries.height - zoomArea.half
    };
};

let standardSnapFunction = function(boundaries, params) {

    let targetParams = {
        scale: params.scale
    };

    let zoomArea = getZoomArea(params);

    // X
    if (zoomArea.width >= boundaries.width) { targetParams.x = boundaries.left + boundaries.width / 2; }
    else if (zoomArea.left < boundaries.left) { targetParams.x = boundaries.left + zoomArea.half; }
    else if (zoomArea.right > boundaries.left + boundaries.width) { targetParams.x = boundaries.left + boundaries.width - zoomArea.half; }
    else { targetParams.x = zoomArea.x; }

    // Y
    if (zoomArea.height >= boundaries.height) { targetParams.y = boundaries.top + boundaries.height / 2; }
    else if (zoomArea.top < boundaries.top) { targetParams.y = boundaries.top + zoomArea.half; }
    else if (zoomArea.bottom > boundaries.top + boundaries.height) { targetParams.y = boundaries.top + boundaries.height - zoomArea.half; }
    else { targetParams.y = zoomArea.y; }

    return targetParams;
};


class Zoomer extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();

        this._boundaries = {
            top: 0.25,
            left: 0,
            width: 1,
            height: 0.5
        };

        // this._currentParams are current x, y and scale. They change after pinchend, not changing during pinchmove
        this._currentParams = { x: 0.5, y: 0.5, scale: 1 };

        this.state = {
            transform: Object.assign({}, this._currentParams),
            isPinching: false
        };

        this.movestart = this.movestart.bind(this);
        this.moveend = this.moveend.bind(this);
        this.move = this.move.bind(this);
        this.getParams = this.getParams.bind(this);
        this.resetZoom = this.resetZoom.bind(this);
        this.isAlignedToRight = this.isAlignedToRight.bind(this);
        this.isAlignedToLeft = this.isAlignedToLeft.bind(this);
        this.animateTo = this.animateTo.bind(this);

        this.animations = {
            x: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
            y: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
            scale: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5)
        };
    }

    _updateParams(inputParams) {

        // shorter variable names help make code below to be more readable
        let initInputParams = this._pinchStartValues.inputParams;
        let initParams = this._pinchStartValues.params;

        let s = inputParams.scale / initInputParams.scale;

        let centerRelative = {
            x: (1 / (s * 2)) + initInputParams.x / this.state.containerSize.width * (1 - 1 / s),
            y: (1 / (s * 2)) + initInputParams.y / this.state.containerSize.height * (1 - 1 / s)
        };

        let tX = (inputParams.x - initInputParams.x) / this.state.containerSize.width;
        let tY = (inputParams.y - initInputParams.y) / this.state.containerSize.height;

        this._currentParams = {
            x: centerRelative.x / initParams.scale + initParams.x - 1 / (2 * initParams.scale) - tX / (s * initParams.scale),
            y: centerRelative.y / initParams.scale + initParams.y - 1 / (2 * initParams.scale) - tY / (s * initParams.scale),
            scale: initParams.scale * s
        };
    }

    animate(params) {
        this.animations.x.animate(this._currentParams.x, params.x, (x) => {
            this._currentParams.x = x;
            this._onMove();
        })
    }

    _onMove() {

        console.log('current params', this._currentParams);
        let t = standardSnapFunction(this._boundaries, this._currentParams);

        let fun = (x) => 0.05 * Math.log(1 + x * 10);

        // left
        let restX = 0;

        if (this._currentParams.x - t.x > 0) {
            restX = fun(this._currentParams.x - t.x);
        }
        else if (this._currentParams.x - t.x < 0) {
            restX = -fun(-(this._currentParams.x - t.x));
        }

        let restY = 0;

        if (this._currentParams.y - t.y > 0) {
            restY = fun(this._currentParams.y - t.y);
        }
        else if (this._currentParams.y - t.y < 0) {
            restY = -fun(-(this._currentParams.y - t.y));
        }

        if (t.scale < 1) { t.scale = 1; }
        if (t.scale > 5) { t.scale = 5; }

        this.setState({
            transform: {
                x: t.x + restX,
                y: t.y + restY,
                scale: t.scale
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

    movestart(inputParams, animated) {
        if (this._isPinching) { return; }
        this._isPinching = true;

        this.setState({
            animated: animated
        });

        this._pinchStartValues = {
            params: Object.assign({}, this._currentParams),
            inputParams: inputParams
        };
    }

    move(inputParams) {
        console.log('move', inputParams);
        this._updateParams(inputParams);
        this._onMove();
    }

    moveend() {
        if (!this._isPinching) { return; }
        this._isPinching = false;

        this.setState({
            animated: true
        });

        // this._snapToBoundaries();
        this._onMove();

        this._pinchStartValues = undefined;

        // this.snapToBoundaries2();
    }


    animateTo(targetParams) {

        // Let's create inputParams and targetParams.
        let inputParams = Object.assign({}, this._currentParams);
        inputParams.x *= this.state.containerSize.width;
        inputParams.y *= this.state.containerSize.height;

        console.log('animte to', inputParams);
        // let targetParams = Object.assign({}, standardSnapFunction(this._boundaries, this._currentParams));
        // targetParams.scale = Math.max(1, targetParams.scale);
        // targetParams.scale = Math.min(5, targetParams.scale);

        this.movestart(inputParams);

        let newParams = Object.assign({}, inputParams);

        this.animations.x.animate(inputParams.x, targetParams.x, (x) => {
           newParams.x = x;
            // console.log('move x', x, newParams);

            this.move(newParams);
        }, () => {
            this.moveend();
        });

        this.animations.y.animate(inputParams.y, targetParams.y, (y) => {
            newParams.y = y;
            // console.log('move y', y, newParams);
            this.move(newParams);
        }, () => {
            this.moveend();
        });

        this.animations.scale.animate(inputParams.scale, targetParams.scale, (scale) => {
            newParams.scale = scale;
            // console.log('move s', scale, newParams);
            this.move(newParams);
        }, () => {
            this.moveend();
        });

    }

    getParams() {
        return this._currentParams;
    }

    isAlignedToRight() {
        return this._currentParams.x - getEdge(this._boundaries, this._currentParams).right > -0.01;
    }

    isAlignedToLeft() {
        return this._currentParams.x - getEdge(this._boundaries, this._currentParams).left < 0.01;
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
                transformOrigin: "50% 50%",
                transition: 'none'//this.state.animated ? 'transform .5s cubic-bezier(0.19, 1, 0.22, 1)' : ''
            }}>
                {this.props.children}
            </div>
        </div>
    }
}

export default Zoomer;