import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import classNames from 'classnames';
import { merge } from 'lodash';

import XLoading from '../../../../common/ZNOComponents/XLoading';
import * as Events from './handler/events';
import Element from '../Element';
import './index.scss';

class TextElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isImgLoading: false
    };

    this.onLoad = this.onLoad.bind(this);
    this.loadComplete = this.loadComplete.bind(this);
    this.handleDragOver = event => Events.handleDragOver(this, event);
    this.onDrop = event => Events.onDrop(this, event);
  }

  componentWillReceiveProps(nextProps) {
    const oldElement = this.props.data.element;
    const newElement = nextProps.data.element;

    const oldImgUrl = oldElement.getIn(['computed', 'imgUrl']);
    const newImgUrl = newElement.getIn(['computed', 'imgUrl']);

    if (oldImgUrl !== newImgUrl && newElement.get('text')) {
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
    this.loadComplete();
  }

  loadComplete() {
    this.setState({
      isImgLoading: false
    });
  }

  render() {
    const { data, actions } = this.props;
    const { element, containerOffset } = data;
    const imageSrc = element.getIn(['computed', 'imgUrl']);

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

    const text = element.get('text');

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
      title: !text ? 'Double click to edit. Text will not print if blank' : '',
      handlerStyle,
      handlerData: element,
      element,
      containerOffset
    };


    const { isImgLoading } = this.state;

    const snapshotAttributes = {};

    if (!text || !text.length) {
      snapshotAttributes['data-html2canvas-ignore'] = true;
    }

    return (
      <Element data={elementData} actions={elementActions}>
        <XLoading isShown={isImgLoading} />
        {
          text
          ? (
            <img
              className="text-img"
              alt=""
              src={imageSrc}
              onLoad={this.onLoad}
              onError={this.loadComplete}
              data-html2canvas-manual-ignore="true"
              {...snapshotAttributes}
            />
          )
          : null
        }
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
