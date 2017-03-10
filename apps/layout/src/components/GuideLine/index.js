import React, { PropTypes, Component } from 'react';

import classNames from 'classnames';

import './index.scss';

class GuideLine extends Component {

  render() {
    const { isShown, style } = this.props;
    const guideLineStyle = classNames('guide-line', {
      isShown
    });
    return (
      <div className={guideLineStyle} style={style} />
    );
  }
}

GuideLine.propTypes = {
  isShown: PropTypes.bool.isRequired,
  style: PropTypes.shape({
    left: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number
  }).isRequired,
};

export default GuideLine;
