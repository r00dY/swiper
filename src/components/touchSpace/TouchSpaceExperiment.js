import TouchSpaceController from "./TouchSpaceController";

/**
 * TODO: nice animation of snapToPoint
 * TODO: animation of velocity
 *
 *
 * TODO: swipe + swipe (in same place) is interpreted as tap. We should detect touch down and touch up place.
 * TODO: prevent link clicking (stopPropagation in previous version)
 * TODO: tap / double tap gesture for snap to point
 * TODO: iOS blocking of scroll.
 * TODO: Android touch-action (will prevent native browser actions to fire).
 * TODO: RAF optimisation
 * TODO: mouse events
 * TODO: mouse+touch screens
 */

function isiOS() {
    let userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
}

class TouchSpaceExperiment {

    constructor(swiper, touchSpace) {
        this.swiper = swiper;

        this._touchSpaceController = new TouchSpaceController(this.swiper, true);
        this._touchSpace = touchSpace;

        this._inited = false;

        this._applyStyles();
    }

    set zoomer(zoomer) {
        this._zoomer = zoomer;
    }

    _applyStyles() {

        this._touchSpace.style.userSelect = 'none';
        this._touchSpace.style.msUserSelect = 'none';
        this._touchSpace.style.mozUserSelect = 'none';
        this._touchSpace.style.webkitUserSelect = 'none';

        this._touchSpace.style.webkitTapHighlightColor = 'transparent';
    }

