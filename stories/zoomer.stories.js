import React from 'react';
import {storiesOf} from '@storybook/react';
import "./styles.css";

import ReactZoomer from "../src/react/ReactZoomer";


class ZoomerDemo extends React.Component {

    render() {
        return (
            <div>
                <ReactZoomer style={{
                    height: "600px",
                    width: "800px"
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: "100%",
                        width: "100%",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            backgroundColor: "blue",
                            fontSize: "300px",
                            height: "400px",
                            width: "100%",
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            ABC
                        </div>
                    </div>
                </ReactZoomer>
            </div>
        );
    }
}

storiesOf('Zoomer', module)
    .add('default', () =>
        <div className='ReactSlider__example'>
            <h1>Zoomer</h1>

            <ZoomerDemo />
        </div>
    );