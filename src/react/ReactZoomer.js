import React from "react";
import AbstractZoomer from "../AbstractZoomer";

class ReactZoomer extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.itemRef = React.createRef();

        this.state = {
            x: 0,
            y: 0,
            scale: 1
        };

        this.zoomer = new AbstractZoomer();

        this.zoomer.addEventListener('move', (coords) => {
            this.setState({
                x: coords.x,
                y: coords.y,
                scale: coords.scale
            });
        });
    }

    componentDidMount() {
        this.zoomer.containerSize = {
            width: this.containerRef.current.clientWidth,
            height: this.containerRef.current.clientHeight
        };

        this.zoomer.itemSize = {
            width: this.containerRef.current.clientWidth,
            height: this.containerRef.current.clientHeight
        };
    }

    render() {
        return <div
            className={this.props.className}
            style={this.props.style}
        >
            <div
                style={{
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    overflow: "hidden"
                }}
                ref={this.containerRef}
            >
                <div ref={this.itemRef} style={{
                    transform: `translateX(${this.state.x}px) translateY(${this.state.y}px) scale(${this.state.scale})`,
                    transformOrigin: "50% 50%",
                    transition: 'none',
                    height: "100%",
                    width: "100%"
                }}>
                    {this.props.children}
                </div>
            </div>
        </div>
    }
};

export default ReactZoomer;