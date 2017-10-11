var SimpleSwiper = require('./SimpleSwiperNEW');
var AbstractSwiper = require('../AbstractSwiper');
import HammerGesturesProvider from './HammerGesturesProvider';
import AnimationsProvider from './AnimationsProvider';

export default class SwiperFactory {
    createSwiper(options) {

        this._options = {
            animation: {
                animationEase: Expo.easeOut,
                animationTime: 0.6,
                onStillChange: function() {},
            },
            gestures: {
                direction: AbstractSwiper.HORIZONTAL,
                freefloat: false,
                infinite: false,
                onPanStart: function() {},
                onPanEnd: function() {},
            },
            swiper: {
                autoLayoutOnResize: true,
                // slideSize: function() { throw "AbstractSwiper: undefined slideSize function!"; }, // function!

                name: undefined, // must be unique

                count: undefined,

                // containerSize: function() { throw "AbstractSwiper: undefined containerSize function!"; }, // relativeX is relatively to this size!!!
                // initMarginSize: function() { return 0; }, // function!
                slideMarginSize: function() { return 0; }, // function!
                snapOffset: function() { return 0; },

                // callbacks
                onMove: function() {},
                onPanEnd: function() {},
                onActiveSlidesChange: function() {},
                onSnapToEdgeChange: function() {},

                // miscellaneous
                numberOfItemsMovedAtOneAction: function() { return 1; },
                // numberOfActiveSlides: 1,
                // shouldShowSingleDot: false,

                counterTransformer: function(num) { return "" + num; },

                snapOnlyToAdjacentSlide: true,
            },
        };

        for (let key in options) {
            if (!options.hasOwnProperty(key)) { continue; }
            this._options[key] = options[key];
        }

        let animationsProvider = new AnimationsProvider(this._options.animation);

        let swiper = new SimpleSwiper(
            new HammerGesturesProvider(AbstractSwiper.getSelectorForComponent('touch-space', options.name), this._options.gestures, animationsProvider),
            animationsProvider,
            this._options.swiper,
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)),
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)).querySelector('.swiper-items')
        );

        return swiper.init();
    }
}
