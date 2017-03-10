import Immutable from 'immutable';
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

import * as handler from './handler.js';

import './index.scss';

class LayoutItem extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !Immutable.is(this.props.data, nextProps.data);
  }

  render() {
    const { data, actions } = this.props;
    const { applyTemplate } = actions;
    const templateUrl = data.getIn(['template', 'templateUrl']);
    const guid = data.getIn(['template', 'guid']);
    const imageSize = data.get('imageSize');
    const pageType = data.getIn(['template', 'pageType']);

    const imageStyle = {
      width: `${imageSize.get('width')}px`,
      height: `${imageSize.get('height')}px`
    };

    return (
      <div className="layout-item">
        <img style={imageStyle} className="layout-img" src={templateUrl} onClick={applyTemplate.bind(this, guid)} />
      </div>
    );
  }
}

LayoutItem.proptype = {

};

export default LayoutItem;
