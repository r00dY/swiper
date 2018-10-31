import VerticalScrollDetector from "./VerticalScrollDetector.js";

import SwiperEngine from "./SwiperEngine";
import HammerGestureListener from "./HammerGestureListener";

class TouchSwiper extends SwiperEngine {

    constructor(touchSpace, gestureListener, animationEngine) {
        super(animationEngine);

        this._touchSpace = touchSpace;
        this._gestureListener = gestureListener ? gestureListener : new HammerGestureListener(this._touchSpace);
    }

    enableTouch() {
        if (this._enabled) { return; }
        this._enabled = true;

        let swiped = false;

        let isTouched = false;
        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };

        // Preventing dragging of links and img might be "wanted effect"!!! That's why we don't set user-drag on all children of slider.
        // Maybe on desktop we want items in slider to be draggable? And we want to disable touch? It should be done by slider developer.
        // maybe we should make this user-drag on all children
        // Users can easily do this in CSS for only touch devices. Easy.

        let swipeLeftListener = (ev) => {
            if (isTouched) {
                this.snap(Math.abs(ev.velocityX) * 1000, true);
                swiped = true;
            }
        };

        let swipeRightListener = (ev) => {
            if (isTouched) {
                this.snap(-Math.abs(ev.velocityX) * 1000, true);
                swiped = true;
            }
        };

        let panRightListener = (ev) => {
            if (VerticalScrollDetector.isScrolling()) { return; } // if body is scrolling then not allow for horizontal movement

            if (!isTouched) {
                this.touchdown();

                this._gestureListener.blockScrolling();

                isTouched = true;
                swiped = false;

                this.stopMovement();
                this._panStartPos = this.pos;

                this._touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback
            }

            if (isTouched && !swiped) {
                this.moveTo(this._panStartPos - ev.deltaX, false);
            }
        };

        let panEndListener = (ev) => {
            if (isTouched) {

                // Remove panning class when we're not touching slider
                setTimeout(() => {
                    this._touchSpace.removeEventListener('click', stopPropagationCallback, true);
                }, 0);

                this._gestureListener.unblockScrolling();

                isTouched = false;

                if (!swiped) {
                    this.snap(0, true);
                }

                swiped = false;

                this.touchup();
            }
        }

        this._gestureListener.on('swipeleft', swipeLeftListener);
        this._gestureListener.on('swipeup', swipeLeftListener);
        this._gestureListener.on('swiperight', swipeRightListener);
        this._gestureListener.on('swipedown', swipeRightListener);
        this._gestureListener.on('panleft', panRightListener);
        this._gestureListener.on('panright', panRightListener);
        this._gestureListener.on('panend', panEndListener);
        this._gestureListener.on('panup', (e) => {
            if(!isTouched) {
                e.stopPropagation();
            }
        });
        this._gestureListener.on('pandown', (e) => {
            if(!isTouched) {
                e.stopPropagation();
            }
        });
    }

    disableTouch() {
        if (!this._enabled) {
            return;
        }
        this._enabled = false;

        this._gestureListener.destroy();
        this._gestureListener = undefined;
    }
}


export default TouchSwiper;