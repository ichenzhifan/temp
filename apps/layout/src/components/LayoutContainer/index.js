import React, { PropTypes, Component } from 'react';

import { findIndex, set, merge, isEqual, mapValues, template } from 'lodash';

import BleedContainer from '../BleedContainer';
import PhotoElement from '../PhotoElement';
import TextElement from '../TextElement';
import Selection from '../Selection';
import GuideLine from '../GuideLine';
import MultipleActionPanel from '../MultipleActionPanel';

import { elementTypes } from '../../constants/strings';

import { TEXT_SRC } from '../../constants/apiUrl';

import './index.scss';

function renderElement(type, elementProps) {
  switch (type) {
    case elementTypes.photo:
      return <PhotoElement {...elementProps} />;
    case elementTypes.text:
      return <TextElement {...elementProps} />;
    default:
      return null;
  }
}

function convertElement(element, ratio) {
  const convertedElement = merge({}, element, {
    position: {
      x: element.x * ratio,
      y: element.y * ratio
    },
    width: element.width * ratio,
    height: element.height * ratio,
    isDisabled: element.isLock,
    isSelected: false
  });
  delete convertedElement.x;
  delete convertedElement.y;

  return convertedElement;
}

function convertLinePositionToStyle(
  startPosition,
  endPosition,
  containerWidth,
  containerHeight
) {
  const objStyle = {
    left: startPosition.x,
    top: startPosition.y,
    right: containerWidth - startPosition.x,
    bottom: containerHeight - startPosition.y,
    width: (endPosition.x - startPosition.x) || 1,
    height: (endPosition.y - startPosition.y) || 1
  };

  if (objStyle.left < objStyle.right) {
    delete objStyle.right;
  } else {
    delete objStyle.left;
  }

  if (objStyle.top < objStyle.bottom) {
    delete objStyle.bottom;
  } else {
    delete objStyle.top;
  }

  return objStyle;
}

class LayoutContainer extends Component {

