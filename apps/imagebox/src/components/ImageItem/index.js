import React, { Component, PropTypes } from 'react';
import { combine } from '../../utils/url';
import classNames from 'classnames';
import './index.scss';


class ImageItem extends Component{
  constructor(props){
    super(props)
  }

  handleImageName(name) {
    return name = name.length > 15 ? name.substr(0,5) + "..." + name.substr(name.length-6) : name;
  }

  render() {
    const { imageObj, deleteImage } = this.props;
    const { name, src, usedCount, imageId } = imageObj;
    const countIconClass = classNames('icon-count',{
      'hide' : usedCount===0
    })
    const deleteIconClass = classNames('icon-delete',{
      'show' : usedCount!==0
    })
    // const src = [url,'&rendersize=fit140'].join('');
    //const src = combine(url,'','&rendersize=fit140');
    return (
      <div className="image-item">
        <div className="wrap-image">
          <div className="loaded-image">
            <img
              className="preview-image"
              src={src}
            />
            <div className={countIconClass}>
              <span>{ usedCount }</span>
            </div>
            <div
              className={ deleteIconClass }
              title="delete"
              onClick={ deleteImage }
            >
            </div>
          </div>
        </div>
        <div
          className="preview-image-tip"
          title={name}>
          {
            this.handleImageName(name)
          }
        </div>
      </div>
    );
  }
}


export default ImageItem;
