import React from "react";
import ReactSimpleSwiper from "../../presets/React/ReactSimpleSwiper";
import SwiperArrows from "../../SwiperArrows";
import SwiperPager from "../../SwiperPager";

class SimpleSwiperWithParamsEdition extends React.Component {
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
            displayNoneAutomatically: true,
            snapOnlyToAdjacentSlide: true,
            infinite: true,
            enableTouch: true,
            activeSlides: []
        }
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
        this.slider.current.layout();
        this.arrows.deinit();
        this.pager.deinit();
        this.setUpArrowsAndPager();
    }

    componentDidMount() {
        this.slider.current.layout();
        this.setUpArrowsAndPager();
    }

    setUpArrowsAndPager() {
        this.arrows = new SwiperArrows(this.slider.current);
        this.arrows.init(this.arrowLeft.current, this.arrowRight.current);

        this.pager = new SwiperPager(this.slider.current);
        this.pager.init(this.pagerItem.current);
    }

    onVisibleSlidesChange() {
        console.log('visible slides changed', this.slider.current.visibleSlides());
    }

    onActiveSlidesChange() {
        console.log('active slides changed', this.slider.current.activeSlides());
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    containerClasses='swiper'
                    enableTouch={this.state.enableTouch}
                    displayNoneAutomatically={this.state.displayNoneAutomatically}
                    ref={this.slider}
                    slideSize={() => this.state.slideSize}
                    rightOffset={() => this.state.rightOffset}
                    leftOffset={() => this.state.leftOffset}
                    slideSnapOffset={() => this.state.slideSnapOffset}
                    slideMargin={() => this.state.slideMargin}
                    snapOnlyToAdjacentSlide={this.state.snapOnlyToAdjacentSlide}
                    infinite={this.state.infinite}
                    onActiveSlidesChange={this.onActiveSlidesChange.bind(this)}
                    onVisibleSlidesChange={this.onVisibleSlidesChange.bind(this)}
                >
                    {this.props.slides}
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
                    <p>Enable touch</p>
                    <input type='checkbox' onChange={(e) => this.handleCheckbox(e, 'enableTouch')} checked={this.state.enableTouch} />
                </div>
            </div>
        )
    }
}

export default SimpleSwiperWithParamsEdition;