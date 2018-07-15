require("gsap/EasePack");
require("gsap/TweenLite");

class NewSwiper {

    constructor() {

        this._slideMargin = () => { return 0; };
        this._slideSnapOffset = () => { return 0; };
        this._leftOffset = 0;
        this._rightOffset = 0;

        this._infinite = false;
        this._snapOnlyToAdjacentSlide = false;

        // Overscroll function for finite sliders. If it's f(x) = x it will be linear. x = 1 means entire container width movement.
        this._overscrollFunction = (x) => {
            return 0.5 * Math.log(1 + x);
        };

        this._animationEase = Expo.easeOut;
        this._animationTime = 0.8;

        this._scrollingAnimationTime = 0.8;

        this._pos = 0;

        this._eventListeners = {
            'move': []
        };
    }

    /**
     *
     */
    init() {
        this._CACHE = {
            slideSize: {},
            slideMargin: {},
            snapOffset: {}
        };

        this._animations = [];

        // containerSize validation
        if (typeof this._containerSize !== "number") { throw "'containerSize' is not defined or is not a number"; }

        // slideSize validation
        if (typeof this._slideSize !== "function") { throw "'slideSize' is not defined or is not a function"; }

        // count validation
        if (typeof this._count !== "number") { throw "'count' is not defined or is not a number"; }

        // set initial pos for infinite as snap position of first slide
        if (this._infinite) {
            this._updatePos(this._getSlideSnapPos(0));
        }

    }

    /**
     * This method stops movement of current animations. If there are no animations, this method doesn't do anything. Usually should be called on touch down gesture.
     */
    stopMovement() {
        this._killAnimations();
    }

    /**
     * This method moves content to x. If animated flag is set, animation will be triggered (for "next / previous" clicks). moveTo is for dragging.
     *
     * @param pos
     * @param animated
     */
    moveTo(pos, animated, side) {

        if (typeof animated === 'undefined') { animated = true; }
        if (typeof side === 'undefined') { side = 0; }

        // Don't initiate animation if we're already in the same spot.
        let diff = Math.abs(pos - this._pos);
        if (diff < 1) {
            return;
        }

        this._killAnimations();

        if (animated) {

            // this.setStill(false);
            if (this._infinite) {

                if (side == 0) { // shortest path strategy

                    if (Math.abs(pos - this._pos) > this.slideableWidth / 2) {
                        if (pos - this._pos > 0) {
                            pos -= this.slideableWidth;
                        }
                        else {
                            pos += this.slideableWidth;
                        }
                    }
                }
                else if (side == 1 && pos - this._pos < 0) { // force right movement
                    pos += this.slideableWidth;
                }
                else if (side == -1 && pos - this._pos > 0) { // force left movement
                    pos -= this.slideableWidth;
                }

            }

            let tmp = { pos: this._pos };

            let anim = TweenLite.to(tmp, this._animationTime, {
                pos: pos,
                ease: this._animationEase,

                onUpdate: () => {
                    this._updatePos(tmp.pos);
                },

                onComplete: () => {
                    this._animations = [];
                    // this.setStill(true);
                }
            });

            this._animations = [anim];
        }
        else {
            this._updatePos(pos);
        }

    }

    /**
     * This method is wrapper for moveTo which moves to slide.
     *
     * @param n
     * @param animated
     * @param direction
     */
    moveToSlide(n, animated, direction) {

        if (typeof animated === 'undefined') {
            animated = true;
        }
        if (typeof direction === 'undefined') {
            direction = 0;
        }

        let pos = this._getSlideSnapPos(n);

        if (this._infinite) {

            if (direction === 0) { // shortest path strategy

                if (Math.abs(pos - this._pos) > this.slideableWidth / 2) {
                    if (pos - this._pos > 0) {
                        pos -= this.slideableWidth;
                    }
                    else {
                        pos += this.slideableWidth;
                    }
                }
            }
            else if (direction === 1 && pos - this._pos < 0) { // force right movement
                pos += this.slideableWidth;
            }
            else if (direction === -1 && pos - this._pos > 0) { // force left movement
                pos -= this.slideableWidth;
            }
        }

        this.moveTo(pos, animated);
    }

    /**
     * This method snaps to closest slide's snap position.
     *
     * @param velocity
     * @param animated
     */
    snap(velocity, animated) {

        if (velocity === 0) {
            this.moveTo(this._getClosestSnapPosition(this._pos), animated);
            return;
        }

        let s = 0.2 * velocity * this._scrollingAnimationTime / 2;
        let targetPos = this._pos + s; // targetPos at this stage is not snapped to any slide.

        // If this options is true, we want to snap to as closest slide as possible and not further.
        // This is necessary because when you have slider when slide is 100% width, strong flick gestures
        // would make swiper move 2 or 3 positions to right / left which feels bad. This flag should be
        // disabled in case of "item swiper" when couple of items are visible in viewport at the same time.
        if (this._snapOnlyToAdjacentSlide) {
            targetPos = velocity < 0 ? this._pos - 1 : this._pos + 1;
        }

        this.moveTo(this._getClosestSnapPosition(targetPos, velocity < 0 ? -1 : 1), animated);
    }

