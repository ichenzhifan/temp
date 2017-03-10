import React, { Component, PropTypes } from 'react';
import { translate } from "react-translate";
import classNames from 'classnames';
import './index.scss';

class OutInSide extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { className, onLeftClicked, onRightClicked, t } = this.props;
    const customClass = classNames('out-in-side', className);

    return (
      <div className={customClass}>
        <div className="left-button x-btn" onClick={onLeftClicked}>
          <i className="left-icon icon" />
          <span className="text">{t('OUTSIDE')}</span>
        </div>
        <div className="right-button x-btn" onClick={onRightClicked}>
          <i className="right-icon icon" />
          <span className="text">{t('INSIDE')}</span>
        </div>
      </div>
    );
  }
}

OutInSide.propTypes = {
  onLeftClicked: PropTypes.func,
  onRightClicked: PropTypes.func,
  className: PropTypes.string
};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default translate('OutInSide')(OutInSide);
