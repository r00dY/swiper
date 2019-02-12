import React from "react";
import { default as VanillaSliderAbsolute } from "../vanilla/SliderAbsolute";

class SliderAbsolute extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        this.vanillaSlider = new VanillaSliderAbsolute(this.containerRef.current, this.props.config);
        this.vanillaSlider.layout();
        this.engine = this.vanillaSlider.engine;
        this.touchSpace = this.vanillaSlider.touchSpace;
    }

    render() {
        return <div ref={this.containerRef}>
            <div>
                { this.props.children }
            </div>
        </div>;
    }
}

export default SliderAbsolute;