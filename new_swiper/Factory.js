var SimpleSwiper = require('./SimpleSwiperNEW');
var AbstractSwiper = require('./AbstractSwiperNEW');

import GesturesProvider from './GesturesProvider';

export default class SwiperFactory {
    createSwiper(options) {

        let swiper = new SimpleSwiper(
            options,
            new GesturesProvider({}, document.querySelector(AbstractSwiper.getSelectorForComponent('touch-space', options.name))),
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)),
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)).querySelector('.swiper-items')
        );

        return swiper.init();
    }
}
