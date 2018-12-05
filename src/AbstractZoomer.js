import React from "react";
import AnimationEngine from './animationEngines/AnimationEngine';
import EventSystem from './helpers/EventSystem';

/**
 * TODO: animation of velocity (panend with velocity)
 * TODO: pretty zoom in animation. When we animate from posA to posB, we don't want to have this weird "zoom bump". Left / right / bottom / top edges should be calculated with ease, and scale and center should be calculate from them!
 */

class Zoomer  {
    constructor() {
        /**
         * Position is always translation first (not dependent of scale) and then scale.
         */
        this._pos = {
            x: 0,
            y: 0,
            scale: 1
        };

        this._coords = Object.assign({}, this._pos); // coords are REAL position, with non-linearities taken into account

        this._isPinching = false;

        this._animations = [];

        this._minScale = 1;
        this._maxScale = 5;
        this._zoomScale = 3;

        this._overscrollFunction = (x) => 0.05 * Math.log(1 + x * 10);

        EventSystem.register(this);
        EventSystem.addEvent(this, 'move');

        // this.animations = {
        //     x: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
        //     y: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5),
        //     scale: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.5)
        // };
    }

    set containerSize(containerSize) {
        this._containerSize = containerSize;
    }

    get containerSize() {
        return this.containerSize;
    }

    set itemSize(itemSize) {
        this._itemSize = itemSize;
    }

    get itemSize() {
        return this._itemSize;
    }

    get pos() {
        return this._pos;
    }

    getPos() {
        return this._pos;
    }

    set minScale(minScale) {
        this._minScale = minScale;
    }

    get minScale() {
        return this._minScale;
    }

    set maxScale(maxScale) {
        this._maxScale = maxScale;
    }

    get maxScale() {
        return this._maxScale;
    }

    set zoomScale(zoomScale) {
        this._zoomScale = zoomScale;
    }

    get zoomScale() {
        return this._zoomScale;
    }

    set overscrollFunction(fun) {
        this._overscrollFunction = fun;
    }

    get coords() {
        return this._coords;
    }

    /**
     * This method moves zoomer to new position *with* non-linearities (like swiper, in general this is swiper analogous method).
     * This means that it won't work when pinching session is in progress.
     * Please remember that pinching session ends with end of snap animation, not end of gesture.
     *
     * It has its logic. Pinching doesn't have non-linearities which means that pinch-move might move image far far away from center (creating a long distance of snapping).
     * Snap animation in such case has quite a distance to go. If we started panning right after we released pinch gesture we would be in incredibly unnatural place for panning.
     * That's because we CAN'T pan that far (becuase of non-linearities). That's why it's better for pinch snap to finish and then release panning behaviour.
     *
     * Returns true if was allowed, and false otherwise.
     *
     * @param pos
     */
    moveTo(pos) {
        if (this._isPinching) {
            return false;
        }

        this._killAnimations();
        this._updatePos(pos);

        return true;
    }

    snap(animated) {
        /**
         *  Can't do while pinching. This method is the one "without history", works like slider, and during pinching other rules are in place
         */
        if (this._isPinching) {
            return false;
        }

        if (typeof animated === 'undefined') { animated = true; }

        if (animated) {

        }
        else {
            this.moveTo(this._getSnappedPos(this._pos));
        }

        return true;
    }

    /**
     * "Double tap" method.
     *
     * So far works only for zooming from scale: 1.
     *
     * @param containerCoords - coordinates relative to container top/left.
     */
    zoomToPoint(containerCoords, animated) {

        /**
         * Can't do it while pinching.
         *
         * It's because pinching has no non-linearities. Imagie we zoomToPoint, pinching snap animation is canceled. We're in the zoom snap area without non-linearities, and zoomToPoint animation goes through this region. Then we start panning. We'd get situation when we start panning starting in pinching-non-linear area which is a mistake.
         */
        if (this._isPinching) {
            return false;
        }

        if (typeof animated === 'undefined') { animated = true; }

        if (animated) {

        }
        else {
            let targetPointNormalizedCoords = this._getNormalizedPointCoordinates(containerCoords);

            this.moveTo(this._getSnappedPos({
                x: -targetPointNormalizedCoords.x * this._zoomScale,
                y: -targetPointNormalizedCoords.y * this._zoomScale,
                scale: this._zoomScale
            }));

            return true;
        }
    }

