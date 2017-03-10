import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import classNames from 'classnames';
import ico from './icon.svg';
import './index.scss';

class WarnTip extends Component {

  constructor(props){
    super(props);
    // this.state = {
    //   width: 100
    // }
  }

  render() {
    const { t, limit, show, scale, ratio, style } = this.props;
    // const width = this.state.width * ratio;

    // 根据设计, pc端的宽度恒定为18px
    const width = 18;
    const classnames = classNames('element-warntip',{
      'show': scale > limit
    });
    return (
      <img src={ico}
           className={classnames}
           title={t("BEYOND_SIZE_TIP",{n:scale,m:limit})}
           alt={t("BEYOND_SIZE_TIP",{n:scale,m:limit})}
           width={width}
           style={style}
           draggable={false} />
    );
  }


}


export default translate('WarnTip')(WarnTip);
