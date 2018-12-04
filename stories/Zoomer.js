import React from "react";
import AnimationEngine from 'src/animationEngines/AnimationEngine';
import standardSnapFunction from './standardSnapFunction';

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

        this._itemSize = {
            width: 800,
            height: 300,
        };

        this.state = {
            transform: Object.assign({}, this._currentParams),
            // isPinching: false
        };

        this.isAlignedToRight = this.isAlignedToRight.bind(this);
        this.isAlignedToLeft = this.isAlignedToLeft.bind(this);
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

        let t = standardSnapFunction(this._pos, this._containerSize, this._itemSize);

        let fun = (x) => 0.05 * Math.log(1 + x * 10);

        // left
        let restX = 0;

        if (this._pos.x - t.x > 0) {
            restX = fun((this._pos.x - t.x) / this.state.containerSize.width) * this.state.containerSize.width;
        }
        else if (this._pos.x - t.x < 0) {
            restX = -fun(-(this._pos.x - t.x) / this.state.containerSize.width) * this.state.containerSize.width;
        }

        let restY = 0;

        if (this._pos.y - t.y > 0) {
            restY = fun((this._pos.y - t.y) / this.state.containerSize.height) * this.state.containerSize.height;
        }
        else if (this._pos.y - t.y < 0) {
            restY = -fun(-(this._pos.y - t.y) / this.state.containerSize.height) * this.state.containerSize.height;
        }

        this.setState({
            transform: {
                x: t.x + restX,
                y: t.y + restY,
                scale: t.scale
            }
        });
    }

    snap() {
        let t = Object.assign({}, this._pos);
        if (t.scale > 5) { t.scale = 5; }
        if (t.scale < 1) { t.scale = 1; }

        t = standardSnapFunction(t, this._containerSize, this._itemSize);

        this.moveTo(t, true);
    }

    _updatePos(pos) {
        this._pos = Object.assign({}, pos);
        this._onMove();
    }

    moveTo(pos, animated, snap) {
        animated = animated || false;
        snap = snap || false;

        this.animations.x.killAnimation();
        this.animations.y.killAnimation();
        this.animations.scale.killAnimation();

        let newPos = Object.assign({}, pos);
        if (snap) {
            newPos = standardSnapFunction(newPos, this._containerSize, this._itemSize);
        }

        if (!animated) {
            this._updatePos(newPos);
        }
        else {

            let newParams = Object.assign({}, this._pos);

            this.animations.x.animate(this._pos.x, newPos.x, (x) => {
                newParams.x = x;
                this._updatePos(newParams);
            });

            this.animations.y.animate(this._pos.y, newPos.y, (y) => {
                newParams.y = y;
                this._updatePos(newParams);
            });

            this.animations.scale.animate(this._pos.scale, newPos.scale, (scale) => {
                newParams.scale = scale;
                this._updatePos(newParams);
            });


        }
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