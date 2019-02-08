import AnimationEngine from "./animationEngines/AnimationEngine";
import EventSystem from "./helpers/EventSystem";

// TODO: tests for events
// TODO: tests for animated

let defaults = {
    slideMargin: () => 0,
    slideSnapOffset: () => 0,
    leftOffset: () => 0,
    rightOffset: () => 0,
    infinite: false,
    snapOnlyToAdjacentSlide: false,
    overscrollFunction: (x) => 0.5 * Math.log(1 + x), // Overscroll function for finite sliders. If it's f(x) = x it will be linear. x = 1 means entire container width movement.
    animationEngine: new AnimationEngine(AnimationEngine.Ease.outExpo, 0.8),
};

class AbstractSlider {

    constructor(config) {
        this._applyConfig(config);

        // this._isTouched = false;
        // this._isStill = true;
        // this._isAnimating = false;

        this._activeSlidesString = undefined; // comma separated list of active slides indexes
        this._visibleSlidesString = undefined; // comma separated list of active slides indexes

        EventSystem.register(this);
        EventSystem.addEvent(this, 'stateChange');


        EventSystem.addEvent(this, 'move');
        EventSystem.addEvent(this, 'animationStart');
        EventSystem.addEvent(this, 'animationEnd');
        EventSystem.addEvent(this, 'stillnessChange');
        EventSystem.addEvent(this, 'touchdown');
        EventSystem.addEvent(this, 'touchup');
        EventSystem.addEvent(this, 'activeSlidesChange');
        EventSystem.addEvent(this, 'visibleSlidesChange');

        this.layout();
    }

    _applyConfig(config) {
        if (config.initialPos) {
            config.initialSlide = undefined;
        }
        else if (config.initialSlide) {
            config.initialPos = undefined;
        }

        this._config = Object.assign({}, defaults, config);
    }

    layout() {
        // validate
        if (typeof this._config.containerSize !== "function") {
            throw "'containerSizeFunction' is not defined or is not a function";
        }
        if (typeof this._config.slideSize !== "function") {
            throw "'slideSize' is not defined or is not a function";
        }
        if (typeof this._config.count !== "number") {
            throw "'count' is not defined or is not a number";
        }

        this.state = {
            // constant
            containerSize: this._config.containerSize(),
            leftOffset: this._config.leftOffset(),
            rightOffset: this._config.rightOffset(),
            slides: [],

            // changing
            isAnimating: false,
            isTouched: false,
            isStill: true,
            pos: 0
        };

        for (let i = 0; i < this._config.count; i++) {
            this.state.slides.push({
                // constant
                index: i,
                size: this._config.slideSize(i),
                margin: this._config.slideMargin(i),
                snapOffset: this._config.slideSnapOffset(i),

                // changing
                active: undefined,
                visible: undefined,
                coord: undefined
            })
        }

        // Let's calculate values based on config
        this.state.slideableWidth = this._calculateSlideableWidth();
        this.state.maxPos = this._calculateMaxPos();

        // if user didn't set initialSlide and initialPos, then by default we take pos 0 for finite and first slide snap point for infinite.
        if (typeof this._config.initialSlide === 'undefined' && typeof this._config.initialPos === 'undefined') {
            if (this._config.infinite) {
                this._updatePos(this._getSlideSnapPos(0));
            } else {
                this._updatePos(0); // just to run event listener -> layout should invoke 'move' once
            }
        } else if (typeof this._config.initialSlide !== 'undefined') {
            this._updatePos(this._getSlideSnapPos(this._config.initialSlide));
        } else if (typeof this._config.initialPos !== 'undefined') {
            this._updatePos(this._config.initialPos);
        }
    }

    /**
     * Mock method not doing anything except for being helper for touchdown, touchup, and stillness events.
     */
    touchdown() {
        if (this.state.isTouched) {
            return;
        }

        this.state.isTouched = true;

        this._runEventListeners('touchdown');
        this._runEventListeners('stateChanged');

        this._updateStillness();
    }

