import React from 'react';
import {storiesOf} from '@storybook/react';
import ReactSliderWrapper from "./Helper/ReactSliderWrapper";
import "./storybookSlider.scss";

storiesOf('Slider', module)
    .add('default', () =>
        <ReactSliderWrapper
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
    )
    .add('infinite', () =>
        <ReactSliderWrapper
            slides={[
                <div className="slide"><img src="http://via.placeholder.com/150x150" /></div>,
                <div className="slide"><img src="http://via.placeholder.com/150x150" /></div>,
                <div className="slide"><p>Some text to select it</p></div>,
                <div className="slide"><p>Some text to select it</p></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>,
                <div className="slide"></div>
            ]}
            infinite={true}
        />
    )
    .add('slides with link on each slide', () =>
        <ReactSliderWrapper
            slides={[
                <div class="slide"><a href="#">Link</a><h1>1</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>2</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>3</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>4</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>5</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>6</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>7</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>8</h1></div>,
                <div class="slide"><a href="#">Link</a><h1>9</h1></div>,
            ]}
        />
    )
    .add('infinite with displayNoneAutomatically = false', () =>
        <ReactSliderWrapper
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
            displayNoneAutomatically={false}
        />
    )