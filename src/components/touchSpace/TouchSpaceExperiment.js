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
    }

    set zoomer(zoomer) {
        this._zoomer = zoomer;
    }

    enable() {
        if (this._inited) { return; }
        this._inited = true;

        let touchSpace = this._touchSpace;

        this._mc = new Hammer.Manager(touchSpace);
        let tap = new Hammer.Tap({ event: 'singletap', taps: 1, time: 500 });
        let pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20 });
        let pinch = new Hammer.Pinch();

        this._mc.add([tap, pan, pinch]);

        let SESSION = null; // "pinch" (zoomer), "pan-zoomer" (zoomer), "pan-swiper" (swiper)

        this._blockPanEvents = false;
        this._blockPinchEvents = false;

        this._touchSpace.style.touchAction = "pan-up";

        /**
         * DOUBLE TAP
         */
        let waiting = false;

        this._mc.on('singletap', (ev) => {

            if (waiting) {

                if (this._zoomer.pos.scale > 1.01) {
                    this._zoomer.moveTo({
                        x: 0,
                        y: 0,
                        scale: 1
                    }, true);
                }
                else {
                    let clientRect = this._touchSpace.getBoundingClientRect();

                    this._zoomer.zoomToPoint({
                        x: ev.center.x - clientRect.left,
                        y: ev.center.y - clientRect.top
                    }, true);
                }

                waiting = false;
            }
            else {
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, 300);
            }
        });

        /**
         * PINCH
         */

        let pinchStartScale; // we need this, because sometimes hammer gives initial scale not 1, but sth like 4 or 5, god knows why

        this._mc.on('pinch pinchstart pinchend pinchin pinchout', (ev) => {

            if (this._blockPinchEvents) {
                return;
            }

            console.log('pinch', ev.type);

            switch(ev.type) {
                case 'pinchstart':
                    break;
                case 'pinchin':
                case 'pinchout':
                case 'pinchmove':
                    if (SESSION === 'pinch') {
                        this._zoomer.pinchmove({
                            x: ev.deltaX,
                            y: ev.deltaY,
                            scale: ev.scale / pinchStartScale
                        });
                    }
                    else {
                        SESSION = 'pinch';

                        let clientRect = this._touchSpace.getBoundingClientRect();

                        this._zoomer.pinchstart({
                            x: ev.center.x - clientRect.left,
                            y: ev.center.y - clientRect.top
                        });

                        pinchStartScale = ev.scale;
                    }
                    break;
                case 'pinchend':
                case 'pinchcancel':
                    this._zoomer.pinchend();
                    SESSION = null;
                    break;
                default:
                    break;
            }
        });


        /**
         * PAN
         */
        let isTouched = false;

        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };

        // At this point in time we manually subscribe to touch events to detect whether user is scrolling the window. If deltaY is big and deltaX is so small that panleft/panright wasn't triggered yet it means that we're scrolling vertically and swiping left/right should be blocked.
        let refClientY;
        let refClientX;

        let touchDetection = 0; // 0 - not detected, 1 - pinch, 2 - up / down, 3 - left / right

        this._blockPanEvents = true;
        this._blockPinchEvents = true;

        let preventDefault = (ev) => {
            if (touchDetection === 0 || touchDetection === 1 || touchDetection === 3 ) {
                ev.stopPropagation();
                ev.preventDefault();
            }
        };

        touchSpace.ontouchstart = (ev) => {
            // preventDefault(ev);

            touchDetection = 0;
            refClientY = ev.touches[0].clientY;
            refClientX = ev.touches[0].clientX;

            if (ev.touches.length === 1) {
                console.log('start of touching');
            }
            else {
                touchDetection = 1;
                this._blockPinchEvents = false;
                console.log('more than 1 touch -> PINCHING');
            }

            // this._blockPanEvents = true;
            // this._blockPinchEvents = true;
        };

        touchSpace.ontouchmove = (ev) => {
            preventDefault(ev);

            if (touchDetection === 0) {

                // Check if scrolling up / down
                if (Math.abs(ev.touches[0].clientY - refClientY) > 10) {
                    touchDetection = 2;
                    console.log('up / down -> SCROLLING')

                    // console.log('scrolling up / down!');
                    // isWindowScrolling = true;
                    this._mc.stop();
                }
                else if (Math.abs(ev.touches[0].clientX - refClientX) > 10) {
                    touchDetection = 3;

                    this._blockPanEvents = false;

                    console.log('left / right -> PANNING')
                }
            }

        };

        touchSpace.ontouchend = (ev) => {
            // preventDefault(ev);

            if (ev.touches.length === 0) {
                console.log('end of touching');
                touchDetection = 0;
                this._blockPanEvents = true;
                this._blockPinchEvents = true;
            }
        };

        touchSpace.ontouchcancel = (ev) => {
            // preventDefault(ev);

            if (ev.touches.length === 0) {
                touchDetection = 0;
                this._blockPanEvents = true;
                this._blockPinchEvents = true;
                console.log('end of touching');
            }
        };




        let panPreviousCenter;

        this._mc.on('panup pandown panleft panright panstart panend pancancel', (ev) => {

            console.log('PAN EVENT', ev.type, SESSION);

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            // if (ev.srcEvent.type == "pointercancel") {
            //     return;
            // }

            switch (ev.type) {
                case "panstart":
                    if (this._blockPanEvents) {
                        break;
                    }
                    break;

                case "panup":
                case "pandown":
                case "panleft":
                case "panright":
                    if (this._blockPanEvents) {
                        break;
                    }

                    if (SESSION === 'pan-swiper') {
                        this._touchSpaceController.panMove(ev.deltaX);
                    }
                    else if (SESSION === 'pan-zoomer') {

                        let panNewCenter = ev.center;

                        this._zoomer.moveTo({
                            x: this._zoomer.pos.x + (panNewCenter.x - panPreviousCenter.x),
                            y: this._zoomer.pos.y + (panNewCenter.y - panPreviousCenter.y),
                            scale: this._zoomer.pos.scale
                        });

                        panPreviousCenter = panNewCenter;
                    }
                    // Start new session!
                    else if (SESSION === null) {

                        if (
                            this._zoomer.pos.scale > 1 &&
                            !(ev.type === 'panleft' && this._zoomer.isAlignedToRight()) &&
                            !(ev.type === 'panright' && this._zoomer.isAlignedToLeft())
                        ) {
                            SESSION = 'pan-zoomer';

                            panPreviousCenter = ev.center;
                        }
                        else {

                            if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
                                // console.log('MC stop!!!');
                                // this._mc.stop(true); // no more events until new session
                                return;
                            }

                            SESSION = 'pan-swiper';
                            this._touchSpace.addEventListener('click', stopPropagationCallback, true);
                            this._touchSpaceController.panStart();
                        }
                    }
                    break;

                case "panend":
                case "pancancel":
                    if (this._blockPanEvents) {
                        break;
                    }

                    // this._blockPanEvents = false;

                    if (SESSION === 'pan-swiper') {
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        this._touchSpaceController.panEnd(-ev.velocityX);
                    }
                    else if (SESSION === 'pan-zoomer') {
                        this._zoomer.snap(true);
                    }

                    SESSION = null;
                    break;

                default:
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