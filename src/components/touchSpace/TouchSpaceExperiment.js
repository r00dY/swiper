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

                let clientRect = this._touchSpace.getBoundingClientRect();

                let params = {
                    x: ev.center.x - clientRect.left,
                    y: ev.center.y - clientRect.top,
                };

                if (this._zoomer.getParams().scale > 1) {
                    this._zoomer.resetZoom();
                }
                else {
                    this._zoomer.movestart(Object.assign({}, params, { scale: 1 }));
                    this._zoomer.move(Object.assign({}, params, { scale: 3 }));
                    this._zoomer.moveend();
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
        this._mc.on('pinch pinchstart pinchend pinchin pinchout', (ev) => {

            // console.log('PINCH', ev.type, ev);

            let clientRect = this._touchSpace.getBoundingClientRect();

            // we need to normalize clientX / clientY
            let params = {
                x: ev.center.x - clientRect.left,
                y: ev.center.y - clientRect.top,
                scale: ev.scale
            };

            switch(ev.type) {
                case 'pinchstart':
                    SESSION = 'pinch';
                    this._zoomer.movestart(params);
                    break;
                case 'pinchin':
                case 'pinchout':
                case 'pinchmove':
                    this._zoomer.move(params);
                    break;
                case 'pinchend':
                case 'pinchcancel':
                    SESSION = null;
                    this._zoomer.moveend();
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

                    let zoomerParams = {
                        x: ev.deltaX,
                        y: ev.deltaY,
                        scale: 1
                    };

                    if (SESSION === 'pan-swiper') {
                        // In case of swiper mode, we want to stop gesture handling when it should be vertical browser scroll.
                        if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
                            this._mc.stop(true); // no more events until new session
                            SESSION = null;
                            return;
                        }
                        else {
                            this._touchSpaceController.panMove(ev.deltaX);
                        }
                    }
                    else if (SESSION === 'pan-zoomer') {
                        this._zoomer.move(zoomerParams);
                    }
                    // Start new session!
                    else if (SESSION === null) {
                        if (
                            this._zoomer.getParams().scale > 1 &&
                            !(ev.type === 'panleft' && this._zoomer.isAlignedToRight()) &&
                            !(ev.type === 'panright' && this._zoomer.isAlignedToLeft())
                        ) {
                            SESSION = 'pan-zoomer';

                            // if (this._zoomer)
                            if (ev.type === 'panleft' && this._zoomer.isAlignedToRight()) {
                                SESSION = 'pan-swiper';

                                this._touchSpace.addEventListener('click', stopPropagationCallback, true);
                                this._touchSpaceController.panStart();
                                break;
                            }

                            console.log('pan zoomer!');
                            this._zoomer.movestart(zoomerParams);
                        }
                        else {
                            SESSION = 'pan-swiper';
                            this._touchSpace.addEventListener('click', stopPropagationCallback, true);
                            this._touchSpaceController.panStart();
                        }
                    }

                    break;


                case "panend":
                case "pancancel":

                    if (SESSION === 'pan-swiper') {
                        setTimeout(() => {
                            touchSpace.removeEventListener('click', stopPropagationCallback, true);
                        }, 0);

                        this._touchSpaceController.panEnd(-ev.velocityX);
                    }
                    else if (SESSION === 'pan-zoomer') {
                        this._zoomer.moveend();
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