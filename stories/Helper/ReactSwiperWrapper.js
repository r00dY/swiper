import React from "react";
import ReactSimpleSwiper from "../../ReactSimpleSwiper";
import "./ReactSwiperWrapper.scss"
import SwiperArrows from "../../SwiperArrows";
import SwiperPager from "../../SwiperPager";

class ReactSwiperWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.slider = React.createRef();

        this.arrowLeft = React.createRef();
        this.arrowRight = React.createRef();
        this.pagerItem = React.createRef();

    }

    goToSlide(n) {
        this.slider.current.moveToSlide(n -1);
    }

    componentDidMount() {
        this.arrows = new SwiperArrows(this.slider.current);
        this.arrows.init(this.arrowLeft.current, this.arrowRight.current);

        this.pager = new SwiperPager(this.slider.current);
        this.pager.init(this.pagerItem.current);
    }

    render() {
        return (
            <div>
                <ReactSimpleSwiper
                    enableTouch={true}
                    displayNoneAutomatically={this.props.displayNoneAutomatically}
                    name='swiper-1'
                    ref={this.slider}
                    slideSize={() => {
                        return 200;
                    }}

                    rightOffset={() => {
                        return 40;
                    }}

                    leftOffset={() => {
                        return 40;
                    }}

                    slideSnapOffset={() => {
                        return 20;
                    }}

                    slideMargin={() => {
                        return 40;
                    }}
                    snapOnlyToAdjacentSlide={true}
                    infinite={this.props.infinite}
                >
                    {this.props.slides}
                </ReactSimpleSwiper>

                <div className="pager">
                    <div className="swiper-pager-item" ref={this.pagerItem}>
                        <div className="pager-dot"></div>
                    </div>
                </div>

                <button className={"left"} ref={this.arrowLeft}>Click previous</button>
                <button className={"right"} ref={this.arrowRight}>Click next</button>

                <br />
                <button onClick={this.goToSlide.bind(this, 1)}>Go to first slide</button>
                <button onClick={this.goToSlide.bind(this, this.props.slides.length)}>Go to last slide</button>
            </div>
        )
    }
}

export default ReactSwiperWrapper;