import React from "react";
import ReactFadeSwiper from "../../src/react/ReactFadeSwiper";


class FadeSwiperContainer extends React.Component {
    constructor(props) {
        super(props);
        this.slider = React.createRef();
    }

    componentDidMount() {
        this.slider.current.layout();
    }

    render() {
        return (
            <ReactFadeSwiper
                containerClasses='ReactTouchSwiper'
                containerSize={() => 500}
                slideSize={() => 500}
                rightOffset={() => 100}
                leftOffset={() => 50}
                slideSnapOffset={() => 50}
                slideMargin={() => 20}
                infinite={true}
                ref={this.slider}
            >
                <div className='slideImageWrapper' style={{background: 'red'}}><a href="#">Link</a></div>
                <div className='slideImageWrapper' style={{background: 'blue'}}><a href="#">Link1</a></div>
                <div className='slideImageWrapper' style={{background: 'green'}}><a href="#">Link2</a></div>
                <div className='slideImageWrapper' style={{background: 'yellow'}}><a href="#">Link3</a></div>
                <div className='slideImageWrapper' style={{background: 'purple'}}><a href="#">Link4</a></div>
                <div className='slideImageWrapper' style={{background: 'orange'}}><a href="#">Link5</a></div>
            </ReactFadeSwiper>
        );
    }
}


export default FadeSwiperContainer;