    enable() {
        if (this._inited) {
            return;
        }
        this._inited = true;

        let touchSpace = this._touchSpace;

        let state = null;
        let sessionType = null;

        let changeStateToInit = () => {
            // console.log('change state to init');
            state = {
                type: "init"
            };

            unblockClick();

            let touchAction;

            if (isiOS()) {
                touchAction = "auto";
            }
            else { // touch-action compatible browser

                touchAction = "pan-y";
                if (this._zoomer.pos.scale > 1.05) {
                    if (this._zoomer.isAlignedToTop()) {
                        touchAction = "pan-up";
                    }
                    else if (this._zoomer.isAlignedToBottom()) {
                        touchAction = "pan-down";
                    }
                    else {
                        touchAction = "none";
                    }
                }
            }

            this._touchSpace.style.touchAction = touchAction;

            sessionType = null;
        };

        let calculateCenterFrom2Touches = (touch1, touch2) => {
            return {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
        };

        let calculateDeltasBetween2Points = (point1, point2) => {
            return {
                x: point1.x - point2.x,
                y: point1.y - point2.y
            };
        };

        let calculateDistanceBetween2Touches = (touch1, touch2) => {
            return Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
        };

        let changeStateToPinch = (touch1, touch2) => {
            // console.log('change state to pinch');
            state = {
                type: "pinch",
                startTouch1: touch1,
                startTouch2: touch2
            };

            let clientRect = this._touchSpace.getBoundingClientRect();

            let center = calculateCenterFrom2Touches(touch1, touch2);

            blockClick();

            this._zoomer.pinchstart({
                x: center.x - clientRect.left,
                y: center.y - clientRect.top
            });
        };

        let preventDefaultReal = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
        };

        let blockClick = () => {
            this._touchSpace.addEventListener('click', preventDefaultReal, true);
        };

        let unblockClick = () => {
            setTimeout(() => {
                this._touchSpace.removeEventListener('click', preventDefaultReal, true);
            }, 0);
        };

        let changeStateToSingleTouchInit = (touch) => {
            // console.log('change state to single-touch-init', touch);
            state = {
                type: "single-touch-init",
                startPoint: {
                    x: touch.clientX,
                    y: touch.clientY
                }
            };
        };

        let changeStateToNativeScroll = () => {
            // console.log('change state to native-scroll');
            state = {
                type: "native-scroll"
            }
        };

        // Helper for pan management (for pinch and swipe).
        let initPanState = (touch) => {
            let startPoint = {
                x: touch.clientX,
                y: touch.clientY,
                time: new Date().getTime()
            };

            blockClick();

            return {
                startPoint: startPoint,
                identifier: touch.identifier,
                previousPoint: Object.assign({}, startPoint),
                velocity: {
                    x: 0,
                    y: 0
                }
            };
        };

        let updatePanStateOnMove = (state, touch) => {
            state.velocity = {
                x: (touch.clientX - state.previousPoint.x) / (new Date().getTime() - state.previousPoint.time),
                y: (touch.clientY - state.previousPoint.y) / (new Date().getTime() - state.previousPoint.time)
            };
            state.previousPoint = {
                x: touch.clientX,
                y: touch.clientY,
                time: new Date().getTime()
            };
        };

        let changeStateToPanSwiper = (touch) => {
            state = initPanState(touch);
            state.type = "pan-swiper";
            this._touchSpaceController.panStart();
        };

        let changeStateToPanZoomer = (touch) => {
            state = initPanState(touch);
            state.type = "pan-zoomer";
        };

        /**
         * iOS preventDefault behaviour of touchmove event
         *
         * Well, this is interesting.
         *
         * Browser have some latency before it decides that given touch session is scroll up / scroll down.
         * During this time, couple of touchmove events might be triggered. And now:
         *
         * a) when we call preventDefault() BEFORE browser decided it should scroll, it will give up scrolling at all during entire touch session.
         * b) when we call preventDefault() AFTER browser decided it should scroll, it won't change anything. Browser will scroll anyway.
         *
         * Sometimes very quick movement might cause that with first touchmove browser already know it's scrolling -> then calling preventDefault() will never prevent browser scroll - no matter how hard you try.
         * That's why you might encounter "sometimes works, sometimes not" behaviour with calling event.preventDefault() on every touchmove.
         *
         * It turns out behaviour is the same on Android. There's a event.cancelable which tells whether preventDeault makes sense or not. In Chrome there's even an error in console when you call preventDefault on cancelable=false event.
         *
         * TODO: bug with no gestures recognized on touchSpace after some global scrolling (it might be because of losing focus because of iframe + Storybook)
         */

        let preventDefault = (ev) => {
            ev.realEv.stopPropagation();
            ev.realEv.preventDefault();
        };

        let findTouchWithIdentifier = (ev, identifier) => {
            for (let i = 0; i < ev.touches.length; i++) {
                if (ev.touches[i].identifier === identifier) {
                    return ev.touches[i];
                }
            }
            return null;
        };


        /**
         * Events batching by requestAnimationFrame
         */

        let actionsQueue = [];

        let onFrame = () => {
            // if (actionsQueue.length > 0) {
            //     console.log('ref', actionsQueue.length);
            // }

            actionsQueue.forEach((action) => {
                action();
            });

            actionsQueue = [];

            requestAnimationFrame(onFrame);
        };

        requestAnimationFrame(onFrame);



        /**
         * STATE MACHINE BABY <3!
         */

        let processTouchEvent = (ev) => {

            // console.log('process new event!', sessionType, ev.type);

            switch (state.type) {
                case "init":
                    switch (ev.type) {
                        case "touchstart":
                            if (ev.touches.length === 1) {
                                changeStateToSingleTouchInit(ev.touches[0]);
                            }
                            else {
                                changeStateToPinch(ev.touches[0], ev.touches[1]);
                            }
                            break;
                        // other events that touchstart are ignored in null state
                        default:
                            break;
                    }
                    break;

                case "native-scroll":
                    // do not prevent default, simply do nothing!

                    switch (ev.type) {
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

                case "single-touch-init":
                    switch (ev.type) {
                        case "touchstart":
                            changeStateToPinch(ev.touches[0], ev.touches[1]);
                            break;
                        case "touchmove":
                            if (ev.cancelable === false) {
                                changeStateToNativeScroll();
                                break;
                            }

                            let touch = ev.touches[0];

                            let delta = {
                                y: touch.clientY - state.startPoint.y,
                                x: touch.clientX - state.startPoint.x
                            };

                            // Break if delta is small
                            if (Math.abs(delta.x) < 10 && Math.abs(delta.y) < 10) {
                                break;
                            }

                            // If delta is bigger, for sure we need to make SOME movement (native scroll or swiper or pan or whatever).
                            let direction;

                            if (delta.x > 10) {
                                direction = "right";
                            }
                            else if (delta.x < -10) {
                                direction = "left";
                            }
                            else if (delta.y > 10) {
                                direction = "down";
                            }
                            else if (delta.y < -10) {
                                direction = "up";
                            }


                            if (this._zoomer.pos.scale > 1.05) {

                                // pan right
                                if (direction === "right") {
                                    if (this._zoomer.isAlignedToLeft()) {
                                        changeStateToPanSwiper(touch);
                                        preventDefault(ev);
                                    } else {
                                        changeStateToPanZoomer(touch);
                                        preventDefault(ev);
                                    }
                                }

                                // pan left
                                else if (direction === "left") {
                                    if (this._zoomer.isAlignedToRight()) {
                                        changeStateToPanSwiper(touch);
                                        preventDefault(ev);
                                    } else {
                                        changeStateToPanZoomer(touch);
                                        preventDefault(ev);
                                    }
                                }

                                // pan down
                                else if (direction === "down") {

                                    if (this._zoomer.isAlignedToTop()) {
                                        break;
                                    } else {
                                        changeStateToPanZoomer(touch);
                                        preventDefault(ev);
                                    }
                                }

                                // pan up
                                else if (direction === "up") {
                                    if (this._zoomer.isAlignedToBottom()) {
                                        break;
                                    } else {
                                        changeStateToPanZoomer(touch);
                                        preventDefault(ev);
                                    }
                                }

                            }
                            else {

                                if (direction === "left" || direction === "right") {
                                    changeStateToPanSwiper(touch);
                                    preventDefault(ev);
                                }
                                else {
                                    break;
                                }

                            }

                            break;

                        case "touchend":
                        case "touchcancel":
                            changeStateToInit();

                    }
                    break;


                case "pinch":
                    preventDefault(ev);

                    switch (ev.type) {
                        case "touchstart":
                            // do nothing, keep pinching with old 2 fingers
                            break;

                        case "touchmove":

                            let touch1 = findTouchWithIdentifier(ev, state.startTouch1.identifier);
                            let touch2 = findTouchWithIdentifier(ev, state.startTouch2.identifier);

                            let deltas = calculateDeltasBetween2Points(
                                calculateCenterFrom2Touches(touch1, touch2),
                                calculateCenterFrom2Touches(state.startTouch1, state.startTouch2)
                            );

                            deltas.scale = Math.abs(calculateDistanceBetween2Touches(touch1, touch2) / calculateDistanceBetween2Touches(state.startTouch1, state.startTouch2));

                            actionsQueue.push(() => {
                                this._zoomer.pinchmove(deltas);
                            });

                            // keep pinching!
                            break;

                        case "touchend":
                        case "touchcancel":
                            if (ev.touches.length >= 2) {

                                let touch1 = findTouchWithIdentifier(ev, state.startTouch1.identifier);
                                let touch2 = findTouchWithIdentifier(ev, state.startTouch2.identifier);

                                if (touch1 === null || touch2 === null) { // some of old touches got lost :(

                                    actionsQueue.push(() => {
                                        this._zoomer.pinchend();
                                    });

                                    changeStateToPinch(ev.touches[0], ev.touches[1]); // let's take new points
                                    break;
                                }
                                else {
                                    // keep pinching
                                }
                                break;
                            }
                            else if (ev.touches.length === 1) {

                                actionsQueue.push(() => {
                                    this._zoomer.pinchend();
                                });
                                changeStateToInit();
                                // changeStateToPanSwiper(ev.touches[0]); - giving this up, after total pinch out sometimes caused swipe.
                            }
                            else {
                                actionsQueue.push(() => {
                                    this._zoomer.pinchend();
                                });
                                changeStateToInit();
                            }
                            break;
                    }

                    break;

                case "pan-swiper":
                    preventDefault(ev, true);

                    switch (ev.type) {
                        case "touchstart":
                            break;

                        case "touchmove":
                            if (ev.cancelable === false) {
                                changeStateToNativeScroll();
                                break;
                            }
                            preventDefault(ev);

                            let touch = findTouchWithIdentifier(ev, state.identifier);

                            updatePanStateOnMove(state, touch);

                            let deltaX = touch.clientX - state.startPoint.x;

                            actionsQueue.push(() => {
                                this._touchSpaceController.panMove(deltaX);
                            });

                            break;

                        case "touchend":
                        case "touchcancel":

                            if (ev.touches.length >= 1) {

                                // If old touch exists
                                if (findTouchWithIdentifier(ev, state.identifier) === null) {

                                    actionsQueue.push(() => {
                                        this._touchSpaceController.panEnd(0);
                                    });

                                    changeStateToPanSwiper(ev.touches[0]); // let's take new touch
                                }
                                break;
                            }
                            else {

                                let velocity = -state.velocity.x;
                                actionsQueue.push(() => {
                                    this._touchSpaceController.panEnd(velocity);
                                });

                                changeStateToInit();
                            }
                            break;
                    }
                    break;


                case "pan-zoomer":
                    preventDefault(ev, true);

                    switch (ev.type) {
                        case "touchstart":
                            break;

                        case "touchmove":
                            if (ev.cancelable === false) {
                                changeStateToNativeScroll();
                                break;
                            }
                            preventDefault(ev);

                            let touch = findTouchWithIdentifier(ev, state.identifier);

                            let pos = {
                                x: this._zoomer.pos.x + (touch.clientX - state.previousPoint.x),
                                y: this._zoomer.pos.y + (touch.clientY - state.previousPoint.y),
                                scale: this._zoomer.pos.scale
                            };

                            actionsQueue.push(() => {
                                this._zoomer.moveTo(pos);
                            });

                            updatePanStateOnMove(state, touch);
                            break;

                        case "touchend":
                        case "touchcancel":
                            if (ev.touches.length >= 1) {
                                if (findTouchWithIdentifier(ev, state.identifier) === null) {
                                    changeStateToPanZoomer(ev.touches[0]); // let's take new touch
                                }
                                break;
                            }
                            else {

                                actionsQueue.push(() => {
                                    this._zoomer.snap(true);
                                });
                                changeStateToInit();
                            }
                            break;
                    }
                    break;
            }
        };

        changeStateToInit();

        // tap detector
        let tap;

        tap = {
            state: null,

            touches: [],

            changeStateToInit: () => {
                console.log('tap init');

                clearTimeout(tap.timeout);

                tap.state = {
                    type: "init"
                };

                tap.touches = [];

            },

            changeStateToTouch: (touch) => {
                clearTimeout(tap.timeout);

                console.log('tap touch', tap.touches.length + 1);

                tap.touches.push({
                    touch: touch,
                    time: new Date().getTime()
                });

                tap.state = {
                    type: "touch",
                }
            },

            changeStateToWaiting: () => {
                console.log('tap waiting');

                tap.state = {
                    type: "waiting",
                    time: new Date().getTime()
                };

                tap.timeout = setTimeout(() => {
                    console.log('timeout!');
                    tap.changeStateToInit()
                }, 300);

            }

        };

        let TAP_MAX_DISTANCE = 50;
        let TAP_MAX_INTERVAL = 300;

        let processTapEvent = (ev) => {

            switch(tap.state.type) {
                case "init":

                    switch (ev.type) {
                        case "touchstart":
                            if (ev.touches.length === 1) {
                                tap.changeStateToTouch(ev.touches[0])
                            }
                            break;
                    }
                    break;

                case "touch":

                    switch(ev.type) {
                        case "touchstart":
                            tap.changeStateToInit();
                            break;
                        case "touchmove": // we can't move between touches!
                            tap.changeStateToInit();
                            break;

                        case "touchend":
                            let touchDown = tap.touches[tap.touches.length - 1];
                            let time = new Date().getTime();

                            if (time - touchDown.time < TAP_MAX_INTERVAL) {
                                if (tap.touches.length === 2) { // double tap detected!
                                    tap.changeStateToInit();

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
                                            x: touchDown.touch.clientX - clientRect.left,
                                            y: touchDown.touch.clientY - clientRect.top
                                        }, true);
                                    }
                                }
                                else {
                                    tap.changeStateToWaiting();
                                }
                            }
                            else {
                                tap.changeStateToInit();
                            }
                            break;

                        case "touchcancel":
                            tap.changeStateToInit();
                            break;
                    }

                case "waiting":

                    switch(ev.type) {
                        case "touchstart":
                            let time = new Date().getTime();
                            let previousTouch = tap.touches[tap.touches.length - 1];
                            let touch = ev.touches[0];

                            let timeDiff = time - tap.state.time;
                            let distance = calculateDistanceBetween2Touches(touch, previousTouch.touch);

                            if (timeDiff < TAP_MAX_INTERVAL && distance < TAP_MAX_DISTANCE) {
                                tap.changeStateToTouch(touch);
                            }
                            else {
                                tap.changeStateToInit();
                                tap.changeStateToTouch(touch);
                            }
                            break;
                        default:
                            break;
                    }

                default:
                    break;
            }

        };

        tap.changeStateToInit();

        let blockMouseEvents = false;

        let pointerId = null; // id of currently down pointer (for mouse we just take "mouse").

        let processPointerEvent = (ev, type) => { // type: "pointer" or "mouse"
            if (blockMouseEvents) {
                return;
            }

            // if (sessionType !== null && sessionType !== type) { return; } // return if different kind of session already started

            let evPointerId = type + (type === "pointer" ? ev.pointerId : "");
            if (pointerId !== null && pointerId !== evPointerId) { return; } // return if different pointer

            sessionType = type;

            let fakeEvent = {
                touches: [
                    {
                        identifier: evPointerId,
                        clientX: ev.clientX,
                        clientY: ev.clientY
                    }
                ],
                realEv: ev
            };

            switch(ev.type) {
                case `${type}down`:
                    fakeEvent.type = 'touchstart';
                    break;
                case `${type}up`:
                    fakeEvent.type = 'touchend';
                    break;
                case `${type}move`:
                    fakeEvent.type = 'touchmove';
                    break;
                case `${type}cancel`:
                    fakeEvent.type = 'touchcancel';
                    break;
                default:
                    break;
            }

            if (pointerId === null && ev.type === `${type}down`) {
                pointerId = evPointerId;
                processTouchEvent(fakeEvent);
                processTapEvent(fakeEvent);
            }
            else if (pointerId !== null && (ev.type === `${type}up` || ev.type === `${type}cancel`)) {
                pointerId = null;
                fakeEvent.touches = [];
                processTouchEvent(fakeEvent);
                processTapEvent(fakeEvent);
            }

            if (ev.type === `${type}move` && pointerId !== null) {
                processTouchEvent(fakeEvent);
                processTapEvent(fakeEvent);
            }
        };

        let timer;

        let touchEventHandler = (ev) => {

            clearTimeout(timer);

            if (ev.touches.length === 0) {
                timer = setTimeout(() => {
                    blockMouseEvents = false;
                }, 1000);

            } else {
                blockMouseEvents = true;
            }
            ev.realEv = ev;
            processTouchEvent(ev);
            processTapEvent(ev);
        };

        touchSpace.addEventListener('touchstart', touchEventHandler);
        touchSpace.addEventListener('touchmove', touchEventHandler);
        touchSpace.addEventListener('touchend', touchEventHandler);
        touchSpace.addEventListener('touchcancel', touchEventHandler);

        let mouseEventHandler = (ev) => { processPointerEvent(ev, "mouse"); };
        touchSpace.addEventListener('mousedown', mouseEventHandler);
        touchSpace.addEventListener('mousemove', mouseEventHandler);
        touchSpace.addEventListener('mouseup', mouseEventHandler);
        window.addEventListener('mousemove', mouseEventHandler);
        window.addEventListener('mouseup', mouseEventHandler);

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