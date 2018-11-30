import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.scss";

import ReactSimpleSwiper from "../src/react/ReactSimpleSwiper";
import SwiperArrows from "../src/components/arrows/SwiperArrows";
import SwiperPager from "../src/components/pager/SwiperPager";

class SimpleSwiperWithParams extends React.Component {
    constructor(props) {
        super(props);

        this.slider = React.createRef();
        this.arrowLeft = React.createRef();
        this.arrowRight = React.createRef();
        this.pagerItem = React.createRef();

        this.state = {
            slideSize: 200,
            rightOffset: 40,
            leftOffset: 20,
            slideSnapOffset: 20,
            slideMargin: 20,
            displayNoneAutomatically: false,
            snapOnlyToAdjacentSlide: false,
            infinite: true,
            disableInternalTouchSpace: false,
            activeSlides: []
        };
    };

    handleStateChange(e, param) {
        this.setState({
            [param]: parseInt(e.target.value),
        })
    }

    handleCheckbox(e, param) {
        this.setState({
            [param]: e.target.checked,
        })
    }

    componentDidUpdate() {
        this.slider.current.slider.layout();
    }

    componentDidMount() {
        /**
         * This method unfortunately must be called externally.
         *
         * The reason is that if ReactSimpleSwiper calls this method INTERNALLY (in componentDidMount / componentDidUpdate), events are triggered.
         *
         * The event listeners are in parent (which controls slider) and parent might react on them. However, parent will need swiper instance to do this. and the swiper insance is not yet available because parent ref is not available yet.
         *
         */
        this.slider.current.slider.layout();

        this.arrows = new SwiperArrows(this.slider.current.slider, this.arrowLeft.current, this.arrowRight.current);
        this.pager = new SwiperPager(this.slider.current.slider, this.pagerItem.current);

        this.arrows.enable();
        this.pager.enable();
    }

    onVisibleSlidesChange() {
        console.log('visible slides changed', this.slider.current.slider.visibleSlides());
    }

    onActiveSlidesChange() {
        console.log('active slides changed', this.slider.current.slider.activeSlides());
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    className={'swiper'}
                    disableInternalTouchSpace={this.state.disableInternalTouchSpace}
                    displayNoneAutomatically={this.state.displayNoneAutomatically}
                    ref={this.slider}
                    slideSize={() => this.state.slideSize}
                    rightOffset={() => this.state.rightOffset}
                    leftOffset={() => this.state.leftOffset}
                    slideSnapOffset={() => this.state.slideSnapOffset}
                    slideMargin={() => this.state.slideMargin}
                    snapOnlyToAdjacentSlide={this.state.snapOnlyToAdjacentSlide}
                    infinite={this.state.infinite}
                    onVisibleSlidesChange={this.onVisibleSlidesChange.bind(this)}
                    onActiveSlidesChange={this.onActiveSlidesChange.bind(this)}
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

                <div className="pager">
                    <div className="swiper-pager-item" ref={this.pagerItem}>
                        <div className="pager-dot"></div>
                    </div>
                </div>

                <div className='buttonsContainer'>
                    <button className={"left"} ref={this.arrowLeft}>Click previous</button>
                    <button className={"right"} ref={this.arrowRight}>Click next</button>
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Slide size</p>
                    <input type="number" onChange={(e) => this.handleStateChange(e, 'slideSize')} value={this.state.slideSize} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Right offset</p>
                    <input type="number" onChange={(e) => this.handleStateChange(e, 'rightOffset')} value={this.state.rightOffset} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Left offset</p>
                    <input type="number" onChange={(e) => this.handleStateChange(e, 'leftOffset')} value={this.state.leftOffset} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Slide snap offset</p>
                    <input type="number" onChange={(e) => this.handleStateChange(e, 'slideSnapOffset')} value={this.state.slideSnapOffset} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Slide margin</p>
                    <input type="number" onChange={(e) => this.handleStateChange(e, 'slideMargin')} value={this.state.slideMargin} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Infinite</p>
                    <input type='checkbox' onChange={(e) => this.handleCheckbox(e, 'infinite')} checked={this.state.infinite} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Display none automatically</p>
                    <input type='checkbox' onChange={(e) => this.handleCheckbox(e, 'displayNoneAutomatically')} checked={this.state.displayNoneAutomatically} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Snap only to adjacent slide</p>
                    <input type='checkbox' onChange={(e) => this.handleCheckbox(e, 'snapOnlyToAdjacentSlide')} checked={this.state.snapOnlyToAdjacentSlide} />
                </div>

                <div className='ReactSlider__paramSetter'>
                    <p>Disable internal touch space</p>
                    <input type='checkbox' onChange={(e) => this.handleCheckbox(e, 'disableInternalTouchSpace')} checked={this.state.disableInternalTouchSpace} />
                </div>
            </div>
        )
    }
}

storiesOf('Slider', module)
    .add('default', () =>
        <div className='ReactSlider__example'>
            <h1>Default slider</h1>
            <p>With arrows and pager set up. </p>
            <p>There are also slider params to edit, to see how it will look like.</p>
            <p>IMPORTANT!!! Params values are relative to each other.</p>
            <p>Slide size set up to 200 <b>DOES NOT</b> mean 200px. Container size is a point of reference.</p>
            <p>Also quite important fact is that every slide can have different width.</p>

            <SimpleSwiperWithParams />
        </div>
    );