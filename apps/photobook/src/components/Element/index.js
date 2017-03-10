import { merge } from 'lodash';
import classNames from 'classnames';
import { DraggableCore } from 'react-draggable';
import React, { Component, PropTypes } from 'react';

// 导入组件
import Handler from '../Handler';
import Rotatable from '../Rotatable';
import Resizable from '../Resizable';

import './index.scss';


const SIDE_PAD = 20;

// 导入处理函数.
import * as events from './handler/events';

export default class Element extends Component {
  constructor(props) {
    super(props);

    // dragable处理函数
    this.onDragStart = e => events.onDragStart(this, e);
    this.onDrag = (e, draggableData) => events.onDrag(this, e, draggableData);
    this.onDragStop = e => events.onDragStop(this, e);

    // 缩放的处理函数
    this.onResizeStart = e => events.onResizeStart(this, e);
    this.onResize = (dir, e, draggableData) => events.onResize(this, dir, e, draggableData);
    this.onResizeStop = e => events.onResizeStop(this, e);

    // 旋转的处理函数
    this.onRotateStart = e => events.onRotateStart(this, e);
    this.onRotate = (e, draggableData) => events.onRotate(this, e, draggableData);
    this.onRotateStop = e => events.onRotateStop(this, e);

    this.onMouseDown = e => events.onMouseDown(this, e);

    this.onClick = e => events.onClick(this, e);
  }

  render() {
    const { data, actions, children } = this.props;
    const { className, style, handlerStyle, pageWidth, pageHeight } = data;
    const elementClassName = classNames('element', className);

    const { element, containerOffset } = data;
    const guid = element.get('id');

    let { left, top, width, height } = style;

    // 边界检测
    // left
    if (left <= SIDE_PAD - width) {
      left =  SIDE_PAD - width;
    }
    // top
    if (top <= SIDE_PAD - height) {
      top = SIDE_PAD - height;
    }
    // right
    if (pageWidth - SIDE_PAD <= left) {
      left = pageWidth - SIDE_PAD;
    }
    // bottom
    if (pageHeight - SIDE_PAD <= top) {
      top = pageHeight - SIDE_PAD;
    }

    const elementStyle = merge({}, style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`
    });

    // 定义接收事件层的数据和处理函数.
    const handlerData = { style: handlerStyle, element };
    const handlerActions = merge({}, actions, { handleContextMenu: this.onContextMenu, handleClick: this.onClick });

    const computed = element.get('computed');
    let rotatableControlsStyle = {};
    let resizableControlsStyle = {};

    if (computed && containerOffset) {
      if (containerOffset) {
        rotatableControlsStyle = merge({}, style, {
          width: `${computed.get('width') + 2}px`,
          height: `${computed.get('height') + 2}px`,
          left: `${containerOffset.left + computed.get('left') - 1}px`,
          top: `${containerOffset.top + computed.get('top') - 1}px`,
          zIndex: 9000
        });
      }
      resizableControlsStyle = merge({}, style, {
        width: `${computed.get('width') + 2}px`,
        height: `${computed.get('height') + 2}px`,
        left: `${computed.get('left') - 1}px`,
        top: `${computed.get('top') - 1}px`,
        zIndex: 9000
      });
    }

    return (
      <div className="element-container">
        <DraggableCore
          axis="both"
          disabled={false}
          onStart={this.onDragStart}
          onDrag={this.onDrag}
          onStop={this.onDragStop}
          onMouseDown={this.onMouseDown}
        >
          <div
            className={elementClassName}
            style={elementStyle}
            data-guid={guid}
            ref={(div) => { this.element = div; }}
          >
            {children}

            {/* 接收事件层 */}
            <Handler data={handlerData} actions={handlerActions} />
          </div>


        </DraggableCore>

        {
          element.get('isSelected')
          ? (
            <div
              className="rotatable-controls"
              style={rotatableControlsStyle}
              data-html2canvas-ignore="true"
            >
              <Rotatable
                isDisabled={element.get('isDisabled')}
                isSelected={element.get('isSelected')}
                rot={element.get('rot')}
                actions={{
                  onRotate: this.onRotate,
                  onRotateStart: this.onRotateStart,
                  onRotateStop: this.onRotateStop
                }}
              />
            </div>
          )
          : null
        }

        {
          element.get('isSelected')
          ? (
            <div
              className="resizable-controls"
              style={resizableControlsStyle}
              data-html2canvas-ignore="true"
            >
              <Resizable
                isDisabled={element.get('isDisabled')}
                isSelected={element.get('isSelected')}
                keepRatio={computed.get('keepRatio')}
                rot={element.get('rot')}
                actions={{
                  onResizeStart: this.onResizeStart,
                  onResize: this.onResize,
                  onResizeStop: this.onResizeStop
                }}
              />
            </div>
          )
          : null
        }
      </div>
    );
  }
}

Element.propTypes = {
};
