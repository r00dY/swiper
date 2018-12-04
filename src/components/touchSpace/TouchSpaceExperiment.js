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

    set zoomer(zoomer) {
        this._zoomer = zoomer;

    }

    enable() {
        if (this._inited) { return; }
        this._inited = true;

        let touchSpace = this._touchSpace;


        this._mc = new Hammer.Manager(touchSpace);
        let tap = new Hammer.Tap({ event: 'singletap', taps: 1, time: 500 });
        let pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 10 });
        let pinch = new Hammer.Pinch();

        this._mc.add([tap, pan, pinch]);

        let SESSION = null; // pan / pinch

        this._blockPanAndSwipeEvents = false;
        let waiting = false;

        /**
         * DOUBLE TAP
         */
        this._mc.on('singletap', (ev) => {

            if (waiting) {

                if (this._zoomer.getPos().scale > 1.01) {
                    this._zoomer.moveTo({
                        x: 0,
                        y: 0,
                        scale: 1
                    }, true, true);

                }
                else {
                    let clientRect = this._touchSpace.getBoundingClientRect();

                    this._zoomer.moveTo({
                        x: -(ev.center.x - (clientRect.left + clientRect.width / 2)) * 3,
                        y: -(ev.center.y - (clientRect.top + clientRect.height / 2)) * 3,
                        scale: 3
                    }, true, true);
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

        let pinchStartEv, pinchStartPos; // we need this, because sometimes hammer gives initial scale not 1, but sth like 4 or 5, god knows why

        this._mc.on('pinch pinchstart pinchend pinchin pinchout', (ev) => {

            switch(ev.type) {
                case 'pinchstart':
                    SESSION = 'pinch';
                    pinchStartEv = ev;
                    pinchStartPos = Object.assign({}, this._zoomer.getPos());
                    break;
                case 'pinchin':
                case 'pinchout':
                case 'pinchmove':
                    if (SESSION !== 'pinch') { break; }

                    let touchSpaceRect = this._touchSpace.getBoundingClientRect();

                    let relativeScale = ev.scale / pinchStartEv.scale;
                    let fullScale = pinchStartPos.scale * relativeScale;

                    // Coords of touch point (no matter which zoom/translation we have). It's just touch point coords relative to touch space.
                    let touchPointCoords = {
                        x: pinchStartEv.center.x - (touchSpaceRect.left + touchSpaceRect.width / 2),
                        y: pinchStartEv.center.y - (touchSpaceRect.top + touchSpaceRect.height / 2)
                    };

                    // Normalized zoom point coordinates (when scale = 1, x = 0 and y = 0). No matter the position.
                    let zoomPointCoordsNormalized = {
                        x: (touchPointCoords.x - pinchStartPos.x) / pinchStartPos.scale,
                        y: (touchPointCoords.y - pinchStartPos.y) / pinchStartPos.scale
                    };

                    let newPos = {
                        x: -zoomPointCoordsNormalized.x * fullScale + touchPointCoords.x + ev.deltaX,
                        y: -zoomPointCoordsNormalized.y * fullScale + touchPointCoords.y + ev.deltaY,
                        scale: fullScale
                    };

                    this._zoomer.moveTo(newPos);
                    break;
                case 'pinchend':
                case 'pinchcancel':
                    this._zoomer.snap();
                    SESSION = null;
                    this._blockPanAndSwipeEvents = true;
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
        // let refScreenY;
        // let refClientY;
        //
        // let isWindowScrolling;
        //
        // touchSpace.ontouchstart = (ev) => {
        //     isWindowScrolling = false;
        //     refScreenY = ev.touches[0].screenY;
        //     refClientY = ev.touches[0].clientY;
        // };
        //
        // touchSpace.ontouchmove = (ev) => {
        //     if (isWindowScrolling) { return; }
        //
        //     if (Math.abs(ev.touches[0].clientY - refClientY) > 10 || Math.abs(ev.touches[0].screenY - refScreenY) > 10) {
        //         isWindowScrolling = true;
        //     }
        // };

        let panStartPos;

        this._mc.on('panup pandown panleft panright panstart panend pancancel', (ev) => {

            console.log('PAN EVENT', ev.type, SESSION);

            // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
            // https://github.com/hammerjs/hammer.js/issues/1050
            // if (ev.srcEvent.type == "pointercancel") {
            //     return;
            // }

            switch (ev.type) {
                case "panstart":
                    if (this._blockPanAndSwipeEvents) {
                        break;
                    }
                    break;

                case "panup":
                case "pandown":
                case "panleft":
                case "panright":
                    if (this._blockPanAndSwipeEvents) {
                        break;
                    }

                    if (SESSION === 'pan-swiper') {
                        this._touchSpaceController.panMove(ev.deltaX);
                    }
                    else if (SESSION === 'pan-zoomer') {
                        this._zoomer.moveTo({
                            x: panStartPos.x + ev.deltaX,
                            y: panStartPos.y + ev.deltaY,
                            scale: panStartPos.scale
                        });
                    }
                    // Start new session!
                    else if (SESSION === null) {

                        if (
                            this._zoomer.getPos().scale > 1 &&
                            !(ev.type === 'panleft' && this._zoomer.isAlignedToRight()) &&
                            !(ev.type === 'panright' && this._zoomer.isAlignedToLeft())
                        ) {
                            SESSION = 'pan-zoomer';

                            panStartPos = Object.assign({}, this._zoomer.getPos());
                        }
                        else {

                            if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
                                console.log('MC stop!!!');
                                this._mc.stop(true); // no more events until new session
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

                    this._blockPanAndSwipeEvents = false;

                    if (SESSION === 'pan-swiper') {
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        this._touchSpaceController.panEnd(-ev.velocityX);
                    }
                    else if (SESSION === 'pan-zoomer') {
                        this._zoomer.snap();
                        // this._zoomer.moveend();
                    }

                    SESSION = null;
                    break;

                default:
                    break;
            }



                    // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
                    // However, if we gave up returning when _isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
                    // if (!isTouched) {
                    //
                    //     console.log('force stop!');
                    //     // this works with pan-y :-)
                    //     this._mc.stop(true);
                    //
                    //     return;
                    // }
            //
            //     case "panleft":
            //     case "panright":
            //         if (this._blockPanAndSwipeEvents) { break; }
            //
            //
            //
            //
            //
            //         if (SESSION === 'pinch') { break; }
            //
            //         if (!isTouched) {
            //             // If wasn't already detected and window is scrolling then break
            //             // if (isWindowScrolling) { break; }
            //
            //             isTouched = true;
            //
            //             touchSpace.addEventListener('click', stopPropagationCallback, true); // we must add 3rd parameter as 'true' to get this event during capture phase. Otherwise, clicks inside the slider will be triggered before they get to stopPropagtionCallback
            //
            //             this._touchSpaceController.panStart();
            //         }
            //
            //         if (isTouched) {
            //             this._touchSpaceController.panMove(delta);
            //         }
            //
            //         break;
            //
            //     case "panend":
            //     case "pancancel":
            //         this._blockPanAndSwipeEvents = false;
            //
            //         if (SESSION === 'pinch') { break; }
            //
            //         if (isTouched) {
            //
            //             // Remove panning class when we're not touching slider
            //             setTimeout(() => {
            //                 touchSpace.removeEventListener('click', stopPropagationCallback, true);
            //             }, 0);
            //
            //             isTouched = false;
            //
            //             this._touchSpaceController.panEnd(-ev.velocityX);
            //         }
            //         break;
            // }
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