import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'react-translate';
import { addEventListener, removeEventListener } from '../../../../common/utils/events';
import * as handler from './handler';

import './index.scss';

class PhotoActionBar extends Component {
  constructor(props) {
    super(props);

    this.onCrop = (event) => handler.onCrop(this, event);
    this.onRotate = (event) => handler.onRotate(this, event);
    this.onFlip = (event) => handler.onFlip(this, event);
  }

  render() {
    const { t, actions, data, children } = this.props;
    const {className, style, hasImage} = data;

    return (
      <ul style={style} className="photo-action-bar" data-html2canvas-ignore="true">
          { children }
      </ul>
    );
  }
}

PhotoActionBar.propTypes = {
  actions: PropTypes.shape({
    onCrop: PropTypes.func,
    onRotate: PropTypes.func,
    onFlip: PropTypes.func,
    onRect: PropTypes.func,
    onRound: PropTypes.func,
    onSmall: PropTypes.func,
    onMedium: PropTypes.func,
    onLarge: PropTypes.func,
    onClear: PropTypes.func
  }),
  data: PropTypes.shape({
    className: PropTypes.string,
    style: PropTypes.object,
    highlight: PropTypes.shape({
      largeHightlight: PropTypes.bool,
      mediumHightlight: PropTypes.bool,
      smallHightlight: PropTypes.bool,
      rectHightlight: PropTypes.bool,
      roundHightlight: PropTypes.bool
    }),
    disabledIcons: PropTypes.shape({
      cropDisable: PropTypes.bool,
      rotateDisable: PropTypes.bool,
      flipDisable: PropTypes.bool
    })
  })
};

PhotoActionBar.defaultProps = {
};

export default translate('PhotoActionBar')(PhotoActionBar);

