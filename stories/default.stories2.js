import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.css";

import SimpleSlider from "../src/SimpleSlider";
import SwiperArrows from "../src/components/arrows/SwiperArrows";
import SwiperPager from "../src/components/pager/SwiperPager";

class SimpleSwiperWithParams extends React.Component {
    constructor(props) {
        super(props);

        this.simpleSliderNodeRef = React.createRef();
        this.arrowLeft = React.createRef();
        this.arrowRight = React.createRef();
        this.pagerItem = React.createRef();

        this.state = {
            slideSize: 200,
            slideMargin: 20,
            slideSnapOffset: 20,
            rightOffset: 40,
            leftOffset: 20,
            displayNoneAutomatically: false,
            snapOnlyToAdjacentSlide: false,
            infinite: true,
            disableInternalTouchSpace: false,
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

    _setSliderParamsBasedOnState() {
        this.slider.slideSizeFunction = () => this.state.slideSize;
        this.slider.slideMarginFunction = () => this.state.slideMargin;
        this.slider.slideSnapOffsetFunction = () => this.state.slideSnapOffset;
        this.slider.rightOffsetFunction = () => this.state.rightOffset;
        this.slider.leftOffsetFunction = () => this.state.leftOffset;
        this.slider.displayNoneAutomatically = this.state.displayNoneAutomatically;
        this.slider.snapOnlyToAdjacentSlide = this.state.snapOnlyToAdjacentSlide
        this.slider.infinite = this.slider.infinite;

        if (this.state.disableInternalTouchSpace) {
            this.slider.touchSpace.disable();
        } else {
            this.slider.touchSpace.enable();
        }
    }

    componentDidUpdate() {
        this._setSliderParamsBasedOnState();
        this.slider.layout();
    }

    componentDidMount() {
        this.slider = new SimpleSlider(this.simpleSliderNodeRef.current);

        this.slider.addEventListener('visibleSlidesChange', () => {
            console.log('visible slides changed', this.slider.visibleSlides());
        });

        this.slider.addEventListener('activeSlidesChange', () => {
            console.log('active slides changed', this.slider.activeSlides());
        });

        this._setSliderParamsBasedOnState();

        this.slider.layout();

        this.arrows = new SwiperArrows(this.slider, this.arrowLeft.current, this.arrowRight.current);
        this.pager = new SwiperPager(this.slider, this.pagerItem.current);

        this.arrows.enable();
        this.pager.enable();
    }

    render() {
        return (
            <div>

                <div ref={this.simpleSliderNodeRef} className={"swiper"}>
                    <div>
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
                    </div>
                </div>

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