    /**
     *
     *
     * @param n
     */
    slideCoord(n) {
        return this._getSlideCoordForPos(n, this._pos);
    }

    get pos() {
        return this._pos;
    }

    //
    // currentPosition() {
    //     return 0;
    // }
    //

    // onMove, onStill, etc etc.
    addEventListener(event, callback) {
        if (!this._eventListeners.hasOwnProperty(event)) {
            throw `Unknown event listener name: ${event}`;
        }

        this._eventListeners[event].push(callback);
    }

    _runEventListeners(event) {
        this._eventListeners[event].forEach((callback) => {
           callback();
        });
    }

    set containerSize(containerSize) {
        this._containerSize = containerSize;
    }

    get containerSize() {
        return this._containerSize;
    }

    set count(newCount) {
        this._count = newCount;
    }

    get count() {
        return this._count;
    }

    set slideSizeFunction(slideSize) {
        this._slideSize = slideSize;
    }

    slideSize(n) {
        if (this._CACHE["slideSize"][n]) { return this._CACHE["slideSize"][n]; }

        this._CACHE["slideSize"][n] = this._slideSize(n);

        return this._CACHE["slideSize"][n];
    }

    set slideMargin(slideMargin) {
        this._slideMargin = slideMargin;
    }

    slideMargin(n) {
        if (this._CACHE["slideMargin"][n]) { return this._CACHE["slideMargin"][n]; }

        this._CACHE["slideMargin"][n] = this._slideMargin(n);

        return this._CACHE["slideMargin"][n];
    }

    set slideSnapOffset(slideSnapOffset) {
        this._slideSnapOffset = slideSnapOffset;
    }

    slideSnapOffset(n) {
        if (this._CACHE["slideSnapOffset"][n]) { return this._CACHE["slideSnapOffset"][n]; }

        this._CACHE["slideSnapOffset"][n] = this._slideSnapOffset(n);

        return this._CACHE["slideSnapOffset"][n];
    }


    set leftOffset(leftOffset) {
        this._leftOffset = leftOffset;
    }

    get leftOffset() {
        return this._leftOffset;
    }

    set rightOffset(rightOffset) {
        this._rightOffset = rightOffset;
    }

    get rightOffset() {
        return this._rightOffset;
    }

    set overscrollFunction(overscrollFunction) {
       this._overscrollFunction = overscrollFunction;
    }

    set infinite(infinite) {
        this._infinite = infinite;
    }

    get infinite() {
        return this._infinite;
    }

    set animationEase(animationEase) {
        this._animationEase = animationEase;
    }

    set animationTime(animationTime) {
        this._animationTime = animationTime;
    }


    /**
     * Helpers
     */
    get slideableWidth() {

        if (this._CACHE["slideableWidth"]) { return this._CACHE["slideableWidth"]; }

        let result = 0;
        for (let i = 0; i < this._count; i++) { // get full _width and _snapPoints

            result += this.slideSize(i);

            if (i === this._count - 1 && !this._infinite) {
                break;
            } // total slideable width can't include right margin of last element unless we are at infinite scrolling!

            result += this.slideMargin(i);
        }

        // Finite scroll should take left and right offset into account.
        if (!this._infinite) {
            result += (this._leftOffset + this._rightOffset);
        }

        this._CACHE["slideableWidth"] = result;

        return result;
    }

    get maxPos() {
        if (this._infinite) {
            throw "maxPos method not available in infinite mode"
        }

        return Math.max(0, this.slideableWidth - this._containerSize);
    }

    isSlideVisible(n) {
        let coord = this.slideCoord(n);
        if (coord + this.slideSize(n) < 0) { return false; }
        if (coord > this.containerSize) { return false; }
        return true;
    }


    _normalizePos(position) {

        if (this._infinite) {

            position = position % this.slideableWidth;
            if (position < 0) {
                position += this.slideableWidth;
            } // this is needed because Javascript is shit and doesn't correctly calculate modulo on negative numbers.

            return position;
        }

        return position;
    };

