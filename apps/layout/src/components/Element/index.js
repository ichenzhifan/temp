import React, { PropTypes, Component } from 'react';
import { DraggableCore } from 'react-draggable';
import classNames from 'classnames';

import Rotatable from '../Rotatable';
import Resizable from '../Resizable';

import './index.scss';

class Element extends Component {
  constructor(props) {
    super(props);

    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);

    this.onRotate = this.onRotate.bind(this);
    this.onRotateStart = this.onRotateStart.bind(this);
    this.onRotateStop = this.onRotateStop.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
  }

  onDragStart(e) {
    const { id, actions } = this.props;
    actions.onDragStart(id, e);
  }

  onDrag(e, draggableData) {
    const { id, actions } = this.props;
    actions.onDrag(id, e, draggableData);
  }

  onDragStop(e, draggableData) {
    const { id, actions } = this.props;
    actions.onDragStop(id, e, draggableData);
  }

  onResizeStart(e) {
    const { id, actions } = this.props;
    actions.onResizeStart(id, e);
  }

  onResize(dir, e, draggableData) {
    const { id, actions } = this.props;
    actions.onResize(id, dir, e, draggableData);
  }

  onResizeStop(e) {
    const { id, actions } = this.props;
    actions.onResizeStop(id, e);
  }

  onRotateStart(e) {
    const { id, actions } = this.props;
    actions.onRotateStart(id, e);
  }

  onRotate(e, draggableData) {
    const { id, actions } = this.props;
    actions.onRotate(id, e, draggableData);
  }

  onRotateStop(e) {
    const { id, actions } = this.props;
    actions.onRotateStop(id, e);
  }

  onMouseDown(e) {
    const { id, actions } = this.props;
    actions.onMouseDown(id, e);
  }

  render() {
    const {
      className,
      position,
      width,
      height,
      dep,
      rot,
      isDisabled,
      isSelected,
      children
    } = this.props;


    const elementStyle = Object.assign({}, {
      width,
      height,
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: `rotate(${rot}deg)`,
      zIndex: dep
    });

    const elementClass = classNames('element', className, {
      selected: isSelected
    });

    return (
      <DraggableCore
        axis="both"
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        onMouseDown={this.onMouseDown}
      >
        <div className={elementClass} style={elementStyle}>
          {
            isDisabled
            ? <span className="lock-icon glyphicon glyphicon-lock" />
            : null
          }
          <Rotatable
            isDisabled={isDisabled}
            isSelected={isSelected}
            rot={rot}
            actions={{
              onRotate: this.onRotate,
              onRotateStart: this.onRotateStart,
              onRotateStop: this.onRotateStop
            }}
          />

          <Resizable
            isDisabled={isDisabled}
            isSelected={isSelected}
            actions={{
              onResizeStart: this.onResizeStart,
              onResize: this.onResize,
              onResizeStop: this.onResizeStop
            }}
          />

          {children}
        </div>
      </DraggableCore>
    );
  }
}

Element.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  actions: PropTypes.shape({
    onDragStart: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragStop: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
    onResize: PropTypes.func.isRequired,
    onResizeStop: PropTypes.func.isRequired,
    onRotateStart: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    onRotateStop: PropTypes.func.isRequired
  }).isRequired,
  dep: PropTypes.number.isRequired,
  rot: PropTypes.number.isRequired,
  keepRatio: PropTypes.bool.isRequired,
  bounds: PropTypes.shape({
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    right:PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
  }),
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  className: PropTypes.string
};

export default Element;
