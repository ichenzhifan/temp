import React, { Component, PropTypes } from 'react';
import { merge } from 'lodash';
import { SketchPicker } from 'react-color';

import {
  hexToRGB,
  RGBToHex
} from '../../utils/colorConverter';

import './index.scss';

class XColorPicker extends Component {
  constructor(props) {
    super(props);

    const { initHexString } = this.props;
    const defaultColor = {
      r: '255',
      g: '255',
      b: '255'
    };

    let color = defaultColor;
    if (initHexString) {
      const [r, g, b] = hexToRGB(initHexString);
      color = merge({}, defaultColor, { r, g, b });
    }

    this.state = {
      displayColorPicker: false,
      color
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const oldNeedResetColor = this.props.needResetColor;
    const newNeedResetColor = nextProps.needResetColor;

    if (oldNeedResetColor !== newNeedResetColor && newNeedResetColor) {
      const [r, g, b] = hexToRGB(nextProps.initHexString);
      this.setState({
        color: { r, g, b }
      });
    }
  }

  handleClick() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  }

  handleChange(color) {
    this.setState({ color: color.rgb });

    this.props.onColorChange(color);
  }

  handleClose() {
    this.setState({ displayColorPicker: false });
  }

  render() {
    const { displayColorPicker, color } = this.state;

    const colorStyle = {
      background: `rgb(${color.r}, ${color.g}, ${color.b})`
    };

    return (
      <div className="color-picker">
        <div className="swatch" onClick={this.handleClick}>
          <div className="color" style={colorStyle} />
        </div>

        {
          displayColorPicker
          ? (
            <div className="popover">
              <div className="cover" onClick={this.handleClose} />
              <SketchPicker
                color={color}
                onChange={this.handleChange}
                disableAlpha
              />
            </div>
          )
          : null
        }

      </div>
    );
  }
}

XColorPicker.propTypes = {
  onColorChange: PropTypes.func.isRequired,
  initHexString: PropTypes.string,
  needResetColor: PropTypes.bool,
};

export default XColorPicker;
