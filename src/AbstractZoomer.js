import React from "react";
import AnimationEngine from './animationEngines/AnimationEngine';
import EventSystem from './helpers/EventSystem';

/**
 * TODO: animation of velocity (panend with velocity)
 * TODO: pretty zoom in animation. When we animate from posA to posB, we don't want to have this weird "zoom bump". Left / right / bottom / top edges should be calculated with ease, and scale and center should be calculate from them!
 */

/**
 * NOTES TO MAINTAINER OF THE CODE
 *
 * this._pos is always simply translateX, translateY and scale (applied in that order, scale AFTER translation).
 * this._coords is different from this._pos only in case of edge non-linearity. In this case this._coords is REAL position, and this._pos is linear position from which non-linear this._coords is calculated.
 *
 * Zoomer has two types of movement: pinching and standard. They're very different.
 *
 * Standard movements
 *
 * These are movements which are STATELESS in a way that zoomer doesn't remember history. Every call is a new call. They work similar to move/snap methods in AbstractSlider.
 * Methods for standard movement: moveTo, snap, zoomToPoint
 * moveTo method applies non-linearity. This means that if you call moveTo method with some position, this position will have edge non-linear effects applied and real position might be different from argument position.
 * This gives us nice overscroll effect when panning.
 * zoomToPoint method always zooms to snapped version so it doesn't have to worry about non-linearities.
 * snap method calls onMove inside, so it applies non-linearities too (it's obvious)
 *
 *
 * Pinching movements
 *
 * Pinch movement is combined of a session and is combined of 4 consecutive stages:
 * - pinchstart
 * - pinchmove (might be many of them)
 * - pinchend
 * - pinchend snap animation finished
 *
 * Pinching has a history, it remembers from where the movement started.
 *
 * Why history?
 *
 * Imagine position x=-100, y=-100, scale=10, when scaleMax = 5. Try to snap this.
 *
 * It turns out there are infinite number of positions to which snapping would be correct. Each of these positions would be different depending on from which point movement started.
 *
 * Look at the following image
 *
 * Viewport is small and biggest square is current position (around 6x scale).
 * Now we want to snap big one into smaller one.
 *
 * It turns out that position only is not enough to snap correctly, because depending on starting point (A / B), different position would be appropriate.
 *
 * In other words, snapping scale down is relative to reference point (unlike snapping coordinates X and Y).
 *
 +----------------------------------------------------------------------------------------------------+
 |                                                                                                    |
 |                                         Current position (to be snapped)                           |
 |                                                                                                    |
 |                                                                                                    |
 |                                                                                                    |
 |                                                                                                    |
 |                                                                                                    |
 |                                                                                                    |
 |                      +-----------------------------------------------------+                       |
 |                      |                                                     |                       |
 |                      |                                                     |                       |
 |                      |                                                     |                       |
 |              +-----------------------------------------------------+       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                 +------------------+        |       |                       |
 |              |       |                 |    VIEWPORT      |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 |        B         |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 |   A              |        |       |                       |
 |              |       |                 |                  |        |       |                       |
 |              |       |                 +------------------+        |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |                                             |       |                       |
 |              |       |  Snap 2 version (B)                         |       |                       |
 |              |       |                                             |       |                       |
 |              |       +-----------------------------------------------------+                       |
 |              |                                                     |                               |
 |              |  SNAP 1 version (A)                                 |                               |
 |              |                                                     |                               |
 |              +-----------------------------------------------------+                               |
 |                                                                                                    |
 |                                                                                                    |
 |                                                                                                    |
 +----------------------------------------------------------------------------------------------------+
 *
 * That's why we decided to have a history.
 *
 * NON LINEARITIES
 *
 * Pinch session disables edge non-linearities. There was a reason for that.
 *
 * First, it's easy to implement.
 * Second, when you start pinching you pick one point. The one between your fingers - reference point.
 * If we allowed for non-linearity on edges, then the reference point sometimes "falls from" being between fingers.
 * We could probably do this effect, but not too much time for now. We copied PhotoSwipe logic and it seems fine and usable.
 *
 * There is one HUGE consequence of this. The pos => coords function behind edges is different for pinch and panning.
 * This means that we cannot simply switch between them.
 * That's why we don't allow for panning until pinch snap animation finishes. Pinch move can go far away from center (not like pan because of non-linearity). If we decided to switch pinch to pan, then pan would be super unnatural.
 * We should start interpret pan events as soon as pinch snapping finished.
 *
 * However, when pan snap animation is in progress, we can start pinching. It's because it's super natural position for pinch.
 * That's why we have code that copies coords to pos during pinchstart (change from non-linear to linear edge function).
 *
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
    }

    set containerSize(containerSize) {
        this._containerSize = containerSize;
    }

    get containerSize() {
        return this._containerSize;
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
     * Pinching session methods
     */
    pinchstart(containerCoords) {
        this._isPinching = true;

        this._killAnimations();

        // coords == pos during pinching (lack of edge non-linearities), so we must transform potentnailly non linear coordinates to the linear ones. Described in docs at the top.
        this._pos = Object.assign({}, this._coords);

        this._pinchStartContainerCoords = containerCoords;
        this._pinchStartPos = Object.assign({}, this._pos);
    }

    pinchmove(deltas) {
        if (!this._isPinching) { return; }

        let fullScale = this._pinchStartPos.scale * deltas.scale;

        // Non-linearity of pinch scale.
        if (fullScale > this._maxScale) {
            fullScale = this._maxScale + this._overscrollFunction(fullScale - this._maxScale);
        } else if (fullScale < this._minScale) {
            fullScale = this._minScale - this._overscrollFunction(-(fullScale - this._minScale));
        }

        let referencePointCoordsNormalized = this._getNormalizedPointCoordinates(this._pinchStartContainerCoords, this._pinchStartPos);

        this._updatePos({
            x: -referencePointCoordsNormalized.x * fullScale + (this._pinchStartContainerCoords.x - this._containerSize.width / 2) + deltas.x,
            y: -referencePointCoordsNormalized.y * fullScale + (this._pinchStartContainerCoords.y - this._containerSize.height / 2) + deltas.y,
            scale: fullScale
        });
    }

    pinchend() {
        if (!this._isPinching) { return; }

        let oldPos = Object.assign({}, this._pos);
        let newPos = this._getSnappedPos(this._pos);

        // If we need to snap
        if (newPos.x !== this._pos.x || newPos.y !== this._pos.y || newPos.scale !== this._pos.scale) {

            let anim = new AnimationEngine(AnimationEngine.Ease.outExpo, 0.3);

            anim.animate(0, 1, (val) => {
                let pos = {
                    x: oldPos.x + (newPos.x - oldPos.x) * val,
                    y: oldPos.y + (newPos.y - oldPos.y) * val,
                    scale: oldPos.scale + (newPos.scale - oldPos.scale) * val
                };
                this._updatePos(pos);
            }, () => {
                this._isPinching = false;
            });

            this._animations.push(anim);
        }
        else {
            this._isPinching = false;
        }

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
    moveTo(pos, animated) {
        if (this._isPinching) {
            return false;
        }

        if (typeof animated === 'undefined') { animated = false; }

        this._killAnimations();

        if (animated) {

            let oldPos = Object.assign({}, this._pos);
            let newPos = pos;

            let anim = new AnimationEngine(AnimationEngine.Ease.outExpo, 0.3);

            anim.animate(0, 1, (val) => {
                let pos = {
                    x: oldPos.x + (newPos.x - oldPos.x) * val,
                    y: oldPos.y + (newPos.y - oldPos.y) * val,
                    scale: oldPos.scale + (newPos.scale - oldPos.scale) * val
                };
                this._updatePos(pos);
            });

            this._animations.push(anim);
        }
        else {
            this._updatePos(pos);
        }

        return true;
    }

    snap(animated) {
        /**
         *  Can't do while pinching. This method is the one "without history", works like slider, and during pinching other rules are in place
         */
        if (this._isPinching) {
            return false;
        }

        this.moveTo(this._getSnappedPos(this._pos), animated);

        return true;
    }

    /**
     * "Double tap" method.
     *
     * @param containerCoords - coordinates object
     */
    zoomToPoint(coords, scale, animated) {

        /**
         * Can't do it while pinching.
         *
         * It's because pinching has no non-linearities. Imagie we zoomToPoint, pinching snap animation is canceled. We're in the zoom snap area without non-linearities, and zoomToPoint animation goes through this region. Then we start panning. We'd get situation when we start panning starting in pinching-non-linear area which is a mistake.
         */
        if (this._isPinching) {
            return false;
        }

        coords = this._getFullCoords(coords);
        scale = scale || this._zoomScale;

        let snappedPos = this._getSnappedPos({
            x: -coords.normalized.x * this._zoomScale,
            y: -coords.normalized.y * this._zoomScale,
            scale: this._zoomScale
        });

        if (!animated) {
            this.moveTo(snappedPos, false);
        }
        else {
            /**
             * ZoomToPoint must be animated "as pinch", not with moveTo(animated=true). This is because the latter one creates "weird effect" during animation (target point doesn't have straight line way to center point)
             * If we animate as if we were animating pinch gesture, we force that A point zoomed to C (center) goes with straight line no matter of zoom, x, y, etc.
             */

            let targetContainerCoords = this._getContainerPointCoordinates(coords.normalized, snappedPos);

            let deltas = { // how much center (in container coords) must be transferred
                x: (targetContainerCoords.x - coords.container.x),
                y: (targetContainerCoords.y - coords.container.y),
                scale: scale / this._pos.scale
            };

            let animation = new AnimationEngine(AnimationEngine.Ease.outExpo, 0.3);

            this.pinchstart(coords.container);

            animation.animate(0, 1, (val) => {
                this.pinchmove({
                    x: deltas.x * val,
                    y: deltas.y * val,
                    scale: 1 + (deltas.scale - 1) * val
                });
            }, () => {
                this.pinchend();
            });

        }
        return true;
    }


    /**
     * Very useful helper method. Takes container coords (relative to top/left of container and in container units), and transforms them to normalized point coords (as if scale=1, x=0, y=0).
     *
     * @param containerCoords
     * @private
     */
    _getNormalizedPointCoordinates(containerCoords, pos) {

        // Transform coorinates from relative to top/left of container to relative to its center (easier to calculate later).
        let touchPointCoords = {
            x: containerCoords.x - this._containerSize.width / 2,
            y: containerCoords.y - this._containerSize.height / 2
        };

        // Normalized zoom point coordinates (when scale = 1, x = 0 and y = 0). No matter the position.
        return {
            x: (touchPointCoords.x - pos.x) / pos.scale,
            y: (touchPointCoords.y - pos.y) / pos.scale
        };
    }

    /**
     * Inverse of _getNormalizedPointCoordinates, gets container coordinates (relative to top/left) from normalized ones
     * @private
     */
    _getContainerPointCoordinates(normalizedCoords, pos) {
        let touchPointCoords = {
            x: normalizedCoords.x * pos.scale + pos.x,
            y: normalizedCoords.y * pos.scale + pos.y
        };

        return {
            x: touchPointCoords.x + this._containerSize.width / 2,
            y: touchPointCoords.y + this._containerSize.height / 2
        }
    }

    /**
     * Helper method for dealing with coords
     * @private
     */
    _getFullCoords(coords, pos) {
        pos = pos || this._pos;

        if (coords.container && !coords.normalized) {
            return {
                normalized: this._getNormalizedPointCoordinates(coords.container, pos),
                container: Object.assign({}, coords.container)
            };
        }
        else if (!coords.container && coords.normalized) {
            return {
                normalized: Object.assign({}, coords.normalized),
                container: this._getContainerPointCoordinates(coords.normalized, pos)
            };
        }

        return coords;
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
            this._pos = pos;
            this._coords = pos;
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
        }

        this._runEventListeners('move', this._coords);
    }

    isAlignedToRight() {
        return /* right edge */ (this._pos.x + this._itemSize.width * this._pos.scale / 2) < this._containerSize.width / 2 + 10;
    }

    isAlignedToLeft() {
        return /* left edge */ (this._pos.x - this._itemSize.width * this._pos.scale / 2) > -this._containerSize.width / 2 - 10;
    }

    isAlignedToTop() {
        return /* top edge */ (this._pos.y - this._itemSize.height * this._pos.scale / 2) > -this._containerSize.height / 2 - 10
    }

    isAlignedToBottom() {
        return /* bottom edge */ (this._pos.y + this._itemSize.height * this._pos.scale / 2) < this._containerSize.height / 2 + 10
    }

}

export default Zoomer;