    touchup() {
        if (!this.state.isTouched) {
            return;
        }

        this.state.isTouched = false;
        this._runEventListeners('touchup');
        this._runEventListeners('stateChanged');

        this._updateStillness();
    }

    _updateStillness() {
        if (!this.state.isStill && !this.state.isAnimating && !this.state.isTouched) {
            this.state.isStill = true;
            this._runEventListeners('stillnessChange');
            this._runEventListeners('stateChanged');
        }
        else if (this.state.isStill && (this.state.isAnimating || this.state.isTouched)) {
            this.state.isStill = false;
            this._runEventListeners('stillnessChange');
            this._runEventListeners('stateChanged');
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

        if (typeof animated === 'undefined') {
            animated = true;
        }
        if (typeof side === 'undefined') {
            side = 0;
        }

        // Don't initiate animation if we're already in the same spot.
        let diff = Math.abs(pos - this.state.pos);
        if (diff < 1) {
            return;
        }

        this._finishAnimation();

        if (animated) {

            // this.setStill(false);
            if (this._config.infinite) {

                if (side == 0) { // shortest path strategy

                    if (Math.abs(pos - this.state.pos) > this.state.slideableWidth / 2) {
                        if (pos - this.state.pos > 0) {
                            pos -= this.state.slideableWidth;
                        }
                        else {
                            pos += this.state.slideableWidth;
                        }
                    }
                }
                else if (side == 1 && pos - this.state.pos < 0) { // force right movement
                    pos += this.state.slideableWidth;
                }
                else if (side == -1 && pos - this.state.pos > 0) { // force left movement
                    pos -= this.state.slideableWidth;
                }

            }

            this._config.animationEngine.animate(this.state.pos, pos, this._updatePos.bind(this), this._finishAnimation.bind(this));

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

        if (this._config.infinite) {

            if (direction === 0) { // shortest path strategy

                if (Math.abs(pos - this.state.pos) > this.state.slideableWidth / 2) {
                    if (pos - this.state.pos > 0) {
                        pos -= this.state.slideableWidth;
                    }
                    else {
                        pos += this.state.slideableWidth;
                    }
                }
            }
            else if (direction === 1 && pos - this.state.pos < 0) { // force right movement
                pos += this.state.slideableWidth;
            }
            else if (direction === -1 && pos - this.state.pos > 0) { // force left movement
                pos -= this.state.slideableWidth;
            }
        }

        this.moveTo(pos, animated);
    }

    /**
     * This method moves 1 container width to the right (with snap)
     */
    moveRight(animated) {
        this.moveTo(this._getClosestSnapPosition(this.state.pos + this.state.containerSize), animated, 1);
    }

    /**
     * This method moves 1 container width to the left (with snap)
     */
    moveLeft(animated) {
        this.moveTo(this._getClosestSnapPosition(this.state.pos - this.state.containerSize), animated, -1);
    }

    /**
     * This method snaps to closest slide's snap position.
     *
     * @param velocity
     * @param animated
     */
    snap(velocity, animated) {

        if (velocity === 0) {
            this.moveTo(this._getClosestSnapPosition(this.state.pos), animated);
            return;
        }

        let s = 0.2 * velocity * this._config.animationEngine.time / 2;
        let targetPos = this.state.pos + s; // targetPos at this stage is not snapped to any slide.

        // If this options is true, we want to snap to as closest slide as possible and not further.
        // This is necessary because when you have slider when slide is 100% width, strong flick gestures
        // would make swiper move 2 or 3 positions to right / left which feels bad. This flag should be
        // disabled in case of "item swiper" when couple of items are visible in viewport at the same time.
        if (this._config.snapOnlyToAdjacentSlide) {
            targetPos = velocity < 0 ? this.state.pos - 1 : this.state.pos + 1;
        }

        let direction = velocity < 0 ? -1 : 1;

        this.moveTo(this._getClosestSnapPosition(targetPos, direction), animated, direction);
    }

    /**
     * Helpers
     */
    _calculateSlideableWidth() {
        const slides = this.state.slides;

        let result = 0;
        for (let i = 0; i < this._config.count; i++) { // get full _width and _snapPoints

            result += slides[i].size;

            if (i === slides.length - 1 && !this._config.infinite) {
                break;
            } // total slideable width can't include right margin of last element unless we are at infinite scrolling!

            result += slides[i].margin;
        }

        // Finite scroll should take left and right offset into account.
        if (!this._config.infinite) {
            result += (this.state.leftOffset + this.state.rightOffset);
        }

        return result;
    }

    _calculateMaxPos() {
        if (this._config.infinite) {
            return;
        }

        return Math.max(0, this.state.slideableWidth - this.state.containerSize);
    }

    // isAnimating() {
    //     return this._isAnimating;
    // }
    //
    // isTouched() {
    //     return this._isTouched;
    // }
    //
    // isStill() {
    //     return this._isStill;
    // }

    _slideVisibility(n) {
        let leftEdge = this.state.slides[n].coord;
        let rightEdge = leftEdge + this.state.slides[n].size;

        if (rightEdge < 0) {
            return 0;
        }
        else if (leftEdge > this.state.containerSize) {
            return 0;
        }
        else if (leftEdge < 0 && rightEdge > this.state.containerSize) {
            return 1;
        }
        else if (leftEdge >= 0 && rightEdge <= this.state.containerSize) {
            return 1;
        }
        else if (leftEdge < 0 && rightEdge <= this.state.containerSize) {
            return rightEdge / this.state.slides[n].size;
        }
        else if (leftEdge >= 0 && rightEdge > this.state.containerSize) {
            return (this.state.containerSize - leftEdge) / this.state.slides[n].size;
        }
    }

    _isSlideVisible(n) {
        return this.slideVisibility(n) > 0;
    }

    _visibleSlides() {
        let visibleSlides = [];

        for (let n = 0; n < this.count; n++) {
            if (this.isSlideVisible(n)) {
                visibleSlides.push(n);
            }
        }

        return visibleSlides;
    }

    _activeSlides() {

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

    // isSlideActive(n) {
    //     return this.activeSlides().indexOf(n) >= -1;
    // }

    _normalizePos(position) {

        if (this._config.infinite) {

            position = position % this.state.slideableWidth;
            if (position < 0) {
                position += this.state.slideableWidth;
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

        if (this._config.infinite) {

            pos = this._normalizePos(pos);

            let coord = -pos;

            for (let i = 0; i < n; i++) { // get full _width and _snapPoints
                coord += this.state.slides[i].size;
                coord += this.state.slides[i].margin;
            }

            let rightEdge = coord + this.state.slides[n].size;

            let multiplier = 0;

            if (rightEdge < 0) {
                multiplier = 1;
            } else if (rightEdge > this.state.slideableWidth) {
                multiplier = -1
            }

            coord = coord + this.state.slideableWidth * multiplier;

            return coord;
        }
        else {

            let posCapped = pos;

            if (posCapped < 0) {
                posCapped = 0
            }
            else if (posCapped > this.state.maxPos) {
                posCapped = this.state.maxPos
            }

            let coord = this.state.leftOffset - posCapped;

            for (let i = 0; i < n; i++) {
                coord += this.state.slides[i].size;
                coord += this.state.slides[i].margin;
            }

            /* at this moment coord is like overscroll was disabled and scrolling was blocked beyond edges */

            // Overscroll!

            let extraTranslation = 0;

            if (pos < 0) {
                let rest = -pos / this.state.containerSize;
                extraTranslation = this._config.overscrollFunction(rest) * this.state.containerSize;
            }
            else if (pos > this.state.maxPos) {
                let rest = (pos - this.state.maxPos) / this.state.containerSize;
                extraTranslation = -this._config.overscrollFunction(rest) * this.state.containerSize;
            }

            coord += extraTranslation;

            return coord;
        }
    };

    _getSlideSnapPos(n) {

        let pos = this._getSlideCoordForPos(n, 0) - this.state.slides[n].snapOffset;

        if (this._config.infinite) { // in case of infinite, snap position is always slide position
            return this._normalizePos(pos);
        }
        else {

            if (n === 0) {
                pos = this._getSlideCoordForPos(n, 0) - this.state.slides[n].snapOffset;
            }

            pos = Math.max(pos, 0);
            pos = Math.min(pos, this.state.maxPos);
            return pos;
        }
    }

    _updatePos(pos) {

        this.state.pos = this._normalizePos(pos);

        // TODO: Awfully non-optimal. To refactor and optimise!!!
        for (let i = 0; i < this.state.slides.length; i++) {
            this.state.slides[i].coord = this._getSlideCoordForPos(i, pos);
            this.state.slides[i].visibility = this._slideVisibility(i);
        }

        this._runEventListeners('move');

        // Active slides event
        let activeSlides = this._activeSlides();
        let activeSlidesString = activeSlides.join(",");

        if (activeSlidesString !== this._activeSlidesString) {
            this._runEventListeners('activeSlidesChange');
            this._activeSlidesString = activeSlidesString;
        }

        // Visible slides event
        let visibleSlides = this._visibleSlides();
        let visibleSlidesString = visibleSlides.join(",");

        if (visibleSlidesString !== this._visibleSlidesString) {
            this._runEventListeners('visibleSlidesChange');
            this._visibleSlidesString = visibleSlidesString;
        }

        this._runEventListeners('stateChange');
    }

    _minPositionDistance(pos1, pos2) {

        if (this._config.infinite) {
            pos1 = this._normalizePos(pos1);
            pos2 = this._normalizePos(pos2);

            return Math.min(Math.abs(pos1 - pos2), pos1 + (this.state.slideableWidth - pos2), pos2 + (this.state.slideableWidth - pos1));
        }
        else {
            return Math.abs(pos1 - pos2);
        }
    }

    _getClosestSnapPosition(pos, side) {

        if (typeof side === 'undefined') {
            side = 0;
        }

        pos = this._normalizePos(pos);

        let snapPositions = [];

        if (!this._config.infinite) {

            // Get all snap positions in array
            for (let n = 0; n < this.state.slides.length; n++) {

                let snapPos = this._getSlideSnapPos(n);

                if (side === -1 && snapPos > pos) {
                    continue;
                } // in finite mode and snapping to left side, remove all snap points on the right
                if (side === 1 && snapPos < pos) {
                    continue;
                } // in finite mode and snapping to right side, remove all snap points on the left

                snapPositions.push(snapPos);
            }

            if (side !== 1 || pos < 0) {
                snapPositions.unshift(0);
            }
            if (side !== -1 || pos > this.state.maxPos) {
                snapPositions.push(this.state.maxPos);
            }
        }
        else {

            // Get all snap positions in array
            for (let n = 0; n < this.state.slides.length; n++) {
                snapPositions.push(this._getSlideSnapPos(n));
            }


            let maxSnapPoint = Math.max.apply(Math, snapPositions);

            if (side === -1 || side === 1) {
                for (let i = 0; i < snapPositions.length - 1; i++) {
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
                    return snapPositions[this.state.slides.length - 1];
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
        if (this.state.isAnimating) {
            return;
        }

        this.state.isAnimating = true;
        this._runEventListeners('animationStart');
        this._runEventListeners('stateChange');
        this._updateStillness();
    }

    _finishAnimation() {
        if (!this.state.isAnimating) {
            return;
        }

        this._config.animationEngine.killAnimation();

        this.state.isAnimating = false;
        this._runEventListeners('animationEnd');
        this._runEventListeners('stateChange');
        this._updateStillness();
    }


}

export default AbstractSlider;
