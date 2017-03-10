import { get } from 'lodash';
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

import { combine } from '../../utils/url';
import XLoading from '../../../../common/ZNOComponents/XLoading';
import { handleMouseOver, handleMouseOut, handleImageName, handleMouseDown, lazyLoadingImage, imgLoaded, imgErrored } from './handler';

import './index.scss';


class ImageItem extends Component {
  constructor(props) {
    super(props);

    this.handleMouseOver = () => handleMouseOver(this);
    this.handleMouseOut = () => handleMouseOut(this);
    this.imgLoaded = () => imgLoaded(this);
    this.imgErrored = () => imgErrored(this);
    this.handleImageName = (name) => handleImageName(name);
    this.handleMouseDown = (event) => handleMouseDown(this, event);

    this.state = {
      src: null,
      isImgLoading: true
    };
  }

  // componentWillReceiveProps(nextProps) {
  //   const oldImgUrl = get(this.props, 'imageObj.src');
  //   const newImgUrl = get(nextProps, 'imageObj.src');

  //   if (newImgUrl && oldImgUrl !== newImgUrl) {
  //     lazyLoadingImage(this, newImgUrl);
  //   }
  // }

  // componentWillMount(){
  //   const imgUrl = get(this.props, 'imageObj.src');

  //   if (imgUrl) {
  //     lazyLoadingImage(this, imgUrl);
  //   }
  // }

  shouldComponentUpdate(nextProps, nextState) {
    const oldImgUrl = get(this.props, 'imageObj.src');
    const newImgUrl = get(nextProps, 'imageObj.src');
    const oldCount = get(this.props, 'imageObj.usedCount');
    const newCount = get(nextProps, 'imageObj.usedCount');
    const oldImgLoading = get(this.state, 'isImgLoading');
    const newImgLoading = get(nextState, 'isImgLoading');
    const oldSelected = get(this.props, 'isSelected');
    const newSelected = get(nextProps, 'isSelected');
    if (oldImgUrl === newImgUrl && oldCount === newCount && oldImgLoading === newImgLoading && oldSelected === newSelected) {
      return false;
    }
    return true;
  }

  render() {
    const { imageObj, deleteImage, isSelected } = this.props;
    const { name, usedCount, imageId, guid, src } = imageObj;
    const countIconClass = classNames('icon-count', {
      'hide' : usedCount === 0
    });
    const deleteIconClass = classNames('icon-delete', {
      'show' : usedCount !== 0
    });
    const selectedClass = classNames('wrap-image', {
      'selected': isSelected
    });

    const { isImgLoading } = this.state;

    // const src = [url,'&rendersize=fit140'].join('');
    // const src = combine(url,'','&rendersize=fit140');
    return (
      <div className="image-item">
        <div
          className={selectedClass}
          onMouseDown={this.handleMouseDown}
          data-guid={guid}
        >
          <div className="loaded-image">
            <XLoading isShown={isImgLoading} />
            <img
              className="preview-image"
              src={src}
              onLoad={this.imgLoaded}
              onError={this.imgErrored}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
            />
            <div className={countIconClass}>
              <span>{ usedCount }</span>
            </div>
            <div
              className={deleteIconClass}
              title="delete"
              onClick={deleteImage}
            >
            </div>
          </div>
        </div>
        <div
          className="preview-image-tip"
          title={name}
        >
          {
            this.handleImageName(name)
          }
        </div>
      </div>
    );
  }
}


export default ImageItem;
