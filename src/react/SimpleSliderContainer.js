import React from "react";

class SimpleSliderContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            containerInner: {
                height: undefined
            },
            items: [], // { transform, display, height }
        }
    }

    render() {
        return (
            <div className={this.props.className} style={this.props.style}>
                <div style={this.state.containerInner}>
                    { props.children.map((slide, index) => (
                        <div style={this.state.items[index]}>
                            { slide }
                        </div>
                    ))}

                </div>
            </div>
        );
    }
}

export default SimpleSliderContainer;