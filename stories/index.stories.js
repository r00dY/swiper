import React from 'react';
import {storiesOf} from '@storybook/react';
import SimpleSwiperStorybookContainer from "./Helper/SimpleSwiperStorybookContainer";
import "./storybookSlider.scss";
import ReactFadeSwiper from "../presets/React/ReactFadeSwiper";
import ReactSwiperExternalTouchSpace from "./Helper/ReactSwiperExternalTouchSpace";
import ReactSimpleSwiper from "../presets/React/ReactSimpleSwiper";


storiesOf('Slider', module)
    .add('default', () =>
        <div className='ReactSlider__example'>
            <h1>Default slider</h1>
            <p>With arrows and pager set up. </p>
            <p>There are also slider params to edit, to see how it will look like.</p>
            <p>IMPORTANT!!! Params values are relative to each other.</p>
            <p>Slide size set up to 200 <b>DOES NOT</b> mean 200px. Container size is a point of reference.</p>
            <p>Also quite important fact is that every slide can have different width.</p>
            <SimpleSwiperStorybookContainer
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
    {})

storiesOf('Slider presets', module)
    .add('simple swiper', () =>
        <div className='ReactSlider__example'>
            <h1>Simple swiper</h1>
            <p>SimpleSwiper preset exemplary usage. All styles are included only in storybook. </p>
            <ReactSimpleSwiper
                containerClasses='swiper'
                slideSize={() => 200}
                rightOffset={() => 20}
                leftOffset={() => 20}
                slideSnapOffset={() => 30}
                slideMargin={() => 40}
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
    .add('slider with slides that fade', () =>
        <div className='ReactSlider__example'>
            <h1>Fade in slider</h1>
            <p>Touch swiper preset exemplary usage. All styles are included only in storybook. </p>
            <p>Logic behind this preset
                sets up slide opacity based on visibility calculated by slider library.</p>
                <ReactFadeSwiper
                    containerClasses='ReactTouchSwiper'
                    containerSize={() => 500}
                    slideSize={() => 500}
                    slideMargin={() => 10}
                    slideSnapOffset={() => 0}
                    leftOffset={() => 20}
                    rightOffset={() => 20}
                    infinite={true}
                  >
                    <div className='slideImageWrapper' style={{background: 'red'}}><a href="#">Link</a></div>
                    <div className='slideImageWrapper' style={{background: 'blue'}}><a href="#">Link1</a></div>
                    <div className='slideImageWrapper' style={{background: 'green'}}><a href="#">Link2</a></div>
                    <div className='slideImageWrapper' style={{background: 'yellow'}}><a href="#">Link3</a></div>
                    <div className='slideImageWrapper' style={{background: 'purple'}}><a href="#">Link4</a></div>
                    <div className='slideImageWrapper' style={{background: 'orange'}}><a href="#">Link5</a></div>
                </ReactFadeSwiper>
        </div>
    )
;