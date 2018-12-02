import TouchSpaceController from "./TouchSpaceController";
import EventSystem from '../../helpers/EventSystem';

// Default TouchSpace uses hammer.js as gestures engine.
const Hammer = typeof window !== 'undefined' ? require('hammerjs') : undefined;

class TouchSpaceExperiment {

    constructor(swiper, touchSpace) {
        this.swiper = swiper;

        this._touchSpaceController = new TouchSpaceController(this.swiper, true);
        this._touchSpace = touchSpace;

        this._inited = false;

        EventSystem.register(this);
        EventSystem.addEvent(this, 'pinch');
        EventSystem.addEvent(this, 'pinchstart');
        EventSystem.addEvent(this, 'pinchend');
        EventSystem.addEvent(this, 'doubletap');
    }

    set isGestureIntercepted(cb) {
        this._isGestureIntercepted = cb;
    }

    enable() {
        if (this._inited) { return; }
        this._inited = true;

        let touchSpace = this._touchSpace;

        // this._mc = new Hammer(touchSpace, { domEvents: false/*, touchAction: 'pan-y'*/ });
        // this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        // this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        // this._mc.get('pinch').set({ enable: true });
        //
        // this._mc.get('pan').set({enable: false});
        // this._mc.get('swipe').set({enable: false});
        // this._mc.get('pinch').set({ enable: false });

        this._mc = new Hammer.Manager(touchSpace);

        let tap = new Hammer.Tap({ event: 'singletap', taps: 1, time: 500 });
        let pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 10 });
        let pinch = new Hammer.Pinch();

        this._mc.add([tap, pan, pinch]);

        this._blockPanAndSwipeEvents = false;

        let waiting = false;

        this._mc.on('singletap', (ev) => {

            if (waiting) {

                let clientRect = this._touchSpace.getBoundingClientRect();

                let params = {
                    x: ev.center.x - clientRect.left,
                    y: ev.center.y - clientRect.top,
                };

                this._runEventListeners('doubletap', params);

                // console.log('doubletap', ev);
                waiting = false;
            }
            else {
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, 300);
            }
        });

        this._mc.on('pinch pinchstart pinchend pinchin pinchout', (ev) => {

            // console.log('PINCH', ev.type, ev);

            let clientRect = this._touchSpace.getBoundingClientRect();

            // we need to normalize clientX / clientY
            let params = {
                x: ev.center.x - clientRect.left,
                y: ev.center.y - clientRect.top,
                scale: ev.scale
            };

           if (ev.type === 'pinchin' || ev.type === 'pinchout' || ev.type === 'pinchmove') {
               this._runEventListeners('pinch', params);
           }

           if (ev.type === "pinchstart") {
               this._runEventListeners('pinchstart', params);
           }

           if (ev.type === "pinchend") {
               this._runEventListeners('pinchend', params);

               // Pan events are called after pinch end and single finger panning still works. We won't to block it until all fingers are released. Either pinch or pan.
               this._blockPanAndSwipeEvents = true;
           }
        });

        let isTouched = false;

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

        this._mc.on('panup pandown panleft panright panstart panend', (ev) => {

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }

            // console.log('PAN', ev.type);
            // If events are blocked after pinch, only one that can't be blocked is panend
            // if (this._blockPanAndSwipeEvents && ev.type !== "panend") {
            //     return;
            // }

            let delta = ev.deltaX;

            switch (ev.type) {
                // case "swipeleft":
                // case "swipeup":
                //     if (this._blockPanAndSwipeEvents) { break; }
                //     if (this._isGestureIntercepted(ev)) { break; }
                //
                //     this._touchSpaceController.swipe(Math.abs(ev.velocityX));
                //
                //     // if (isTouched) {
                //     //     this._touchSpaceController.swipe(Math.abs(ev.velocityX));
                //     //     swiped = true;
                //     // }
                //
                //     break;
                //
                // case "swiperight":
                // case "swipedown":
                //     if (this._blockPanAndSwipeEvents) { break; }
                //     if (this._isGestureIntercepted(ev)) { break; }
                //
                //     this._touchSpaceController.swipe(-Math.abs(ev.velocityX));
                //
                //     // if (isTouched) {
                //     //     this._touchSpaceController.swipe(-Math.abs(ev.velocityX));
                //     //     swiped = true;
                //     // }
                //
                //     break;

                case "panstart":
                    if (this._blockPanAndSwipeEvents) { break; }
                    if (this._isGestureIntercepted(ev)) { break; }
                    break;

                case "panup":
                case "pandown":
                    if (this._blockPanAndSwipeEvents) { break; }
                    if (this._isGestureIntercepted(ev)) { break; }

                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
                    if (!isTouched) {
                        return;
                    }

                case "panleft":
                case "panright":
                    if (this._blockPanAndSwipeEvents) { break; }
                    if (this._isGestureIntercepted(ev)) { break; }

                    if (!isTouched) {
                        // If wasn't already detected and window is scrolling then break
                        if (isWindowScrolling) { break; }

                        isTouched = true;
                        // swiped = false;

                        touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback

                        this._touchSpaceController.panStart();
                    }

                    if (isTouched) {
                        this._touchSpaceController.panMove(delta);
                    }

                    break;

                case "panend":
                    this._blockPanAndSwipeEvents = false;

                    if (this._isGestureIntercepted(ev)) { break; }

                    if (isTouched) {

                        // Remove panning class when we're not touching slider
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        isTouched = false;

                        console.log(ev.velocityX);
                        this._touchSpaceController.panEnd(-ev.velocityX);

                        // if (!swiped) {
                        //     this._touchSpaceController.panEnd(false)
                        // }

                        // swiped = false;
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


export default TouchSpaceExperiment;