  constructor(props) {
    super(props);

    this.startRadians = 0;
    this.lastRadians = 0;

    this.elementRadians = {};

    this.startDragPosition = {};
    this.startResizePosition = {};

    this.state = {
      elementArray: [],
      guideLineArray: []
    };

    this.isDragging = false;
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);

    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);

    this.onRotateStart = this.onRotateStart.bind(this);
    this.onRotate = this.onRotate.bind(this);
    this.onRotateStop = this.onRotateStop.bind(this);

    this.unselectElements = this.unselectElements.bind(this);
    this.selectSingleElement = this.selectSingleElement.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.onSelect = this.onSelect.bind(this);
    this.onSelectStop = this.onSelectStop.bind(this);
    this.onTextDblClick = this.onTextDblClick.bind(this);

    this.moveElementByKeyboard = this.moveElementByKeyboard.bind(this);
    this.updateSelectedElementPosition = this.updateSelectedElementPosition.bind(this);
    this.updateElementPosition = this.updateElementPosition.bind(this);
    this.updateElementSize = this.updateElementSize.bind(this);
  }

  componentWillMount() {
    const { spreadOptions } = this.props;
    const { safeZone, bleed, width, height, ratio } = spreadOptions;
    const scaledSafeZone = mapValues(safeZone, (v, k) => {
      return (v + bleed[k]) * ratio;
    });

    const newGuideLineArray = [
      // safe zone lines
      {
        startPosition: { x: 0, y: scaledSafeZone.top },
        endPosition: { x: width, y: scaledSafeZone.top },
        isShown: false
      },
      {
        startPosition: { x: width - scaledSafeZone.right, y: 0 },
        endPosition: { x: width - scaledSafeZone.right, y: height },
        isShown: false
      },
      {
        startPosition: { x: 0, y: height - scaledSafeZone.bottom },
        endPosition: { x: width, y: height - scaledSafeZone.bottom },
        isShown: false
      },
      {
        startPosition: { x: scaledSafeZone.left, y: 0 },
        endPosition: { x: scaledSafeZone.left, y: height },
        isShown: false
      },

      // bound lines
      {
        startPosition: { x: 0, y: 0 },
        endPosition: { x: width, y: 0 },
        isShown: false
      },
      {
        startPosition: { x: width, y: 0 },
        endPosition: { x: width, y: height },
        isShown: false
      },
      {
        startPosition: { x: 0, y: height },
        endPosition: { x: width, y: height },
        isShown: false
      },
      {
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: height },
        isShown: false
      },

      // container central lines
      {
        startPosition: { x: width / 2, y: 0 },
        endPosition: { x: width / 2, y: height },
        isShown: false
      },
      {
        startPosition: { x: 0, y: height / 2 },
        endPosition: { x: width, y: height / 2 },
        isShown: false
      },
    ];

    this.setState({
      guideLineArray: newGuideLineArray
    });
  }

  componentWillReceiveProps(nextProps) {
    const oldElements = this.props.elements;
    const newElements = nextProps.elements;

    if (!isEqual(oldElements, newElements)) {
      const { elementArray } = this.state;
      const { spreadOptions } = nextProps;
      const newElementArray = [];
      newElements.forEach((element) => {
        const newElement = convertElement(element, spreadOptions.ratio);
        const stateElement = this.getElement(element.id);
        if (elementArray.length) {
          newElement.isSelected = stateElement.isSelected;
        }

        newElementArray.push(newElement);
      });

      this.setState({
        elementArray: newElementArray
      });
    }
  }

  getElementIndex(elementId) {
    const { elementArray } = this.state;
    const elementIndex = findIndex(elementArray, (element) => {
      return element.id === elementId;
    });
    return elementIndex;
  }

  getElement(elementId) {
    const { elementArray } = this.state;
    const elementIndex = this.getElementIndex(elementId);
    return elementArray[elementIndex];
  }

  moveElementByKeyboard(e) {
    const { keyCode } = e;
    switch (keyCode) {
      case 38:
        // press up
        this.moveElement(0, -1);
        break;
      case 40:
        // press down
        this.moveElement(0, 1);
        break;
      case 37:
        // press left
        this.moveElement(-1, 0);
        break;
      case 39:
        // press right
        this.moveElement(1, 0);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  moveElement(deltaX, deltaY) {
    const { elementArray } = this.state;
    const selectedElementArray = elementArray.filter(o => o.isSelected);

    if (selectedElementArray.length) {
      const newElementArray = elementArray.map((element) => {
        const { position } = element;
        if (element.isSelected && !element.isDisabled) {
          return merge({}, element, {
            position: {
              x: position.x + deltaX,
              y: position.y + deltaY
            }
          });
        }
        return element;
      });

      this.setState({
        elementArray: newElementArray
      });
    }
  }

  getSelectedMinMaxPosition() {
    const { elementArray } = this.state;
    const selectedElementArray = elementArray.filter(o => o.isSelected);

    const firstElement = selectedElementArray[0];
    let minX = firstElement.position.x;
    let minY = firstElement.position.y;
    let maxX = 0;
    let maxY = 0;

    selectedElementArray.forEach((element) => {
      const { position } = element;
      const rightX = position.x + element.width;
      const rightY = position.y + element.height;

      if (position.x < minX) {
        minX = position.x;
      }

      if (rightX > maxX) {
        maxX = rightX;
      }

      if (position.y < minY) {
        minY = position.y;
      }

      if (rightY > maxY) {
        maxY = rightY;
      }
    });

    return [
      {
        x: minX,
        y: minY
      },
      {
        x: maxX,
        y: maxY
      }
    ];
  }

  snapToGuideLine(deltaX, deltaY) {
    const { nearOffset } = this.props;
    const { guideLineArray } = this.state;

    const isMoveLeft = deltaX < 0;
    const isMoveRight = deltaX > 0;
    const isMoveUp = deltaY < 0;
    const isMoveDown = deltaY > 0;

    const [minPos, maxPos] = this.getSelectedMinMaxPosition();

    let newDeltaX = deltaX;
    let newDeltaY = deltaY;
    guideLineArray.forEach((guideLine) => {
      const { startPosition, endPosition } = guideLine;
      const isVerticalLine = (startPosition.x === endPosition.x);

      if (isVerticalLine) {
        if ((startPosition.x === minPos.x ||
          startPosition.x === maxPos.x) && Math.abs(deltaX) < 3) {
          newDeltaX = 0;
        } else {
          if (isMoveLeft) {
            if (startPosition.x < minPos.x &&
              minPos.x - startPosition.x < nearOffset) {
              newDeltaX = startPosition.x - minPos.x;
            }

            if (maxPos.x > startPosition.x &&
              maxPos.x - startPosition.x < nearOffset) {
              newDeltaX = startPosition.x - maxPos.x;
            }
          }

          if (isMoveRight) {
            if (startPosition.x > minPos.x &&
              startPosition.x - minPos.x < nearOffset) {
              newDeltaX = startPosition.x - minPos.x;
            }

            if (startPosition.x > maxPos.x &&
              startPosition.x - maxPos.x < nearOffset) {
              newDeltaX = startPosition.x - maxPos.x;
            }
          }
        }
      } else {
        if ((startPosition.y === minPos.y ||
          startPosition.y === maxPos.y) && Math.abs(deltaY) < 3) {
          newDeltaY = 0;
        } else {
          if (isMoveUp) {
            if (startPosition.y < minPos.y &&
              minPos.y - startPosition.y < nearOffset) {
              newDeltaY = startPosition.y - minPos.y;
            }

            if (maxPos.y > startPosition.y &&
               maxPos.y - startPosition.y < nearOffset) {
              newDeltaY = startPosition.y - maxPos.y;
            }
          }

          if (isMoveDown) {
            if (startPosition.y > minPos.y &&
              startPosition.y - minPos.y < nearOffset) {
              newDeltaY = startPosition.y - minPos.y;
            }

            if (startPosition.y > maxPos.y &&
              startPosition.y - maxPos.y < nearOffset) {
              newDeltaY = startPosition.y - maxPos.y;
            }
          }
        }
      }
    });

    return [newDeltaX, newDeltaY];
  }

  showGuideLineIfNear(deltaX, deltaY) {
    const [minPos, maxPos] = this.getSelectedMinMaxPosition();
    const { guideLineArray } = this.state;

    const isMoveLeft = deltaX < 0;
    const isMoveRight = deltaX > 0;
    const isMoveUp = deltaY < 0;
    const isMoveDown = deltaY > 0;

    const newGuideLineArray = [];
    const { nearOffset } = this.props;
    guideLineArray.forEach((guideLine) => {
      const { startPosition, endPosition } = guideLine;
      const isVerticalLine = (startPosition.x === endPosition.x);

      const newGuideLine = merge({}, guideLine, { isShown: true });
      // TODO: 中线对齐
      // const newGuideLine = merge({}, guideLine, { isShown: false });
      if (isVerticalLine) {
        if (startPosition.x === minPos.x || startPosition.x === maxPos.x) {
          newGuideLine.isShown = true;
        } else if (isMoveLeft) {
          if (minPos.x > startPosition.x &&
            minPos.x - startPosition.x < nearOffset) {
            newGuideLine.isShown = true;
          }

          if (maxPos.x > startPosition.x &&
            maxPos.x - startPosition.x < nearOffset) {
            newGuideLine.isShown = true;
          }
        } else if (isMoveRight) {
          if (startPosition.x > minPos.x &&
            startPosition.x - minPos.x < nearOffset) {
            newGuideLine.isShown = true;
          }

          if (startPosition.x > maxPos.x &&
            startPosition.x - maxPos.x < nearOffset) {
            newGuideLine.isShown = true;
          }
        }
      } else {
        if (startPosition.y === minPos.y || startPosition.y === maxPos.y) {
          newGuideLine.isShown = true;
        } else if (isMoveUp) {
          if (minPos.y > startPosition.y &&
            minPos.y - startPosition.y < nearOffset) {
            newGuideLine.isShown = true;
          }

          if (maxPos.y > startPosition.y &&
            maxPos.y - startPosition.y < nearOffset) {
            newGuideLine.isShown = true;
          }
        } else if (isMoveDown) {
          if (startPosition.y > minPos.y &&
            startPosition.y - minPos.y < nearOffset) {
            newGuideLine.isShown = true;
          }

          if (startPosition.y > maxPos.y &&
            startPosition.y - maxPos.y < nearOffset) {
            newGuideLine.isShown = true;
          }
        }
      }

      newGuideLineArray.push(newGuideLine);
    });

    this.setState({
      guideLineArray: newGuideLineArray
    });
  }

  onDragStart(id, e) {
    this.isDragging = true;
    this.startDragPosition = {
      x: e.pageX,
      y: e.pageY
    };
  }

  onDrag(id, e, draggableData) {
    if (!this.isDragging) return;
    const deltaX = e.pageX - this.startDragPosition.x;
    const deltaY = e.pageY - this.startDragPosition.y;

    this.startDragPosition = {
      x: e.pageX,
      y: e.pageY
    };

    this.showGuideLineIfNear(deltaX, deltaY);

    const [newDeltaX, newDeltaY] = this.snapToGuideLine(deltaX, deltaY);

    this.moveElement(newDeltaX, newDeltaY);
  }

  getEdgePositionIfOutBleed(element) {
    const { spreadOptions } = this.props;
    const { width, height, bleed, ratio } = spreadOptions;
    const scaledBleed = mapValues(bleed, o => o * ratio);

    const { position } = element;
    const elementWidth = element.width;
    const elementHeight = element.height;
    const endPosition = {
      x: position.x + elementWidth,
      y: position.y + elementHeight
    };

    const newPosition = merge({}, position);
    if (position.x < scaledBleed.left) {
      newPosition.x = 0;
    }

    if (position.y < scaledBleed.top) {
      newPosition.y = 0;
    }

    if (endPosition.x > (width - scaledBleed.right)) {
      newPosition.x = width - elementWidth;
    }

    if (endPosition.y > (height - scaledBleed.bottom)) {
      newPosition.y = height - elementHeight;
    }

    return newPosition;
  }

  updateElementPosition(selectedElementArray) {
    if (selectedElementArray.length) {
      const { actions, spreadOptions } = this.props;
      const updateObjects = selectedElementArray.map((element) => {
        if (element && !element.isDisabled) {
          const newPosition = this.getEdgePositionIfOutBleed(element);
          return {
            id: element.id,
            x: newPosition.x / spreadOptions.ratio,
            y: newPosition.y / spreadOptions.ratio
          };
        }
        return null;
      });

      actions.updateMultiElement(updateObjects);
    }
  }

  updateElementSize(selectedElementArray) {
    if (selectedElementArray.length) {
      const { actions, spreadOptions } = this.props;
      const updateObjects = selectedElementArray.map((element) => {
        if (!element.isDisabled) {
          return {
            id: element.id,
            width: element.width / spreadOptions.ratio,
            height: element.height / spreadOptions.ratio
          };
        }
      });

      actions.updateMultiElement(updateObjects);
    }
  }

  updateSelectedElementPosition() {
    const { elementArray } = this.state;
    const selectedElementArray = elementArray.filter(o => o.isSelected);

    this.updateElementPosition(selectedElementArray);
  }

  onDragStop(id, e, draggableData) {
    this.isDragging = false;

    const { elementArray } = this.state;
    const selectedElementArray = elementArray.filter(o => o.isSelected);
    this.updateElementPosition(selectedElementArray);

    e.stopPropagation();
  }

  onResizeStart(id, e) {
    this.startResizePosition = {
      x: e.pageX,
      y: e.pageY
    };
  }

  onResize(id, dir, e, draggableData) {
    const { elementArray } = this.state;
    const elementIndex = this.getElementIndex(id);
    const element = elementArray[elementIndex];
    const { position, width, height, keepRatio } = element;

    const curX = e.pageX;
    const curY = e.pageY;
    const deltaX = curX - this.startResizePosition.x;
    const deltaY = curY - this.startResizePosition.y;

    this.startResizePosition = {
      x: curX,
      y: curY
    };

    let elementObj = {};

    if (dir === 'bottomRight') {
      elementObj = {
        width: width + deltaX,
        height: height + deltaY
      };
    }

    if (dir === 'bottomLeft') {
      elementObj = {
        width: width - deltaX,
        height: height + deltaY,
        position: {
          x: position.x + deltaX
        }
      };
    }

    if (dir === 'topLeft') {
      elementObj = {
        width: width - deltaX,
        height: height - deltaY,
        position: {
          x: position.x + deltaX,
          y: position.y + deltaY
        }
      };
    }

    if (dir === 'topRight') {
      elementObj = {
        width: width + deltaX,
        height: height - deltaY,
        position: {
          y: position.y + deltaY
        }
      };
    }

    const ratio = height / width;

    if (keepRatio) {
      const deltaWidth = Math.abs(elementObj.width - width);
      const deltaHeight = Math.abs(elementObj.height - height);
      if (deltaWidth < deltaHeight) {
        elementObj.width = elementObj.height / ratio;
      } else {
        elementObj.height = elementObj.width * ratio;
      }
    }

    this.setState({
      elementArray: [
        ...elementArray.slice(0, elementIndex),
        merge({}, element, elementObj),
        ...elementArray.slice(elementIndex + 1)
      ]
    });
  }

  onResizeStop(id, e) {
    const { actions, spreadOptions } = this.props;
    const element = this.getElement(id);

    actions.updateElement(id, {
      width: element.width / spreadOptions.ratio,
      height: element.height / spreadOptions.ratio,
      x: element.position.x / spreadOptions.ratio,
      y: element.position.y / spreadOptions.ratio
    });
  }

  onRotate(id, e, draggableData) {
    const containerOffsetTop = this.refs.layoutContainer.offsetTop;
    const containerOffsetLeft = this.refs.layoutContainer.offsetLeft;
    const { elementArray } = this.state;
    const elementIndex = this.getElementIndex(id);
    const element = elementArray[elementIndex];
    const { position, width, height } = element;

    const p1 = {
      x: position.x + containerOffsetLeft + (width / 2),
      y: position.y + containerOffsetTop + (height / 2),
    };

    const p2 = {
      x: e.pageX,
      y: e.pageY
    };

    const { elementRadians } = this;
    const elementRadian = elementRadians[id];
    const startRadians = elementRadian ? elementRadian.startRadians : 0;

    const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x) - startRadians;

    const angleDeg = Math.round(radians * (180 / Math.PI));

    let formatedDeg = 0;
    if (angleDeg < 0) {
      formatedDeg = (angleDeg % 360) + 360;
    } else {
      formatedDeg = angleDeg % 360;
    }

    set(
      this,
      `elementRadians.${id}.lastRadians`,
      radians
    );

    this.setState({
      elementArray: [
        ...elementArray.slice(0, elementIndex),
        merge({}, element, {
          rot: formatedDeg
        }),
        ...elementArray.slice(elementIndex + 1)
      ]
    });
  }

  onRotateStart(id, e) {
    const containerOffsetTop = this.refs.layoutContainer.offsetTop;
    const containerOffsetLeft = this.refs.layoutContainer.offsetLeft;
    const { position, width, height } = this.getElement(id);

    const p1 = {
      x: position.x + containerOffsetLeft + (width / 2),
      y: position.y + containerOffsetTop + (height / 2),
    };

    const p2 = {
      x: e.pageX,
      y: e.pageY
    };

    const { elementRadians } = this;
    const elementRadian = elementRadians[id];
    const lastRadians = elementRadian ? elementRadian.lastRadians : 0;

    set(
      this,
      `elementRadians.${id}.startRadians`,
      Math.atan2(p2.y - p1.y, p2.x - p1.x) - lastRadians
    );
  }

  onRotateStop(id, e) {
    const { actions } = this.props;
    const element = this.getElement(id);
    actions.updateElement(id, {
      rot: element.rot
    });
  }

  selectSingleElement(id) {
    const { elementArray } = this.state;
    this.setState({
      elementArray: elementArray.map((element) => {
        if (element.id === id) {
          return merge({}, element, { isSelected: true });
        }
        return merge({}, element, { isSelected: false });
      })
    }, () => {
      const { actions } = this.props;
      actions.elementToFront(id);
      actions.toggleSideBar(true);
    });
  }

  onMouseUp() {
    this.unselectElements();

    const { actions } = this.props;
    actions.toggleSideBar(false);
  }

  onMouseDown(id, e) {
    if (!e.ctrlKey) {
      const element = this.getElement(id);
      if (!element.isSelected) {
        this.selectSingleElement(id);
      }
    } else {
      const { elementArray } = this.state;

      const newElementArray = elementArray.map((o) => {
        if (o.id === id) {
          return merge({}, o, { isSelected: !o.isSelected });
        }
        return o;
      });

      this.setState({
        elementArray: newElementArray
      });

      const { actions } = this.props;
      const selectedElementArray = newElementArray.filter(o => o.isSelected);
      if (selectedElementArray.length === 1) {
        actions.toggleSideBar(true);
      } else {
        actions.toggleSideBar(false);
      }
    }
  }

  unselectElements() {
    const { elementArray } = this.state;
    this.setState({
      elementArray: elementArray.map((element) => {
        return merge({}, element, {
          isSelected: false
        });
      })
    });
  }

  selectElements(p1, p2, callback) {
    const { elementArray } = this.state;
    const tempP1 = {
      x: p1.x < p2.x ? p1.x : p2.x,
      y: p1.y < p2.y ? p1.y : p2.y
    };

    const tempP2 = {
      x: p2.x > p1.x ? p2.x : p1.x,
      y: p2.y > p1.y ? p2.y : p1.y
    };

    const selectedElementArray = elementArray.filter((element) => {
      const { position } = element;
      const position2 = {
        x: position.x + element.width,
        y: position.y + element.height
      };

      return (tempP1.y < position2.y && tempP2.y > position.y &&
        tempP1.x < position2.x && tempP2.x > position.x);
    });

    if (selectedElementArray.length) {
      const selectedElementIdArray = selectedElementArray.map(e => e.id);
      const newElementArray = elementArray.map((element) => {
        if (selectedElementIdArray.indexOf(element.id) !== -1) {
          return merge({}, element, { isSelected: true });
        }
        return merge({}, element, { isSelected: false });
      });

      if (selectedElementIdArray.length > 1) {
        const { actions, spreadOptions } = this.props;
        if (spreadOptions.isSidebarShow) {
          actions.toggleSideBar(false);
        }
      }

      this.setState({
        elementArray: newElementArray
      }, callback);
    }
  }

  stopEvent(e) {
    e.stopPropagation();
  }

  onSelect(selectionBox) {
    if (selectionBox.p1 && selectionBox.p2) {
      this.selectElements(selectionBox.p1, selectionBox.p2);
    }
  }

  onSelectStop(selectionBox) {
    if (selectionBox.p1 && selectionBox.p2) {
      this.selectElements(selectionBox.p1, selectionBox.p2, () => {
        const { elementArray } = this.state;
        const { actions } = this.props;
        const selectedElementArray = elementArray.filter(o => o.isSelected);
        if (selectedElementArray.length === 1) {
          actions.toggleSideBar(true);
        } else {
          actions.toggleSideBar(false);
        }
      });
    }
  }

  onTextDblClick(id) {
    const { actions } = this.props;
    const { toggleModal, editText } = actions;
    const currentElement = this.getElement(id);
    toggleModal('texteditorShow', true);
    editText(currentElement);
  }

  render() {
    const { spreadOptions, bgUrl, baseUrls } = this.props;
    const { bleed, width, height, ratio, oriHeight } = spreadOptions;

    const { elementArray, guideLineArray } = this.state;
    const selectedElementArray = elementArray.filter(o => o.isSelected);

    const layoutContainerStyle = {
      width,
      height,
      background: bgUrl ? `url(${bgUrl}) no-repeat` : ''
    };

    const bleedContainerStyle = mapValues(bleed, v => v * ratio);

    const { layoutContainer } = this.refs;
    let selectionProps = null;
    if (layoutContainer) {
      const containerOffsetTop = layoutContainer.offsetTop;
      const containerOffsetLeft = layoutContainer.offsetLeft;

      selectionProps = {
        containerOffsetTop,
        containerOffsetLeft,
        actions: {
          onSelect: this.onSelect,
          onSelectStop: this.onSelectStop
        }
      };
    }

    const MultipleActionPanelProps = {
      selectedElementArray,
      actions: {
        updateElementPosition: this.updateElementPosition,
        updateElementSize: this.updateElementSize
      }
    };

    return (
      <div
        ref="layoutContainer"
        className="layout-container"
        tabIndex="0"
        style={layoutContainerStyle}
        onMouseUp={this.onMouseUp}
        onKeyDown={this.moveElementByKeyboard}
        onKeyUp={this.updateSelectedElementPosition}
      >
        <div
          onMouseDown={this.stopEvent}
        >
          {
            elementArray
            ? (
              elementArray.map((element, index) => {
                const elementProps = merge({}, element, {
                  key: index,
                  actions: {
                    onDragStart: this.onDragStart,
                    onDrag: this.onDrag,
                    onDragStop: this.onDragStop,
                    onResizeStart: this.onResizeStart,
                    onResize: this.onResize,
                    onResizeStop: this.onResizeStop,
                    onRotateStart: this.onRotateStart,
                    onRotate: this.onRotate,
                    onRotateStop: this.onRotateStop,
                    onMouseDown: this.onMouseDown
                  }
                });
                if (element.type === elementTypes.text) {
                  const { text, fontFamily, fontSize, color, textAlign } = element;
                  elementProps.actions.onDblClick = this.onTextDblClick;
                  elementProps.imgUrl = template(TEXT_SRC)({
                    baseUrl: baseUrls.baseUrl,
                    text,
                    fontFamily,
                    fontSize: fontSize * oriHeight,
                    color,
                    textAlign,
                    ratio
                  });
                }
                return renderElement(element.type, elementProps);
              })
            )
            : null
          }
          {
            selectionProps
            ? <Selection {...selectionProps} />
            : null
          }
          {
            guideLineArray
            ? guideLineArray.map((guideLine, index) => {
              const guideLineStyle = convertLinePositionToStyle(
                guideLine.startPosition,
                guideLine.endPosition,
                width,
                height
              );
              return (
                <GuideLine key={index} style={guideLineStyle} isShown={guideLine.isShown} />
              );
            })
            : null
          }
        </div>

        <BleedContainer style={bleedContainerStyle} />

        <MultipleActionPanel {...MultipleActionPanelProps} />
      </div>
    );
  }
}

LayoutContainer.defaultProps = {
  nearOffset: 10
};

LayoutContainer.propTypes = {
  elements: PropTypes.array,
  bgUrl: PropTypes.string,
  spreadOptions: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    updateElement: PropTypes.func.isRequired,
    updateMultiElement: PropTypes.func.isRequired,
    elementToFront: PropTypes.func.isRequired,
    toggleModal: PropTypes.func,
    editText: PropTypes.func
  }).isRequired,
  nearOffset: PropTypes.number
};

export default LayoutContainer;
