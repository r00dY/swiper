import AnimationEngine from "../animationEngines/AnimationEngine";
import EventSystem from "../helpers/EventSystem";

class SwiperEngine {

    constructor() {

        this._slideMarginFunction = () => { return 0; };
        this._slideSnapOffsetFunction = () => { return 0; };
        this._leftOffsetFunction = () => 0;
        this._rightOffsetFunction = () => 0;

        this._infinite = false;
        this._snapOnlyToAdjacentSlide = false;

        // Overscroll function for finite sliders. If it's f(x) = x it will be linear. x = 1 means entire container width movement.
        this._overscrollFunction = (x) => {
            return 0.5 * Math.log(1 + x);
        };

        // default animation engine
        this._animationEngine = new AnimationEngine(AnimationEngine.Ease.outExpo, 0.8);

        this._scrollingAnimationTime = 0.8;

        this._pos = 0;

        this._isTouched = false;
        this._isStill = true;
        this._isAnimating = false;

        this._activeSlidesString = undefined; // comma separated list of active slides indexes
        this._visibleSlidesString = undefined; // comma separated list of active slides indexes

        EventSystem.register(this);
        EventSystem.addEvent(this, 'move');
        EventSystem.addEvent(this, 'animationStart');
        EventSystem.addEvent(this, 'animationEnd');
        EventSystem.addEvent(this, 'stillnessChange');
        EventSystem.addEvent(this, 'touchdown');
        EventSystem.addEvent(this, 'touchup');
        EventSystem.addEvent(this, 'activeSlidesChange');
        EventSystem.addEvent(this, 'visibleSlidesChange');
    }

    set animationEngine(engine) {
        this._animationEngine = engine;
    }

    get animationEngine() {
        return this._animationEngine;
    }

    set containerSizeFunction(containerSizeFunction) {
        this._containerSizeFunction = containerSizeFunction;
    }

    get containerSizeFunction() {
        return this._containerSizeFunction;
    }

    set count(newCount) {
        this._count = newCount;
    }

    get count() {
        return this._count;
    }

    set slideSizeFunction(slideSizeFunction) {
        this._slideSizeFunction = slideSizeFunction;
    }

    get slideSizeFunction() {
        return this._slideSizeFunction;
    }

    set slideMarginFunction(slideMarginFunction) {
        this._slideMarginFunction = slideMarginFunction;
    }

    get slideMarginFunction() {
        return this._slideMarginFunction;
    }


    set slideSnapOffsetFunction(slideSnapOffsetFunction) {
        this._slideSnapOffsetFunction = slideSnapOffsetFunction;
    }

    get slideSnapOffsetFunction() {
        return this._slideSnapOffsetFunction;
    }

    set rightOffsetFunction(rightOffsetFunction) {
        this._rightOffsetFunction = rightOffsetFunction;
    }

    get rightOffsetFunction() {
        return this._rightOffsetFunction;
    }

    set leftOffsetFunction(leftOffsetFunction) {
        this._leftOffsetFunction = leftOffsetFunction;
    }

