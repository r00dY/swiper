let Hammer = require("hammerjs");

let VerticalScrollDetector = require("./VerticalScrollDetector.js");

let AbstractSwiper2 = require("./AbstractSwiper2");


class SimpleSwiper2 extends AbstractSwiper2 {

    constructor(name) {
        super(name);

        this._container = document.querySelector(this._getSelectorForComponent('container'));
        this._containerInner = this._container.querySelector('.swiper-items');
        this._items = this._containerInner.children;
    }

    layout() {
        this.containerSize = this._container.offsetWidth;
        this.count = this._items.length;
        this.slideSizeFunction = this.slideSizeFunction;

        super.layout();

        // Reset heights
        this._heights = [];
        for(let i = 0; i < this._items.length; i++) {
            this._heights.push(0);
        }

        this._positionElements();
        this._onMove();

        this.addEventListener('move', () => {
            this._onMove();
        });
    }

    _onMove() {

        let oldHeight = Math.max.apply(this, this._heights);

        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];

            let coord = this._swiper.slideCoord(i);

            if (!this._swiper.isSlideVisible(i)) {
                item.style.display = 'none';
                this._heights[i] = 0;
            } else {
                item.style.display = 'block';
                item.style.transform = 'translate3d(' + coord + 'px, 0px, 0px)';

                if (this._heights[i] == 0) { this._heights[i] = item.offsetHeight; }
            }
        }

        let newHeight = Math.max.apply(this, this._heights);
        if (newHeight != oldHeight) {
            this._containerInner.style.height = newHeight + 'px';
        }
    }

    _positionElements() {
        this._containerInner.style["position"] = "relative";

        for (let n = 0; n < this._items.length; n++) {
            let item = this._items[n];

            item.style["position"] = "absolute";
            item.style["width"] = this._swiper.slideSize(n) + 'px';
        }
    }
}


