import React, { Component, PropTypes } from 'react';
import XLoading from '../../../../common/ZNOComponents/XLoading';
import './index.scss';

class PicMagnifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isImgLoading: false
    }

    this.hideLoading = this.hideLoading.bind(this);
  }

  hideLoading() {
    this.setState({
      isImgLoading: false
    });
  }

  componentWillReceiveProps(nextProps) {
    const oldUrl = this.props.data.imageUrl;
    const currentUrl = nextProps.data.imageUrl;
    if (oldUrl !== currentUrl) {
      this.setState({
        isImgLoading: true
      });
    }
  }

  render() {
    const { data } = this.props;
    const { isMagnifierShow, imageUrl, offset } = data;
    const { x, y, marginTop } = offset;
    const style = {
      display: isMagnifierShow ? 'block' : 'none',
      left: x +'px',
      top: y + 'px',
    };
    const arrowStyle = {
      marginTop: marginTop*2/3 + 'px'
    };
    return (
      <div className="PicMagnifier" style={style}>
        <XLoading isShown={this.state.isImgLoading} />
        <img src={imageUrl} className="fill" />
        <img src={imageUrl}
             onLoad={this.hideLoading}
             onError={this.hideLoading} />
        <div className="arrow" style={arrowStyle}></div>
      </div>
    );
  }
}

PicMagnifier.proptype = {
  data: PropTypes.object
}

export default PicMagnifier;
