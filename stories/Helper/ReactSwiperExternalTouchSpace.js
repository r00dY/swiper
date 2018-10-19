import React from "react";
import SimpleSwiper from "../../SimpleSwiper";


class ReactSwiperExternalTouchSpace extends React.Component {

    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.touchSpace = React.createRef();

        this.state = {
            slideSize: 200,
            rightOffset: 40,
            leftOffset: 20,
            slideSnapOffset: 20,
            slideMargin: 20,
            displayNoneAutomatically: true,
            snapOnlyToAdjacentSlide: true,
            infinite: true
        }
    }

    componentDidUpdate() {
        this.slider.layout();
    }

    componentDidMount() {
        this.layoutSlider();
    }

    layoutSlider() {
        this.slider = new SimpleSwiper(
            this.touchSpace.current,
            this.container.current
        );

        this.slider._initialSlide = this.props.initialSlide;

        this.slider.slideSizeFunction = () => this.state.slideSize;

        this.slider.rightOffsetFunction = () => this.state.rightOffset;

        this.slider.leftOffsetFunction = () => this.state.leftOffset;

        this.slider.slideSnapOffsetFunction = () => this.state.slideSnapOffset;

        this.slider.slideMarginFunction = () => this.state.slideMargin;

        this.slider.snapOnlyToAdjacentSlide = () => this.state.snapOnlyToAdjacentSlide;

        this.slider.displayNoneAutomatically = this.state.displayNoneAutomatically;

        this.slider.infinite = this.state.infinite;

        this.slider.layout();

        this.slider.enableTouch();

        this.count = this.props.slides.length
    }

    handleStateChange(e, param) {
        this.setState({
            [param]: parseInt(e.target.value)
        })
    }

    handleCheckbox(e, param) {
        this.setState({
            [param]: e.target.checked
        })
    }

    render() {
        return (
            <div className='SwiperWithExternalTouchSpace'>
                <div className='swiper' ref={this.container}>
                    <div>
                        {this.props.slides}
                    </div>
                </div>
                <div className='swiperArea' style={{width: '50%', height: '200px', cursor: 'pointer', background: 'pink', marginTop: '40px'}} ref={this.touchSpace}>
                    <div>SWIPE HERE</div>
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
            </div>
        );
    }
}

export default ReactSwiperExternalTouchSpace;