    /**
     * Very useful helper method. Takes container coords (relative to top/left of container and in container units), and transforms them to normalized point coords (as if scale=1, x=0, y=0).
     *
     * @param containerCoords
     * @private
     */
    _getNormalizedPointCoordinates(containerCoords) {

        // Transform coorinates from relative to top/left of container to relative to its center (easier to calculate later).
        let touchPointCoords = {
            x: this._containerSize.width / 2 - containerCoords.x,
            y: this._containerSize.height / 2 - containerCoords.y
        };

        // Normalized zoom point coordinates (when scale = 1, x = 0 and y = 0). No matter the position.
        return {
            x: -(touchPointCoords.x - this._pos.x) / this._pos.scale,
            y: -(touchPointCoords.y - this._pos.y) / this._pos.scale
        };
    }

    _killAnimations() {
        this._animations.forEach((animation) => {
            animation.killAnimation();
        });
    }

    /**
     * Gets position snapped.
     *
     * Remember that firstly scale is snapped and then X and Y.
     *
     * Actually this function shouldn't be very much relied on when snapping areas that has scale bigger or smaller than maxScale / minScale.
     *
     * It's because scale should be snapped back WITH REFERENCE POINT. Depending on where we started scaling from (reference point), we should scale back with reference to this point, not to center.
     *
     * But for moveTo method purpose (which has no history and no reference point info), this feature should be available.
     *
     * @returns {{scale: number}}
     * @private
     */
    _getSnappedPos(pos) {

        let newPos = {
            scale: pos.scale,
            x: pos.x,
            y: pos.y
        };

        // scale
        if (newPos.scale < this._minScale) {
            newPos.scale = this._minScale;
        }
        else if (newPos.scale > this._maxScale) {
            newPos.scale = this._maxScale;
        }

        let half = {
            w: this._itemSize.width / 2 * newPos.scale,
            h: this._itemSize.height / 2 * newPos.scale
        };

        let itemArea = {
            top: newPos.y - half.h,
            bottom: newPos.y + half.h,
            left: newPos.x - half.w,
            right: newPos.x + half.w,
            x: newPos.x,
            y: newPos.y,
            width: this._itemSize.width * newPos.scale,
            height: this._itemSize.height * newPos.scale
        };

        // X
        if (itemArea.width <= this._containerSize.width) {
            newPos.x = 0;
        }
        else if (itemArea.left > -this._containerSize.width / 2) {
            newPos.x = (itemArea.width - this._containerSize.width) / 2;
        }
        else if (itemArea.right < this._containerSize.width / 2) {
            newPos.x = -(itemArea.width - this._containerSize.width) / 2;
        }
        else {
            newPos.x = itemArea.x;
        }

        // Y
        if (itemArea.height <= this._containerSize.height) {
            newPos.y = 0;
        }
        else if (itemArea.top > -this._containerSize.height / 2) {
            newPos.y = (itemArea.height - this._containerSize.height) / 2;
        }
        else if (itemArea.bottom < this._containerSize.height / 2) {
            newPos.y = -(itemArea.height - this._containerSize.height) / 2;
        }
        else {
            newPos.y = itemArea.y;
        }
        return newPos;
    }


    /**
     * Internal method for updating position.
     *
     * Applies non-linearities unless pinching session is in progress.
     *
     * @param pos
     * @private
     */
    _updatePos(pos) {

        if (this._isPinching) {


        }
        else {
            let t = this._getSnappedPos(pos);

            // x
            let restX = 0;

            if (pos.x - t.x > 0) {
                restX = this._overscrollFunction((pos.x - t.x) / this._containerSize.width) * this._containerSize.width;
            }
            else if (pos.x - t.x < 0) {
                restX = -this._overscrollFunction(-(pos.x - t.x) / this._containerSize.width) * this._containerSize.width;
            }

            // y
            let restY = 0;

            if (pos.y - t.y > 0) {
                restY = this._overscrollFunction((pos.y - t.y) / this._containerSize.height) * this._containerSize.height;
            }
            else if (pos.y - t.y < 0) {
                restY = -this._overscrollFunction(-(pos.y - t.y) / this._containerSize.height) * this._containerSize.height;
            }

            this._coords = {
                x: t.x + restX,
                y: t.y + restY,
                scale: t.scale
            };

            this._pos = pos;

            this._runEventListeners('move', this._coords);
        }
    }

