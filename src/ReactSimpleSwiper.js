import React from "react";
import AbstractSwiper from "./AbstractSlider";

class ReactSimpleSwiper extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.wrapperRef = React.createRef();
        this.itemRefs = [];
        this.heights = [];

        for(let i = 0; i < props.children.length; i++) {
            this.itemRefs.push(React.createRef());
            this.heights.push(0);
        }
    }

    _positionElements() {
        for (let n = 0; n < this.props.children.length; n++) {
            let item = this.itemRefs[n].current;

            item.style["position"] = "absolute";
            item.style["width"] = this.swiper.state.slides[n].size + 'px';
            item.style["display"] = "block";
        }

        // we read height after we set all widths to have 1 reflow instead of n
        let maxHeight = 0;

        for (let n = 0; n < this.props.children.length; n++) {
            let item = this.itemRefs[n].current;
            maxHeight = Math.max(item.offsetHeight, maxHeight);
        }

        this.wrapperRef.current.style.height = maxHeight + 'px';
    }

    _onMove() {
        for (let i = 0; i < this.props.children.length; i++) {
            this.itemRefs[i].current.style.transform = `translate3d(${this.swiper.state.slides[i].coord}px, 0px, 0px)`;
        }
    }

    componentDidMount() {
        // We must initialize AbstractSwiper after layout is done so that we have container width!

        let config = Object.assign({}, this.props.config, {
            count: this.props.children.length,
            containerSize: () => this.containerRef.current.clientWidth
        });

        this.swiper = new AbstractSwiper(config);

        this.swiper.addEventListener('move', () => {
            console.log('on move');
            this._onMove();
        });

        this._positionElements();
        this._onMove();
    }

    render() {
        return (<div ref={this.containerRef}>
            <div ref={this.wrapperRef} style={{position: "relative"}}>
                { this.props.children.map((item, index) => {
                    return <div ref={this.itemRefs[index]}>{ item }</div>
                })}
            </div>
        </div>)
    }
}

export default ReactSimpleSwiper;