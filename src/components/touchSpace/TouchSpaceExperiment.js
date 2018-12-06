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
        if (this._inited) {
            return;
        }
        this._inited = true;

        let touchSpace = this._touchSpace;

        this._mc = new Hammer.Manager(touchSpace);
        let tap = new Hammer.Tap({event: 'singletap', taps: 1, time: 500});
        let pan = new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        let pinch = new Hammer.Pinch();

        this._mc.add([tap]);
        // this._mc.add([tap, pan, pinch]);


        let SESSION = null; // "pinch" (zoomer), "pan-zoomer" (zoomer), "pan-swiper" (swiper)
        this._touchSpace.style.touchAction = "pan-y"; // for touchAction-compatible browsers

        let touchDetection = 0; // 0 - not detected, 1 - pinch, 2 - up / down, 3 - left / right


        let session = null;


        // At this point in time we manually subscribe to touch events to detect whether user is scrolling the window. If deltaY is big and deltaX is so small that panleft/panright wasn't triggered yet it means that we're scrolling vertically and swiping left/right should be blocked.




        let state = {
            type: "init"
        };

        let changeStateToInit = () => {
            console.log('change state to init');
            state = {
                type: "init"
            };
        };

        let changeStateToPinch = (touches) => {
            console.log('change state to pinch');
            state = {
                type: "pinch"
            };
        };

        let changeStateToSingleTouchInit = (touch) => {
            console.log('change state to single-touch-init', touch);
            state = {
                type: "single-touch-init",
                startPoint: {
                    x: touch.clientX,
                    y: touch.clientY
                }
            };
        };

        let changeStateToNativeScroll = () => {
            console.log('change state to native-scroll');
            state = {
                type: "native-scroll"
            }
        };

        let changeStateToPanSwiper = (startPoint) => {
            console.log('change state to pan-swiper', startPoint);
            state = {
                type: "pan-swiper",
                startPoint: Object.assign({}, startPoint),
                previousPoint: Object.assign({}, startPoint, { time: new Date().getTime() }),
                velocity: {
                    x: 0,
                    y: 0
                }
            };

            this._touchSpaceController.panStart();
        };

        let preventDefault = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
        };

        let processNewEvent = (ev) => {

            // console.log('new event', ev);

            switch(state.type) {
                case "init":
                    switch(ev.type) {
                        case "touchstart":

                            if (ev.touches.length === 1) {
                                changeStateToSingleTouchInit(ev.touches[0]);
                            }
                            else {
                                changeStateToPinch(ev.touches);
                            }
                            break;

                        // other events that touchstart are ignored in null state
                        default:
                            break;
                    }
                    break;

                case "single-touch-init":
                    switch(ev.type) {
                        case "touchstart":
                            changeStateToPinch(ev.touches);
                            break;
                        case "touchmove":
                            preventDefault(ev);

                            let touch = ev.touches[0];

                            if (Math.abs(touch.clientY - state.startPoint.y) > 10) {
                                changeStateToNativeScroll();
                            }
                            else if (Math.abs(touch.clientX - state.startPoint.x) > 10) {
                                changeStateToPanSwiper({
                                    x: touch.clientX,
                                    y: touch.clientY
                                });
                            }
                            break;
                        case "touchend":
                        case "touchcancel":

                            changeStateToInit();

                    }
                    break;

                case "native-scroll":
                    // do not prevent default, simply do nothing!

                    switch(ev.type) {
                        case "touchstart":
                            break;
                        case "touchmove":
                            break;
                        case "touchend":
                        case "touchcancel":
                            changeStateToInit();
                            break;
                    }

                    break;

                case "pinch":
                    preventDefault(ev);

                    switch(ev.type) {
                        case "touchstart":
                            // do nothing, keep pinching with old 2 fingers
                            break;

                        case "touchmove":
                            // keep pinching!
                            break;

                        case "touchend":
                        case "touchcancel":
                            if (ev.touches.length >= 2) {
                                // keep pinching!
                                break;
                            }
                            else if (ev.touches.length === 1) {
                                changeStateToSingleTouchInit(ev.touches[0]);
                            }
                            else {
                                changeStateToInit();
                            }
                            break;
                    }

                    break;

                case "pan-swiper":
                    preventDefault(ev);

                    switch(ev.type) {
                        case "touchstart":
                            // do nothing, keep moving with old touch
                            break;

                        case "touchmove":

                            this._touchSpaceController.panMove(ev.touches[0].clientX - state.startPoint.x);

                            state.velocity = {
                                x: (ev.touches[0].clientX - state.previousPoint.x) / (new Date().getTime() - state.previousPoint.time),
                                y: (ev.touches[0].clientY - state.previousPoint.y) / (new Date().getTime() - state.previousPoint.time)
                            };
                            state.previousPoint = {
                                x: ev.touches[0].clientX,
                                y: ev.touches[0].clientY,
                                time: new Date().getTime()
                            };

                            // keep pinching!
                            break;

                        case "touchend":
                        case "touchcancel":
                            if (ev.touches.length >= 1) {
                                // keep pinching! (always first touch)
                            }
                            else {
                                this._touchSpaceController.panEnd(-state.velocity.x);
                                changeStateToInit();
                            }
                            break;
                    }
                    break;

            }


        }

        touchSpace.ontouchstart = processNewEvent;
        touchSpace.ontouchmove = processNewEvent;
        touchSpace.ontouchend = processNewEvent;
        touchSpace.ontouchcancel = processNewEvent;





        //
        //
        // touchSpace.ontouchstart = (ev) => {
        //     /**
        //      * If one finger then we don't yet know which session, we just have single-finger session initialized.
        //      *
        //      * If more than one finger, it is obvious it's pinch zoom.
        //      */
        //     if (ev.touches.length === 1) {
        //         session = {
        //             type: "single-finger-init",
        //             ref: {
        //                 x: ev.touches[0].clientX,
        //                 y: ev.touches[0].clientY
        //             }
        //         };
        //     }
        //     else {
        //         session = {
        //             type: "pinch"
        //         };
        //     }
        //
        // };
        //
        // touchSpace.ontouchmove = (ev) => {
        //
        //     if (session.type === "pinch") {
        //         preventDefault(ev);
        //     }
        //     else if (session.type === "single-finger-init") {
        //         preventDefault(ev);
        //
        //         if (Math.abs(ev.touches[0].clientY - session.ref.y) > 10) {
        //             session = {
        //                 type: "native-scroll"
        //             };
        //
        //             console.log('go to native scroll!', session);
        //         }
        //         else if (Math.abs(ev.touches[0].clientX - session.ref.x) > 10) {
        //             session = {
        //                 type: "pan-swiper",
        //                 ref: Object.assign({}, session.ref),
        //                 previous: {
        //                     x: ev.touches[0].clientX,
        //                     y: ev.touches[0].clientY,
        //                     time: new Date().getTime()
        //                 },
        //                 velocity: {
        //                     x: 0,
        //                     y: 0
        //                 }
        //             };
        //
        //             console.log('go to panning!', session);
        //
        //             this._touchSpaceController.panStart();
        //         }
        //     }
        //     else if (session.type === "native-scroll") {
        //
        //     }
        //     else if (session.type === "pan-swiper") {
        //         preventDefault(ev);
        //
        //         this._touchSpaceController.panMove(ev.touches[0].clientX - session.ref.x);
        //         session.velocity = {
        //             x: (ev.touches[0].clientX - session.previous.x) / (new Date().getTime() - session.previous.time),
        //             y: (ev.touches[0].clientY - session.previous.y) / (new Date().getTime() - session.previous.time)
        //         };
        //         session.previous = {
        //             x: ev.touches[0].clientX,
        //             y: ev.touches[0].clientY,
        //             time: new Date().getTime()
        //         };
        //     }
        // };
        //
        // touchSpace.ontouchend = (ev) => {
        //     if (session.type === "pinch") {
        //
        //     }
        //     else if (session.type === "native-scroll") {
        //         session = null;
        //
        //     }
        //     else if (session.type === "pan-swiper") {
        //
        //         this._touchSpaceController.panEnd(-session.velocity.x);
        //
        //         session = null;
        //     }
        //
        //
        // };
        //
        // touchSpace.ontouchcancel = (ev) => {
        //     // preventDefault(ev);
        //
        //     if (session === "pinch") {
        //
        //     }
        //     else if (session === "native-scroll") {
        //         session = null;
        //
        //     }
        //     else if (session === "pan-swiper") {
        //         session = null;
        //
        //         this._touchSpaceController.panEnd();
        //     }
        // };


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

            switch (ev.type) {
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

        let stopPropagationCallback = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
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
        if (!this._inited) {
            return;
        }
        this._inited = false;

        if (this._mc) {
            this._mc.destroy();
        }
    }

}


export default TouchSpaceExperiment;