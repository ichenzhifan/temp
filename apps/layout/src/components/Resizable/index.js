import React, { PropTypes, Component } from 'react';
import { DraggableCore } from 'react-draggable';

import './index.scss';

class Resizable extends Component {
  constructor(props) {
    super(props);

    this.onResize = this.onResize.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);

    this.isResizing = false;

    this.startMousePosition = {};
  }

  onResizeStart(e) {
    this.isResizing = true;
    this.props.actions.onResizeStart(e);
    e.stopPropagation();
  }

  onResize(dir, e, draggableData) {
    if (!this.isResizing) return;

    this.props.actions.onResize(dir, e, draggableData);
    e.stopPropagation();
  }

  onResizeStop(e) {
    this.isResizing = false;
    this.props.actions.onResizeStop(e);
    e.stopPropagation();
  }

  render() {
    const { isDisabled, isSelected } = this.props;
    return (
      !isDisabled && isSelected
      ? (
        <div className="resizable">
          <DraggableCore
            onStart={this.onResizeStart}
            onDrag={this.onResize.bind(this, 'topLeft')}
            onStop={this.onResizeStop}
          >
            <div className="handle top-left"></div>
          </DraggableCore>
          <DraggableCore
            onStart={this.onResizeStart}
            onDrag={this.onResize.bind(this, 'topRight')}
            onStop={this.onResizeStop}
          >
            <div className="handle top-right"></div>
          </DraggableCore>
          <DraggableCore
            onStart={this.onResizeStart}
            onDrag={this.onResize.bind(this, 'bottomLeft')}
            onStop={this.onResizeStop}
          >
            <div className="handle bottom-left"></div>
          </DraggableCore>
          <DraggableCore
            onStart={this.onResizeStart}
            onDrag={this.onResize.bind(this, 'bottomRight')}
            onStop={this.onResizeStop}
          >
            <div className="handle bottom-right"></div>
          </DraggableCore>
        </div>
      )
      : null
    );
  }
}

Resizable.propTypes = {
  actions: PropTypes.shape({
    onResize: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
    onResizeStop: PropTypes.func.isRequired
  }).isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired
};

export default Resizable;
