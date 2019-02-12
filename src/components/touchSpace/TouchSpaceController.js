class TouchSpaceController {
    constructor(swiper, animated) {
        this.swiper = swiper;
        this.animated = animated;
    }

    panStart() {
        this._panStartPos = this.swiper.state.pos;
        this.swiper.stopMovement();
        this.swiper.touchdown();
    }

    panEnd(velocityX, animated) {
        this.swiper.touchup();

        if (Math.abs(velocityX) < 0.3 || velocityX === undefined) {
            this.swiper.snap(0, typeof animated !== "undefined" ? animated : this.animated);
        }
        else {
            this.swiper.snap(velocityX * 1000, typeof animated !== "undefined" ? animated : this.animated);
        }
    }

    panMove(deltaX) {
        this.swiper.moveTo(this._panStartPos - deltaX, false);
    }
}

export default TouchSpaceController;