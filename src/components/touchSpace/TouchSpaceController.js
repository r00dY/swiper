class TouchSpaceController {
    constructor(swiper, animated) {
        this.swiper = swiper;
        this.animated = animated;
    }

    panStart() {
        this._panStartPos = this.swiper.pos;
        this.swiper.stopMovement();
        this.swiper.touchdown();
    }

    panEnd(velocityX) {
        this.swiper.touchup();

        if (Math.abs(velocityX) < 0.3 || velocityX === undefined) {
            this.swiper.snap(0, this.animated);
        }
        else {
            this.swiper.snap(velocityX * 1000, this.animated);
        }
    }

    panMove(deltaX) {
        this.swiper.moveTo(this._panStartPos - deltaX, false);
    }

    // swipe(velocityX) {
    //     this.swiper.snap(velocityX * 1000, this.animated);
    // }
}

export default TouchSpaceController;