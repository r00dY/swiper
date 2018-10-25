const Hammer = typeof window !== 'undefined' ? require('hammerjs') : undefined;

class HammerGestureListener {
    constructor(touchSpace) {
        this._mc = new Hammer(touchSpace, { domEvents: false });
        this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
        this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
    }

    on(eventName, callback) {
        this._mc.on(eventName, (ev) => {
            if (ev.srcEvent.type == "pointercancel") {
                return;
            }
            callback(ev);
        });
    }

    blockScrolling() {
        if (this._mc) {
            this._mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
            this._mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
        }
    }

    unblockScrolling() {
        if (this._mc) {
            this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL});
            this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL});
        }
    }

    destroy() {
        this._mc.destroy();
    }
}

export default HammerGestureListener;