import React, { Component, PropTypes } from 'react';
import { template, merge } from 'lodash';
import { connect } from 'react-redux';
import { translate } from "react-translate";

// 导入selector
import { mapSelectThemesDispatchToProps } from '../../selector/mapDispatch';
import { mapStateToProps } from '../../selector/mapState/selectThemes';

import './index.scss';

class SelectThemes extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { t } = this.props;
    return (
      <div className="select-themes">
        this is select-themes!
      </div>
    );
  }
}

SelectThemes.propTypes = {};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default connect(mapStateToProps, mapSelectThemesDispatchToProps)(translate('SelectThemes')(SelectThemes));
