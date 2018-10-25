import React from 'react';
import {storiesOf} from '@storybook/react';
import SimpleSwiperWithParamsEdition from "./Helper/SimpleSwiperWithParamsEdition";
import "./storybookSlider.scss";
import ReactSwiperExternalTouchSpace from "./Helper/ReactSwiperExternalTouchSpace";
import ReactSimpleSwiper from "../presets/React/ReactSimpleSwiper";
import SimpleSwiperWithDynamicSlides from "./Helper/SimpleSwiperWithDynamicSlides";
import ReactFadeSwiper from "../presets/React/ReactFadeSwiper";
import SimpleSwiperContainer from "./Helper/SimpleSwiperContainer";
import FadeSwiperContainer from "./Helper/FadeSwiperContainer";


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
            <p>Also some exemplary "onMove" listener connected to this slider.</p>
            <SimpleSwiperContainer slideSize={(n) => 200 + 50 * n} />
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
            <SimpleSwiperContainer slideSize={() => 500}/>
        </div>
    )
    .add('fade swiper', () =>
        <div>
            <h1>Fade in swiper preset.</h1>
            <p>Touch swiper preset exemplary usage. All styles are included only in storybook. </p>
            <FadeSwiperContainer />
        </div>
    )
;