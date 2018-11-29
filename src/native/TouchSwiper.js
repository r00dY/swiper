import SwiperEngine from "./SwiperEngine";
import HammerGestureListener from "../gestureListeners/HammerGestureListener";

class TouchSwiper extends SwiperEngine {

    constructor() {
        super();

        this._gestureListenerClass = HammerGestureListener; // TODO: default gesture listener class is Hammer but it should be sth more leightweight definitely
    }

    set gestureListenerClass(gestureListener) {
        this._gestureListenerClass = gestureListener;
    }

    get gestureListenerClass() {
        return this._gestureListenerClass;
    }

    set touchSpace(touchSpace) {
        this._touchSpace = touchSpace;
    }

    get touchSpace() {
        return this._touchSpace;
    }

    enableTouch() {
        if (this._enabled) {
            return;
        }
        this._enabled = true;

        this._gestureListener = new this._gestureListenerClass(this._touchSpace);

        let panStartListener = () => {
            this._panStartPos = this.pos;
            super.touchdown();
        };

        let panListener = (deltaX) => {
            this.moveTo(this._panStartPos - deltaX, false);
        };

        let panEndListener = (swiped) => {
            super.touchup();

            if (!swiped) {
                super.snap(0, true);
            }
        };

        let swipeListener = (velocityX) => {
            super.snap(velocityX * 1000, true);
        };

        this._gestureListener.addEventListener('panstart', panStartListener);
        this._gestureListener.addEventListener('pan', panListener);
        this._gestureListener.addEventListener('swipe', swipeListener);
        this._gestureListener.addEventListener('panend', panEndListener);
    }

    disableTouch() {
        if (!this._enabled) {
            return;
        }
        this._enabled = false;

        this._gestureListener.destroy();
        this._gestureListener = undefined;
    }

    /* Following methods from SwiperEngine shouldn't be in API of TouchSwiper */
    touchdown() {
        throw "touchdown method can't be used in TouchSwiper instance!";
    }

    touchup() {
        throw "touchup method can't be used in TouchSwiper instance!";
    }

    snap() {
        if (this.isAnimating()) {
            throw "snap method can't be used in TouchSwiper instance while animation is in progress!";
        }
    }

    stopMovement() {
        throw "stopMovement method can't be used in TouchSwiper instance!";
    }

}


export default TouchSwiper;