    //
    // _onMove() {
    //
    //     let t = standardSnapFunction(this._pos, this._containerSize, this._itemSize);
    //
    //     let fun = (x) => 0.05 * Math.log(1 + x * 10);
    //
    //     // scale
    //
    //     let restScale = 0;
    //
    //     if (this._pos.scale > t.scale) {
    //         restScale = fun(this._pos.scale - t.scale)
    //     } else if (this._pos.scale < t.scale) {
    //         restScale = -fun(-(this._pos.scale - t.scale))
    //     }
    //
    //     console.log('restScale', restScale);
    //     // x
    //     let restX = 0;
    //
    //     if (this._pos.x - t.x > 0) {
    //         restX = fun((this._pos.x - t.x) / this.state.containerSize.width) * this.state.containerSize.width;
    //     }
    //     else if (this._pos.x - t.x < 0) {
    //         restX = -fun(-(this._pos.x - t.x) / this.state.containerSize.width) * this.state.containerSize.width;
    //     }
    //
    //     // y
    //     let restY = 0;
    //
    //     if (this._pos.y - t.y > 0) {
    //         restY = fun((this._pos.y - t.y) / this.state.containerSize.height) * this.state.containerSize.height;
    //     }
    //     else if (this._pos.y - t.y < 0) {
    //         restY = -fun(-(this._pos.y - t.y) / this.state.containerSize.height) * this.state.containerSize.height;
    //     }
    //
    //     // t = this._pos;
    //     // restX = 0;
    //     // restY = 0;
    //     // restScale = 0;
    //     this.setState({
    //         transform: {
    //             x: t.x + restX,
    //             y: t.y + restY,
    //             scale: t.scale + restScale
    //         }
    //     });
    // }
    //
    // snap(velocity) {
    //     let t = Object.assign({}, this._pos);
    //     if (t.scale > 5) { t.scale = 5; }
    //     if (t.scale < 1) { t.scale = 1; }
    //
    //     t = standardSnapFunction(t, this._containerSize, this._itemSize);
    //
    //     this.moveTo(t, true);
    // }
    //
    // _updatePos(pos) {
    //     this._pos = Object.assign({}, pos);
    //     this._onMove();
    // }
    //
    // moveTo(pos, animated) {
    //     animated = animated || false;
    //
    //     this.animations.x.killAnimation();
    //     this.animations.y.killAnimation();
    //     this.animations.scale.killAnimation();
    //
    //     let newPos = Object.assign({}, pos);
    //
    //     // If new position is animated then we want to snap target position before animation.
    //     // If we didn't do it, we would animate to target position that is not snapped, but still not linear (from _onMove)
    //     // Such movement is unnatural and weird. Movement to snapped position is always cool.
    //     // If movement is not animated, it's probably a tiny movement from panning or pinching.
    //     // Such movements shouldn't be snapped to let non-linearity play its role.
    //
    //     if (animated) {
    //         newPos = standardSnapFunction(newPos, this._containerSize, this._itemSize);
    //     }
    //
    //     if (!animated) {
    //         this._updatePos(newPos);
    //     }
    //     else {
    //
    //         let newParams = Object.assign({}, this._pos);
    //
    //         this.animations.x.animate(this._pos.x, newPos.x, (x) => {
    //             newParams.x = x;
    //             this._updatePos(newParams);
    //         });
    //
    //         this.animations.y.animate(this._pos.y, newPos.y, (y) => {
    //             newParams.y = y;
    //             this._updatePos(newParams);
    //         });
    //
    //         this.animations.scale.animate(this._pos.scale, newPos.scale, (scale) => {
    //             newParams.scale = scale;
    //             this._updatePos(newParams);
    //         });
    //
    //
    //     }
    // }
    //
    isAlignedToRight() {
        return /* right edge */ (this._pos.x + this._itemSize.width * this._pos.scale / 2) < this._containerSize.width / 2 + 1;
    }

    isAlignedToLeft() {
        return /* left edge */ (this._pos.x - this._itemSize.width * this._pos.scale / 2) > -this._containerSize.width / 2 - 1;
    }

}

export default Zoomer;