//
// class SimpleSwiper2 {
//
//     constructor(name) {
//         this._name = name;
//
//         this._container = document.querySelector(this._getSelectorForComponent('container'));
//         this._containerInner = this._container.querySelector('.swiper-items');
//         this._items = this._containerInner.children;
//     }
//
//     layout() {
//         this._swiper = new NewSwiper();
//         this._swiper.containerSize = this._container.offsetWidth;
//         this._swiper.count = this._items.length;
//         this._swiper.slideSizeFunction = this.slideSizeFunction;
//
//         if (typeof this.slideMarginFunction !== "undefined") { this._swiper.slideMarginFunction = this.slideMarginFunction; }
//         if (typeof this.slideSnapOffsetFunction !== "undefined") { this._swiper.slideSnapOffsetFunction = this.slideSnapOffsetFunction; }
//         if (typeof this.leftOffset !== "undefined") { this._swiper.leftOffset = this.leftOffset; }
//         if (typeof this.rightOffset !== "undefined") { this._swiper.rightOffset = this.rightOffset; }
//         if (typeof this.overscrollFunction !== "undefined") { this._swiper.overscrollFunction = this.overscrollFunction; }
//         if (typeof this.infinite !== "undefined") { this._swiper.infinite = this.infinite; }
//         if (typeof this.overscrollFunction !== "undefined") { this._swiper.overscrollFunction = this.overscrollFunction; }
//         if (typeof this.animationEase !== "undefined") { this._swiper.animationEase = this.animationEase; }
//         if (typeof this.animationTime !== "undefined") { this._swiper.animationTime = this.animationTime; }
//         if (typeof this.snapOnlyToAdjacentSlide !== "undefined") { this._swiper.snapOnlyToAdjacentSlide = this.snapOnlyToAdjacentSlide; }
//
//         this._swiper.init();
//
//         // Reset heights
//         this._heights = [];
//         for(let i = 0; i < this._items.length; i++) {
//             this._heights.push(0);
//         }
//
//         this._positionElements();
//         this._onMove();
//
//         this._swiper.addEventListener('move', () => {
//             // console.log('move');
//             this._onMove();
//         });
//     }
//
//     enableTouch() {
//         if (this._enabled) { return; }
//         this._enabled = true;
//
//         this._mc = new Hammer(document.querySelector(this._getSelectorForComponent('touch-space')), { domEvents: false });
//         this._mc.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
//         this._mc.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 20});
//
//         let swiped = false;
//
//         this._mc.on("pan panup pandown panleft panright panstart panend swipe swipeleft swiperight swipeup swipedown", (ev) => {
//
//             // Prevents weird Chrome bug (Android chrome too) with incorrect pan events showing up.
//             // https://github.com/hammerjs/hammer.js/issues/1050
//             if (ev.srcEvent.type == "pointercancel") {
//                 return;
//             }
//
//             let delta = ev.deltaX;
//
//             switch (ev.type) {
//                 case "swipeleft":
//                 case "swipeup":
//
//                     if (this._isTouched) {
//                         this._swiper.snap(Math.abs(ev.velocityX) * 1000, true);
//                         swiped = true;
//                     }
//
//                     break;
//
//                 case "swiperight":
//                 case "swipedown":
//
//                     if (this._isTouched) {
//                         this._swiper.snap(-Math.abs(ev.velocityX) * 1000, true);
//                         swiped = true;
//                     }
//
//                     break;
//
//                 case "panstart":
//                     break;
//
//                 case "panup":
//                 case "pandown":
//                     // this is important! When panning is in progress, we should enable panup pandown to avoid "jumping" of slider when sliding more vertically than horizontally.
//                     // However, if we gave up returning when _this._isTouched is false, Android would too eagerly start "panning" instead of waiting for scroll.
//                     if (!this._isTouched) {
//                         return;
//                     }
//
//                 case "panleft":
//                 case "panright":
//                     if (VerticalScrollDetector.isScrolling()) { break; } // if body is scrolling then not allow for horizontal movement
//
//                     if (!this._isTouched) {
//
//                         document.querySelector(this._getSelectorForComponent('touch-space')).classList.add('panning'); // adds 'panning' class which prevents links from being clicked.
//
//                         // Events onPanStart
//                         // _this._invokeListeners('touchdown');
//
//                         this._isTouched = true;
//                         swiped = false;
//
//                         this._swiper.stopMovement();
//                         this._panStartPos = this._swiper.pos;
//                     }
//
//                     if (this._isTouched && !swiped) {
//                         this._swiper.moveTo(this._panStartPos - delta, false);
//                     }
//
//                     break;
//
//                 case "panend":
//
//                     if (this._isTouched) {
//
//                         // Remove panning class when we're not touching slider
//                         setTimeout(() => {
//                             document.querySelector(this._getSelectorForComponent('touch-space')).classList.remove('panning');
//                         }, 0);
//
//                         // Events touchup.
//                         // _this._invokeListeners('touchup'); // new way
//
//                         this._isTouched = false;
//
//                         if (!swiped) {
//                             this._swiper.snap(0, true);
//                         }
//
//                         swiped = false;
//                     }
//                     break;
//             }
//         });
//
//     }
//
//     _onMove() {
//
//         let oldHeight = Math.max.apply(this, this._heights);
//
//         for (let i = 0; i < this._items.length; i++) {
//             let item = this._items[i];
//
//             let coord = this._swiper.slideCoord(i);
//
//             if (!this._swiper.isSlideVisible(i)) {
//                 item.style.display = 'none';
//                 this._heights[i] = 0;
//             } else {
//                 item.style.display = 'block';
//                 item.style.transform = 'translate3d(' + coord + 'px, 0px, 0px)';
//
//                 if (this._heights[i] == 0) { this._heights[i] = item.offsetHeight; }
//             }
//         }
//
//         let newHeight = Math.max.apply(this, this._heights);
//         if (newHeight != oldHeight) {
//             this._containerInner.style.height = newHeight + 'px';
//         }
//     }
//
//     _getSelectorForComponent(component) {
//         return '.swiper-' + component + '[data-swiper="' + this._name + '"]';
//     }
//
//     _positionElements() {
//         this._containerInner.style["position"] = "relative";
//
//         for (let n = 0; n < this._items.length; n++) {
//             let item = this._items[n];
//
//             item.style["position"] = "absolute";
//             item.style["width"] = this._swiper.slideSize(n) + 'px';
//         }
//     }
//
//
// }


module.exports = SimpleSwiper2;