    get leftOffsetFunction() {
        return this._leftOffsetFunction;
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

    set snapOnlyToAdjacentSlide(snapOnlyToAdjacentSlide) {
        this._snapOnlyToAdjacentSlide = snapOnlyToAdjacentSlide;
    }

    get snapOnlyToAdjacentSlide() {
        return this._snapOnlyToAdjacentSlide;
    }

    set initialSlide(n) {
        this._initialSlide = n;
        this._initialPos = undefined;
    }

    get initialSlide() {
        return this._initialSlide;
    }

    set initialPos(pos) {
        this._initialPos = pos;
        this._initialSlide = undefined;
    }

    get initialPos() {
        return this._initialPos;
    }

    /**
     *
     */
    layout() {
        this._CACHE = {
            slideSize: {},
            slideMargin: {},
            slideSnapOffset: {},
        };

        this._activeSlidesString = undefined;
        this._visibleSlidesString = undefined;

        // containerSize validation
        if (typeof this._containerSizeFunction !== "function") { throw "'containerSizeFunction' is not defined or is not a function"; }

        // slideSize validation
        if (typeof this._slideSizeFunction !== "function") { throw "'slideSize' is not defined or is not a function"; }

        // count validation
        if (typeof this._count !== "number") { throw "'count' is not defined or is not a number"; }

        // if user didn't set initialSlide and initialPos, then by default we take pos 0 for finite and first slide snap point for infinite.
        if (typeof this._initialSlide === 'undefined' && typeof this._initialPos === 'undefined') {
            if (this._infinite) {
                this._updatePos(this._getSlideSnapPos(0));
            } else {
                this._updatePos(0); // just to run event listener -> layout should invoke 'move' once
            }
        } else if (typeof this._initialSlide !== 'undefined') {
            this._updatePos(this._getSlideSnapPos(this.initialSlide));
        } else if (typeof this._initialPos !== 'undefined') {
            this._updatePos(this.initialPos);
        }
    }

    /**
     * Mock method not doing anything except for being helper for touchdown, touchup, and stillness events.
     */
    touchdown() {
        if (this._isTouched) { return; }

        this._isTouched = true;

        this._runEventListeners('touchdown');

        this._updateStillness();
    }

    touchup() {
        if (!this._isTouched) { return; }

        this._isTouched = false;
        this._runEventListeners('touchup');

        this._updateStillness();
    }

    _updateStillness() {
        if (!this._isStill && !this.isAnimating() && !this.isTouched()) {
            this._isStill = true;
            this._runEventListeners('stillnessChange');
        }
        else if (this._isStill && (this.isAnimating() || this.isTouched())) {
            this._isStill = false;
            this._runEventListeners('stillnessChange');
        }
    };


    /**
     * This method stops movement of current animations. If there are no animations, this method doesn't do anything. Usually should be called on touch down gesture.
     */
    stopMovement() {
        this._finishAnimation();
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

        this._finishAnimation();

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

            this.animationEngine.animate(this._pos, pos, this._updatePos.bind(this), this._finishAnimation.bind(this));

            this._startAnimation();
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
     * This method moves 1 container width to the right (with snap)
     */
    moveRight(animated) {
        this.moveTo(this._getClosestSnapPosition(this._pos + this.containerSize), animated, 1);
    }

    /**
     * This method moves 1 container width to the left (with snap)
     */
    moveLeft(animated) {
        this.moveTo(this._getClosestSnapPosition(this._pos - this.containerSize), animated, -1);
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

        let direction = velocity < 0 ? -1 : 1;

        this.moveTo(this._getClosestSnapPosition(targetPos, direction), animated, direction);
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

    slideSize(n) {
        if (this._CACHE["slideSize"][n]) { return this._CACHE["slideSize"][n]; }

        this._CACHE["slideSize"][n] = this._slideSizeFunction(n);

        return this._CACHE["slideSize"][n];
    }


    slideMargin(n) {
        if (this._CACHE["slideMargin"][n]) { return this._CACHE["slideMargin"][n]; }

        this._CACHE["slideMargin"][n] = this._slideMarginFunction(n);

        return this._CACHE["slideMargin"][n];
    }

    slideSnapOffset(n) {
        if (this._CACHE["slideSnapOffset"][n]) { return this._CACHE["slideSnapOffset"][n]; }

        this._CACHE["slideSnapOffset"][n] = this._slideSnapOffsetFunction(n);

        return this._CACHE["slideSnapOffset"][n];
    }

    get containerSize() {
        if (typeof this._CACHE["containerSize"] !== 'undefined') { return this._CACHE["containerSize"]; }

        let result = this._containerSizeFunction();

        this._CACHE["containerSize"] = result;

        return result;
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
            result += (this._leftOffsetFunction() + this._rightOffsetFunction());
        }

        this._CACHE["slideableWidth"] = result;

        return result;
    }

    get maxPos() {
        if (this._infinite) {
            throw "maxPos method not available in infinite mode"
        }

        return Math.max(0, this.slideableWidth - this.containerSize);
    }

    isAnimating() {
        return this._isAnimating;
    }

    isTouched() {
        return this._isTouched;
    }

    isStill() {
        return this._isStill;
    }

    slideVisibility (n) {
        let leftEdge = this.slideCoord(n);
        let rightEdge = leftEdge + this.slideSize(n);

        if (rightEdge < 0) {
            return 0;
        }
        else if (leftEdge > this.containerSize) {
            return 0;
        }
        else if (leftEdge < 0 && rightEdge > this.containerSize) {
            return 1;
        }
        else if (leftEdge >= 0 && rightEdge <= this.containerSize) {
            return 1;
        }
        else if (leftEdge < 0 && rightEdge <= this.containerSize) {
            return rightEdge / this.slideSize(n);
        }
        else if (leftEdge >= 0 && rightEdge > this.containerSize) {
            return (this.containerSize - leftEdge) / this.slideSize(n);
        }
    }

    isSlideVisible(n) {
        return this.slideVisibility(n) > 0;
    }

    visibleSlides() {
        let visibleSlides = [];

        for (let n = 0; n < this.count; n++) {
            if (this.isSlideVisible(n)) {
                visibleSlides.push(n);
            }
        }

        return visibleSlides;
    }

    activeSlides() {

        let activeSlides = [];

        for (let n = 0; n < this.count; n++) {
            if (this.slideVisibility(n) > 0.5) {
                activeSlides.push({
                    index: n,
                    pos: this.slideCoord(n)
                });
            }
        }

        if (activeSlides.length == 0) { // There must be at least 1 active slide. If none, then most visible one is picked.

            let maxVisibility = 0, maxIndex = 0;
            for (let n = 0; n < this.count; n++) {
                if (this.slideVisibility(n) > maxVisibility) {
                    maxIndex = n;
                    maxVisibility = this.slideVisibility(n);
                }
            }

            return [maxIndex];
        }

        // Sort by position
        activeSlides.sort(function (a, b) {
            return a.pos > b.pos;
        });

        // return only indexes
        return activeSlides.map(function (x) {
            return x.index
        });
    }

    isSlideActive(n) {
        return this.activeSlides().indexOf(n) >= -1;
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
            // else if (coord > this.containerSizeFunction) {
            //     coord = undefined;
            // }

            return coord;
        }
        else {

            let posCapped = pos;

            if (posCapped < 0) { posCapped = 0 }
            else if (posCapped > this.maxPos) { posCapped = this.maxPos }

            let coord = this._leftOffsetFunction() - posCapped;

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

        // Active slides event
        let activeSlides = this.activeSlides();
        let activeSlidesString = activeSlides.join(",");

        if (activeSlidesString !== this._activeSlidesString) {
            this._runEventListeners('activeSlidesChange');
            this._activeSlidesString = activeSlidesString;
        }

        // Visible slides event
        let visibleSlides = this.visibleSlides();
        let visibleSlidesString = visibleSlides.join(",");

        if (visibleSlidesString !== this._visibleSlidesString) {
            this._runEventListeners('visibleSlidesChange');
            this._visibleSlidesString = visibleSlidesString;
        }

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




            let maxSnapPoint = Math.max.apply(Math, snapPositions);

            if (side === -1 || side === 1) {
                for(let i = 0; i < snapPositions.length-1; i++) {
                    if (
                        (snapPositions[i] < pos && pos < snapPositions[i + 1]) ||
                        (snapPositions[i] === maxSnapPoint && (pos > snapPositions[i] || pos < snapPositions[i + 1]))
                    ) {
                        if (side === -1) {
                            return snapPositions[i];
                        }
                        else if (side === 1) {
                            return snapPositions[i + 1];
                        }
                    }
                }

                if (side === -1) {
                    return snapPositions[this._count - 1];
                }
                else if (side === 1) {
                    return snapPositions[0];
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

    _startAnimation() {
        if (this._isAnimating) { return; }

        this._runEventListeners('animationStart');
        this._isAnimating = true;
        this._updateStillness();
    }

    _finishAnimation() {
        if (!this._isAnimating) { return; }

        this.animationEngine.killAnimation();

        this._runEventListeners('animationEnd');
        this._isAnimating = false;
        this._updateStillness();
    }


}

export default SwiperEngine;
