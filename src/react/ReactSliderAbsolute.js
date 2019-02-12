import React from "react";
import SliderAbsolute from "../vanilla/SliderAbsolute";

class ReactSliderAbsolute extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        this.vanillaSlider = new SliderAbsolute(this.containerRef.current, this.props.config);
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

export default ReactSliderAbsolute;