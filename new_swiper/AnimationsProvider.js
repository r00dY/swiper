
export default class AnimationsProvider {
    constructor(options) {
        this._animations = [];

        /** options = {animationTime, onStillChange, animationEase}*/
        this._options = options;
    }

    killAnimations() {
        for (let i = 0; i < this._animations.length; i++) {
            this._animations[i].kill();
        }
        this._animations = [];
    }

    moveTo(gesturesProvider, pos, updateCallback) {
        this.setStill(gesturesProvider, false);
        let _this = this;

        let anim1 = TweenMax.to({pos: pos}, this._options.animationTime, {
            pos: pos,
            ease: this._options.animationEase,
            onUpdate: updateCallback,
            onComplete: function() {
                _this._animations = [];
                _this.setStill(gesturesProvider, true);
            }
        });

        this._animations = [anim1];
    }

    setStill(gesturesProvider, status) {
        if (status == this._isStill) { return; }
        this._isStill = status;

        if (this._isStill) {
            gesturesProvider.unblockScrolling();
        }
        else {
            gesturesProvider.blockScrolling();
        }

        // this._options.onStillChange(this._isStill);
    }
}