    /**
     *
     * Gets slide coordinate (0 means glued to the left edge of container) position for given slider position.
     *
     * @param n
     * @param pos
     * @returns {*}
     * @private
     */
    _getSlideCoordForPos(n, pos) {

        if (this._infinite) {

            pos = this._normalizePos(pos);

            let coord = -pos;

            for (let i = 0; i < n; i++) { // get full _width and _snapPoints
                coord += this.slideSize(i);
                coord += this.slideMargin(i);
            }

            let rightEdge = coord + this.slideSize(n);

            let multiplier = 0;

            if (rightEdge < 0) {
                multiplier = 1;
            } else if (rightEdge > this.slideableWidth) {
                multiplier = -1
            }

            coord = coord + this.slideableWidth * multiplier;

            // If slide invisible
            // if (coord + this.slideSize(n) < 0) {
            //     coord = undefined;
            // }
            // else if (coord > this.containerSize) {
            //     coord = undefined;
            // }

            return coord;
        }
        else {

            let posCapped = pos;

            if (posCapped < 0) { posCapped = 0 }
            else if (posCapped > this.maxPos) { posCapped = this.maxPos }

            let coord = this._leftOffset - posCapped;

            for (let i = 0; i < n; i++) {
                coord += this.slideSize(i);
                coord += this.slideMargin(i);
            }

            /* at this moment coord is like overscroll was disabled and scrolling was blocked beyond edges */

            // Overscroll!

            let extraTranslation = 0;

            if (pos < 0) {
                let rest = -pos / this.containerSize;
                extraTranslation = this._overscrollFunction(rest) * this.containerSize;
            }
            else if (pos > this.maxPos) {
                let rest = (pos - this.maxPos) / this.containerSize;
                extraTranslation = -this._overscrollFunction(rest) * this.containerSize;
            }

            coord += extraTranslation;

            return coord;
        }
    };

    _getSlideSnapPos(n) {

        let pos = this._getSlideCoordForPos(n, 0) - this.slideSnapOffset(n);

        if (this._infinite) { // in case of infinite, snap position is always slide position
            return this._normalizePos(pos);
        }
        else {

            if (n === 0) {
                let pos = this._getSlideCoordForPos(n, 0) - this.slideSnapOffset(n);
            }

            pos = Math.max(pos, 0);
            pos = Math.min(pos, this.maxPos);
            return pos;
        }
    }

    _updatePos(pos) {

        this._pos = this._normalizePos(pos);

        this._runEventListeners('move');

        // let positions = {};
        //
        // for (let n = 0; n < this._count; n++) {
        //     positions[n] = this._getSlideCoordForPos(n, this._pos);
        // }
    }

    _minPositionDistance(pos1, pos2) {

        if (this._infinite) {
            pos1 = this._normalizePos(pos1);
            pos2 = this._normalizePos(pos2);

            return Math.min(Math.abs(pos1 - pos2), pos1 + (this.slideableWidth - pos2), pos2 + (this.slideableWidth - pos1));
        }
        else {
            return Math.abs(pos1 - pos2);
        }
    }

    _getClosestSnapPosition(pos, side) {

        if (typeof side === 'undefined') { side = 0; }

        pos = this._normalizePos(pos);

        let snapPositions = [];

        if (!this._infinite) {

            // Get all snap positions in array
            for (let n = 0; n < this._count; n++) {

                let snapPos = this._getSlideSnapPos(n);

                if (side === -1 && snapPos > pos) { continue; } // in finite mode and snapping to left side, remove all snap points on the right
                if (side === 1 && snapPos < pos) { continue; } // in finite mode and snapping to right side, remove all snap points on the left

                snapPositions.push(snapPos);
            }

            if (side !== 1 || pos < 0) { snapPositions.unshift(0); }
            if (side !== -1 || pos > this.maxPos) { snapPositions.push(this.maxPos); }
        }
        else {

            // Get all snap positions in array
            for (let n = 0; n < this._count; n++) {
                snapPositions.push(this._getSlideSnapPos(n));
            }

            if (side === -1 || side === 1) {
                snapPositions = snapPositions.concat(snapPositions);

                for(let i = 0; i < snapPositions.length; i++) {
                    if (snapPositions[i] < pos && pos < snapPositions[i + 1]) {

                        if (side === -1) {
                            return snapPositions[i];
                        }
                        else if (side === 1) {
                            return snapPositions[i + 1];
                        }
                    }
                }
            }

        }

        let closestSnapPosition, minDistance;

        snapPositions.forEach((snapPosition) => {
            let distance = this._minPositionDistance(pos, snapPosition);

            if (typeof minDistance === 'undefined' || distance < minDistance) {
                closestSnapPosition = snapPosition;
                minDistance = distance;
            }
        });

        return closestSnapPosition;
    }


    _killAnimations() {
        for (let i = 0; i < this._animations.length; i++) {
            this._animations[i].kill();
        }
        this._animations = [];
    }

}

module.exports = NewSwiper;
