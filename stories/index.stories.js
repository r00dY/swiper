import React from 'react';
import {storiesOf} from '@storybook/react';
import SimpleSwiperWithParamsEdition from "./Helper/SimpleSwiperWithParamsEdition";
import "./storybookSlider.scss";
import ReactSwiperExternalTouchSpace from "./Helper/ReactSwiperExternalTouchSpace";
import ReactSimpleSwiper from "../presets/React/ReactSimpleSwiper";
import SimpleSwiperWithDynamicSlides from "./Helper/SimpleSwiperWithDynamicSlides";


storiesOf('Slider', module)
    .add('default', () =>
        <div className='ReactSlider__example'>
            <h1>Default slider</h1>
            <p>With arrows and pager set up. </p>
            <p>There are also slider params to edit, to see how it will look like.</p>
            <p>IMPORTANT!!! Params values are relative to each other.</p>
            <p>Slide size set up to 200 <b>DOES NOT</b> mean 200px. Container size is a point of reference.</p>
            <p>Also quite important fact is that every slide can have different width.</p>

            <SimpleSwiperWithParamsEdition
                slides={[
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>
                ]}
            />
        </div>
    )
    .add('slider with touch space in different place', () =>
        <div className='ReactSlider__example'>
            <h1>Slider with touch space in different place</h1>
            <p>Swipe pink area to swipe slides</p>
            <ReactSwiperExternalTouchSpace
                slides={[
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"><a href="#">Link</a></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>,
                    <div className="slide"></div>
                ]}
            />
        </div>
    )
    .add('slider with different slides width', () =>
        <div className='ReactSlider__example'>
            <h1>Swiper with different slide widths.</h1>
            <p>For presentation purpose every n slide has width of 200 + 50 * n ( starting from 0, of course ) </p>
            <ReactSimpleSwiper
                containerClasses='swiper'
                slideSize={(n) => 200 + 50 * n}
                rightOffset={() => 20}
                leftOffset={() => 20}
                slideSnapOffset={() => 20}
                slideMargin={() => 20}
                infinite={true}
            >
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
            </ReactSimpleSwiper>
        </div>
    )
    .add('slider with adding dynamic slides', () =>
        <div>
            <h1>Click the button</h1>
            <p>Slides will be added to the end of a queue.</p>
            <SimpleSwiperWithDynamicSlides slides={[
                <div className="slide"><a href="#">Link</a></div>,
                <div className="slide"><a href="#">Link</a></div>,
                <div className="slide"><a href="#">Link</a></div>,
                <div className="slide"><a href="#">Link</a></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>
            ]} />
        </div>
    )

storiesOf('Slider presets', module)
    .add('simple swiper', () =>
        <div className='ReactSlider__example'>
            <h1>Simple swiper</h1>
            <p>SimpleSwiper preset exemplary usage. All styles are included only in storybook. </p>
            <ReactSimpleSwiper
                containerClasses='swiper'
                slideSize={() => 500}
                rightOffset={() => 100}
                leftOffset={() => 50}
                slideSnapOffset={() => 50}
                slideMargin={() => 20}
                infinite={false}
            >
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"><a href="#">Link</a></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
            </ReactSimpleSwiper>
        </div>
    )
;