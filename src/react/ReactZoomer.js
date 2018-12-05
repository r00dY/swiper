import React from "react";
import AbstractZoomer from "../AbstractZoomer";

class ReactZoomer extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.itemRef = React.createRef();

        this.zoomer = new AbstractZoomer();

        this.zoomer.addEventListener('move', (coords) => {
            this.itemRef.current.style.transform = `translateX(${coords.x}px) translateY(${coords.y}px) scale(${coords.scale})`;
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