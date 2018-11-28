import EventSystem from "../helpers/EventSystem";
import VerticalScrollDetector from "../helpers/VerticalScrollDetector.js";

const Hammer = typeof window !== 'undefined' ? require('hammerjs') : undefined;

/**
 * Events:
 *
 * onPan(deltaX)
 *
 * - should be called only when user's intention is to pan left or pan right the swiper.
 * - when user is scrolling page top/bottom, this event shouldn't fire.
 * - when this event started firing (users intention is scrolling swiper), page shouldn't scroll
 *
 * onSwipe(velocity)
 *
 * - called after couple of onPan's when user sharply moves his finger
 * - after onSwipe there won't be any onPan events until onPanEnd is called.
 *
 * onPanStart
 *
 * - always called at start of panning
 *
 * onPanEnd
 *
 * - called when fingers are released
 *
 */

class HammerGestureListener {

    constructor(touchSpace) {
        this._mc = new Hammer(touchSpace, { domEvents: false/*, touchAction: 'pan-y'*/ });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});


        // this._mc.get('pinch').set({ enable: true });
        //
        // this._mc.on('pinch pinchstart pinchmove pinchend pinchcancel pinchin pinchout', (ev) => {
        //    console.log('PINCH', ev.type, ev);
        //
        //    if (ev.type == "pinchend") {
        //
        //        this.blockEvents = true;
        //        setTimeout(() => {
        //            this.blockEvents = false;
        //        }, 50);
        //    }
        // });

        EventSystem.register(this);
        EventSystem.addEvent(this, 'swipe');
        EventSystem.addEvent(this, 'pan');
        EventSystem.addEvent(this, 'panstart');
        EventSystem.addEvent(this, 'panend');

        let isTouched = false;
        let swiped = false;

        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };


        let deltaClientY = 0;
        let deltaScreenY = 0;
        let refScreenY;
        let refClientY;

        let isWindowScrolling;

        touchSpace.ontouchstart = (ev) => {
            console.log('touch start!', ev);

            isWindowScrolling = false;
            refScreenY = ev.touches[0].screenY;
            refClientY = ev.touches[0].clientY;
        };

        touchSpace.ontouchend = () => {
            console.log('touch end!');
        };

        touchSpace.ontouchmove = (ev) => {

            if (isWindowScrolling) { return; }
            deltaClientY = ev.touches[0].clientY - refClientY;
            deltaScreenY = ev.touches[0].screenY - refScreenY;

            if (Math.abs(deltaClientY) > 10 || Math.abs(deltaScreenY) > 10) {
                isWindowScrolling = true;
                console.log('==== BLOCKED =====');
            }

            console.log('touch move!', 'delta client Y', deltaClientY, 'deltaScreenY', deltaScreenY);
        };

        touchSpace.ontouchcancel = () => {
            console.log('touch start!');
        };

        this._mc.on('panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown', (ev) => {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }

            console.log('event', ev.type);

            let delta = ev.deltaX;

            switch (ev.type) {
                case "swipeleft":
                case "swipeup":

                    if (isTouched) {
                        this._runEventListeners('swipe', Math.abs(ev.velocityX));
                        swiped = true;
                    }

                    break;

                case "swiperight":
                case "swipedown":

                    if (isTouched) {
                        this._runEventListeners('swipe', -Math.abs(ev.velocityX));
                        swiped = true;
                    }

                    break;

                case "panstart":
                    break;

                case "panup":
                case "pandown":
                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
                    if (!isTouched) {
                        return;
                    }

                case "panleft":
                case "panright":
                    // if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement

                    if (!isTouched) {

                        // If wasn't already detected and window is scrolling then break
                        if (isWindowScrolling) { break; }

                        // this.touchdown();

                        this._blockScrolling();

                        isTouched = true;
                        swiped = false;

                        // this.stopMovement();
                        // this._panStartPos = this.pos;

                        touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback

                        this._runEventListeners('panstart');

                    }

                    if (isTouched && !swiped) {

                        this._runEventListeners('pan', delta);

                        // this.moveTo(this._panStartPos - delta, false);
                    }

                    break;

                case "panend":

                    if (isTouched) {

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        this._unblockScrolling();

                        isTouched = false;

                        if (!swiped) {
                            this._runEventListeners('panend', swiped);
                            // this.snap(0, true);
                        }

                        swiped = false;

                        // this.touchup();
                    }
                    break;
            }
        });

        // this.blockEvents = false;
    }

    _blockScrolling() {
        if (this._mc) {
            // this._mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
            // this._mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
        }
    }

    _unblockScrolling() {
        if (this._mc) {
            // this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL});
            // this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL});
        }
    }

    destroy() {
        this._mc.destroy();
    }
}

export default HammerGestureListener;