export default class DimensionsCalculator {
    constructor(slideSizeCallback, slideMarginSizeCallback, isInfinite) {
        this.slideSizeCallback = slideSizeCallback;
        this.slideMarginSizeCallback = slideMarginSizeCallback;
        this.isInfinite = isInfinite;
    }

    getSlideableWidth(slidesAmount) {
        let result = 0;
        for (let i = 0; i < slidesAmount; i++) { // get full _width and _snapPoints

            result += this.slideSizeCallback(i);

            if (i == slidesAmount - 1 && !this.isInfinite) { break; } // total slideable width can't include right margin of last element unless we are at infinite scrolling!

            result += this.slideMarginSizeCallback(i);
        }

        return result;
    }

    getSlideInitPos(slide) {
        let result = 0;
        for (var i = 0; i < slide; i++) { // get full _width and _snapPoints
            result += this.slideSizeCallback(i);
            result += this.slideMarginSizeCallback(i);
        }

        return result;
    }

    getMaxPos(containerSize, slidesAmount) {
        return Math.max(0, this.getSlideableWidth(slidesAmount) - containerSize);
    }

    getSlideSnapPos(slide, containerSize, slidesAmount) {
        if (this.isInfinite) { return this.getSlideInitPos(slide); } // in case of infinite, snap position is always slide position

        return Math.min(this.getSlideInitPos(slide), this.getMaxPos(containerSize, slidesAmount));
    }
}
