import React, { Component, PropTypes } from 'react';

import Immutable from 'immutable';

import '../Rotatable';
import '../Resizable';

import './index.scss';

class ElementControls extends Component {
  render() {
    const { selectedElementArray } = this.props;
    return (
      <div
        className="element-controls"
        data-html2canvas-ignore="true"
      >
        <Rotatable
          isShown={Boolean(selectedElementArray.size)}
          rot={degree}
          actions={{
            onRotate: this.onRotate,
            onRotateStart: this.onRotateStart,
            onRotateStop: this.onRotateStop
          }}
        />
        <Resizable
          isShown={Boolean(selectedElementArray.size)}
          rot={degree}
          actions={{
            onResizeStart: this.onResizeStart,
            onResize: this.onResize,
            onResizeStop: this.onResizeStop
          }}
        />
      </div>
    );
  }
}

ElementControls.propTypes = {
  selectedElementArray: PropTypes.instanceOf(Immutable.List).isRequired
};

export default ElementControls;
