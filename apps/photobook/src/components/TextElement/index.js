import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import classNames from 'classnames';

import XLoading from '../../../../common/ZNOComponents/XLoading';
import * as Events from './handler/events';
import { merge } from 'lodash';
import Element from '../Element';
import './index.scss';

class TextElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      needInitSize: true,
      isImgLoading: false
    };

    this.onLoad = this.onLoad.bind(this);
    this.loadComplete = this.loadComplete.bind(this);
    this.handleDragOver = (event) => Events.handleDragOver(this, event);
    this.onDrop = (event) => Events.onDrop(this, event);
  }

  componentWillReceiveProps(nextProps) {
    const oldElement = this.props.data.element;
    const newElement = nextProps.data.element;

    const oldFontSize = oldElement.get('fontSize');
    const newFontSize = newElement.get('fontSize');

    const oldFontColor = oldElement.get('fontColor');
    const newFontColor = newElement.get('fontColor');

    const oldTextAlign = oldElement.get('textAlign');
    const newTextAlign = newElement.get('textAlign');

    const oldFontWeight = oldElement.get('fontWeight');
    const newFontWeight = newElement.get('fontWeight');

    const oldFontFamily = oldElement.get('fontFamily');
    const newFontFamily = newElement.get('fontFamily');

    const oldText = oldElement.get('text');
    const newText = newElement.get('text');

    if (oldFontSize !== newFontSize || oldFontColor !== newFontColor ||
      oldTextAlign !== newTextAlign || oldFontWeight !== newFontWeight ||
      oldFontFamily !== newFontFamily || oldText !== newText) {
      this.setState({
        needInitSize: true
      });
    }

    const oldImgUrl = oldElement.getIn(['computed', 'imgUrl']);
    const newImgUrl = newElement.getIn(['computed', 'imgUrl']);

    if (oldImgUrl !== newImgUrl) {
      this.setState({
        isImgLoading: true
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const oldElement = this.props.data.element;
    const newElement = nextProps.data.element;

    const oldIsImgLoading = this.state.isImgLoading;
    const newIsImgLoading = nextState.isImgLoading;

    if (!Immutable.is(oldElement, newElement) ||
      oldIsImgLoading !== newIsImgLoading) {
      return true;
    }

    return false;
  }

  onLoad(e) {
    const { data, actions } = this.props;
    const { element, ratio, page } = data;
    const { boundProjectActions } = actions;
    const elementId = element.get('id');

    const { needInitSize } = this.state;

    if (needInitSize) {
      const width = e.target.naturalWidth / ratio.workspace;
      const height = e.target.naturalHeight / ratio.workspace;
      const pw = width / page.get('width');
      const ph = height / page.get('height');

      // 如果有数据变更，才更新element
      if ((element.get('width') !== width ||
        element.get('height') !== height ||
        element.get('pw') !== pw ||
        element.get('ph') !== ph) &&
        boundProjectActions) {
        boundProjectActions.updateElement({
          id: elementId,
          width,
          height,
          pw: width / page.get('width'),
          ph: height / page.get('height')
        });
      }

      this.setState({
        needInitSize: false
      });
    }

    this.loadComplete();
  }

  loadComplete() {
    this.setState({
      isImgLoading: false
    });
  }

  render() {
    const { data, actions } = this.props;
    const { element, ratio, page, containerOffset } = data;
    const imageSrc = element.getIn(['computed', 'imgUrl']);

    const pageWidth = page.get('width') * ratio.workspace;
    const pageHeight = page.get('height') * ratio.workspace;

    const computed = element.get('computed');
    const handlerStyle = {
      position: 'absolute',
      width: `${computed.get('width')}px`,
      height: `${computed.get('height')}px`,
      top: 0,
      left: 0
    };
    const elementActions = merge(actions, {
      handleDrop: this.onDrop,
      handleDragOver: this.handleDragOver
    });
    const elementData = {
      className: classNames('text-element', {
        selected: element.get('isSelected')
      }),
      style: {
        zIndex: element.get('dep') + 100,
        width: computed.get('width'),
        height: computed.get('height'),
        left: computed.get('left'),
        top: computed.get('top'),
        transform: `rotate(${element.get('rot')}deg)`
      },
      handlerStyle,
      handlerData: element,
      element,
      pageWidth,
      pageHeight,
      containerOffset
    };

    const text = element.get('text');
    const { isImgLoading } = this.state;

    const snapshotAttributes = {};

    if (!text || !text.length) {
      snapshotAttributes['data-html2canvas-ignore'] = true;
    }

    return (
      <Element data={elementData} actions={elementActions}>
        <XLoading isShown={isImgLoading} />
        <img
          className="text-img"
          alt=""
          src={imageSrc}
          onLoad={this.onLoad}
          onError={this.loadComplete}
          data-html2canvas-manual-ignore="true"
          {...snapshotAttributes}
        />
      </Element>
    );
  }
}

TextElement.propTypes = {
  actions: PropTypes.shape({
    boundProjectActions: PropTypes.object.isRequired
  }).isRequired,
  data: PropTypes.shape({
    element: PropTypes.instanceOf(Immutable.Map).isRequired
  }).isRequired,
};

export default TextElement;
