# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2018-07-26
### Changed
- total redo of API. Broke backwards compatibility completely. Read docs.
- sparation to SwiperEngine, AbstractSwiper and SimpleSwiper

## [0.2.3] - 2017-08-29
### Changed
- added 'snapOffset' option. 'containerSize' is now applicable for SimpleSwiper.

## [0.2.2] - 2017-08-28
### Changed
- added 'infinite' option. Works bad when total slides width is less than container width.

## [0.2.1] - 2017-08-18
### Changed
- added getSlidesOrientations() method to distingiush if slide is on the left or on the right. Sometimes animations are not symmetric!


## [0.2.0] - 2017-08-03
### Changed
- elements inside slider are positioned as relative instead of absolute. This means that .swiper-container doesn't have to have height defined. Highest slide will define height. This also means that slide doesn't get automatically height: 100%;
