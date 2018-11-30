// import HammerGestureListener from "../gestureListeners/HammerGestureListener";
import TouchSpaceController from "./TouchSpaceController";

// Default TouchSpace uses hammer.js as gestures engine.
const Hammer = typeof window !== 'undefined' ? require('hammerjs') : undefined;

class TouchSpace {

    constructor(swiper, touchSpace) {
        this.swiper = swiper;

        this._touchSpaceController = new TouchSpaceController(this.swiper, true);
        this._touchSpace = touchSpace;

        this._inited = false;
    }

    enable() {
        if (this._inited) { return; }
        this._inited = true;

        console.log('enable touch space!', this.swiper);

        let touchSpace = this._touchSpace;

        this._mc = new Hammer(touchSpace, { domEvents: false/*, touchAction: 'pan-y'*/ });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});


        // this._mc.get('pinch').set({ enable: true });
        //
        // this._blockEvents = false;
        //
        // this._mc.on('pinch pinchstart pinchmove pinchend pinchcancel pinchin pinchout', (ev) => {
        //    console.log('PINCH', ev.type, ev);
        //
        //    if (ev.type == "pinchend") {
        //
        //        this._blockEvents = true;
        //        setTimeout(() => {
        //            this._blockEvents = false;
        //        }, 50);
        //    }
        // });

        let isTouched = false;
        let swiped = false;

        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };

        // At this point in time we manually subscribe to touch events to detect whether user is scrolling the window. If deltaY is big and deltaX is so small that panleft/panright wasn't triggered yet it means that we're scrolling vertically and swiping left/right should be blocked.
        let refScreenY;
        let refClientY;

        let isWindowScrolling;

        touchSpace.ontouchstart = (ev) => {
            isWindowScrolling = false;
            refScreenY = ev.touches[0].screenY;
            refClientY = ev.touches[0].clientY;
        };

        touchSpace.ontouchmove = (ev) => {
            if (isWindowScrolling) { return; }

            if (Math.abs(ev.touches[0].clientY - refClientY) > 10 || Math.abs(ev.touches[0].screenY - refScreenY) > 10) {
                isWindowScrolling = true;
            }
        };

        this._mc.on('panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown', (ev) => {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }

            // If events are blocked after pinch, only one that can't be blocked is panend
            if (this._blockEvents && ev.type !== "panend") {
                return;
            }

            console.log('event', ev.type);

            let delta = ev.deltaX;

            switch (ev.type) {
                case "swipeleft":
                case "swipeup":

                    if (isTouched) {
                        this._touchSpaceController.swipe(Math.abs(ev.velocityX));
                        swiped = true;
                    }

                    break;

                case "swiperight":
                case "swipedown":

                    if (isTouched) {
                        this._touchSpaceController.swipe(-Math.abs(ev.velocityX));
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
                    if (!isTouched) {
                        // If wasn't already detected and window is scrolling then break
                        if (isWindowScrolling) { break; }

                        isTouched = true;
                        swiped = false;

                        touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback

                        this._touchSpaceController.panStart();
                    }

                    if (isTouched && !swiped) {
                        this._touchSpaceController.panMove(delta);
                    }

                    break;

                case "panend":
                    if (isTouched) {

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        isTouched = false;

                        if (!swiped) {
                            this._touchSpaceController.panEnd(swiped)
                        }

                        swiped = false;
                    }
                    break;
            }
        });
    }

    disable() {
        if (!this._inited) { return; }
        this._inited = false;

        if (this._mc) {
            this._mc.destroy();
        }
    }

}


export default TouchSpace;