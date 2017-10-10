var SimpleSwiper = require('./SimpleSwiperNEW');
var AbstractSwiper = require('../AbstractSwiper');
import HammerGesturesProvider from './HammerGesturesProvider';

export default class SwiperFactory {
    createSwiper(options) {
        let gesturesProvider = new HammerGesturesProvider();

        let swiper = new SimpleSwiper(
            gesturesProvider,
            options,
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)),
            document.querySelector(AbstractSwiper.getSelectorForComponent('container', options.name)).querySelector('.swiper-items')
        );

        return swiper.init();
    }
}
