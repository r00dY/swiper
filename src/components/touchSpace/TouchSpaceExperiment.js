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
        let pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 10 });
        let pinch = new Hammer.Pinch();

        this._mc.add([tap, pan, pinch]);

        let SESSION = null; // "pinch" (zoomer), "pan-zoomer" (zoomer), "pan-swiper" (swiper)

        this._blockPanAndSwipeEvents = false;
        let waiting = false;

        /**
         * DOUBLE TAP
         */
        this._mc.on('singletap', (ev) => {

            if (waiting) {

                if (this._zoomer.pos.scale > 1.01) {
                    this._zoomer.moveTo({
                        x: 0,
                        y: 0,
                        scale: 1
                    }, true, true);
                }
                else {
                    let clientRect = this._touchSpace.getBoundingClientRect();

                    this._zoomer.zoomToPoint({
                        x: ev.center.x - clientRect.left,
                        y: ev.center.y - clientRect.top
                    }, false);
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

                    // Scale snapping must be here first. Otherwise, calculations below would give wrong coordinates.
                    // let fun = (x) => 0.05 * Math.log(1 + x * 10);

                    // if (fullScale > 5) {
                    //     let rest = fullScale - 5;
                    //     fullScale = 5 + fun(rest);
                    //
                    // } else if (fullScale < 1) {
                    //     let rest = 1 - fullScale;
                    //     fullScale = 1 - fun(rest);
                    // }

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

                    // Here, fullScale might be even 10 or 20.
                    // If we grab point in top-right corner, center goes far to left and bottom.
                    // Then, scale is "trimmed" by snap function but in reference to CENTER!
                    // "snapping scale" needs reference, based on reference, it might snap to different coords.

                    // maybe moveTo should have reference point? Wouldn't that solve many problems?

                    // right now zoomer has no memory, has just moveTo (moving center point).
                    // there's no concept of "Session" and memory. Aaaand, well, that's wrong.
                    // because of above-mentioned arguments, snapping might behave differently for
                    // totally the same coordinates. That's why only POINT from moveTo is not enough.
                    // we need to have some access to history and session.

                    // we should get back to moveStart, move and moveEnd.

                    // there might be stateless moveTo for panning.

                    // Photoswipe works great:
                    // - non-linearities are not existent in pinching session. Session finish with END OF SNAP.
                    // - new pinching session is allowed even if previous is snapping. That's because of consistent non-linearities.
                    // - new panning session is allowed after pinching snap finishes!

                    // Snapping during pinch-zooming is actually a nightmare.
                    // So many cases when you start pinching not on the image, or when you pinch+pinchmove.
                    // It's very hard to find an intuitive solution for users.
                    // Sometimes it looks nice but to be honest... in some edge cases is totally illogical.
                    // PhotoSwipe solution with disabling XY non-linearities (only scale) is really slick.
                    // Most users don't pinch+pinchmove anyway.
                    // Most users pinch on photo fragment. It always work with this approach perfectly and with little to no code.





                    // So API should be really 1:1 to gestures available.
                    // It's not simple and generic but only one that seems to be reasonable at this point.
                    // Please document above problems

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
                            this._zoomer.getPos().scale > 1 &&
                            !(ev.type === 'panleft' && this._zoomer.isAlignedToRight()) &&
                            !(ev.type === 'panright' && this._zoomer.isAlignedToLeft())
                        ) {
                            SESSION = 'pan-zoomer';

                            panPreviousCenter = ev.center;
                            // panStartPos = Object.assign({}, this._zoomer.getPos());
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
                        this._zoomer.snap(false);
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