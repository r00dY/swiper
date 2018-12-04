import React from "react";
import AnimationEngine from 'src/animationEngines/AnimationEngine';

let getZoomArea = function (zoomArea) {

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

let getEdge = function (boundaries, params) {
    let zoomArea = getZoomArea(params);

    return {
        right: boundaries.left + boundaries.width - zoomArea.half,
        left: boundaries.left + zoomArea.half,
        top: boundaries.top + zoomArea.half,
        bottom: boundaries.top + boundaries.height - zoomArea.half
    };
};

let standardSnapFunction = function (boundaries, params) {

    let targetParams = {
        scale: params.scale
    };

    let zoomArea = getZoomArea(params);

    // X
    if (zoomArea.width >= boundaries.width) {
        targetParams.x = boundaries.left + boundaries.width / 2;
    }
    else if (zoomArea.left < boundaries.left) {
        targetParams.x = boundaries.left + zoomArea.half;
    }
    else if (zoomArea.right > boundaries.left + boundaries.width) {
        targetParams.x = boundaries.left + boundaries.width - zoomArea.half;
    }
    else {
        targetParams.x = zoomArea.x;
    }

    // Y
    if (zoomArea.height >= boundaries.height) {
        targetParams.y = boundaries.top + boundaries.height / 2;
    }
    else if (zoomArea.top < boundaries.top) {
        targetParams.y = boundaries.top + zoomArea.half;
    }
    else if (zoomArea.bottom > boundaries.top + boundaries.height) {
        targetParams.y = boundaries.top + boundaries.height - zoomArea.half;
    }
    else {
        targetParams.y = zoomArea.y;
    }

    return targetParams;
};


class Zoomer extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();

        /**
         * Position is always translation first (not dependent of scale) and then scale.
         */
        this._pos = {
            x: 0,
            y: 0,
            scale: 1
        };

        this._containerSize = {
            width: 800,
            height: 600,
        };

        this._boundaries = {
            top: 150,
            left: 0,
            width: 800,
            height: 300,
        };

        this.state = {
            transform: Object.assign({}, this._currentParams),
            // isPinching: false
        };


        this.isAlignedToRight = this.isAlignedToRight.bind(this);
        this.isAlignedToLeft = this.isAlignedToLeft.bind(this);
        this.animateTo = this.animateTo.bind(this);
        this.getPos = this.getPos.bind(this);

        this.animations = {
            x: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
            y: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
            scale: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5)
        };
    }

    getPos() {
        return this._pos;
    }

    animate(params) {
        this.animations.x.animate(this._currentParams.x, params.x, (x) => {
            this._currentParams.x = x;
            this._onMove();
        })
    }

    _onMove() {

        // let t = standardSnapFunction(this._boundaries, this._currentParams);
        //
        // let fun = (x) => 0.05 * Math.log(1 + x * 10);
        //
        // // left
        // let restX = 0;
        //
        // if (this._currentParams.x - t.x > 0) {
        //     restX = fun(this._currentParams.x - t.x);
        // }
        // else if (this._currentParams.x - t.x < 0) {
        //     restX = -fun(-(this._currentParams.x - t.x));
        // }
        //
        // let restY = 0;
        //
        // if (this._currentParams.y - t.y > 0) {
        //     restY = fun(this._currentParams.y - t.y);
        // }
        // else if (this._currentParams.y - t.y < 0) {
        //     restY = -fun(-(this._currentParams.y - t.y));
        // }
        //
        // if (t.scale < 1) { t.scale = 1; }
        // if (t.scale > 5) { t.scale = 5; }

        let t = this._pos;
        let restX = 0;
        let restY = 0;

        this.setState({
            transform: {
                x: t.x + restX,
                y: t.y + restY,
                scale: t.scale
            }
        });
    }

    moveTo(pos, animated) {
        animated = animated || false;

        if (!animated) {
            this._pos = Object.assign({}, pos);
            this._onMove();
        }
        else {

            let newParams = Object.assign({}, this._pos);

            this.animations.x.animate(this._pos.x, pos.x, (x) => {
                newParams.x = x;
                console.log('X step', newParams)
                this.moveTo(newParams);
            });

            this.animations.y.animate(this._pos.y, pos.y, (y) => {
                newParams.y = y;
                console.log('Y step', newParams);
                this.moveTo(newParams);
            });

            this.animations.scale.animate(this._pos.scale, pos.scale, (scale) => {
                newParams.scale = scale;
                console.log('scale step', newParams);
                this.moveTo(newParams);
            });


        }
    }

    animateTo(fromParams, toParams) {

        this.movestart(fromParams);

    }

    isAlignedToRight() {
        return false;
        return this._currentParams.x - getEdge(this._boundaries, this._currentParams).right > -0.01;
    }

    isAlignedToLeft() {
        return false;
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
        let translateX = this.state.transform.x;// * this.state.transform.scale;
        let translateY = this.state.transform.y;// * this.state.transform.scale;

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