import React, { Component, PropTypes } from 'react';
// import SortAndFilter from '../SortAndFilter';
import ImageItem from '../ImageItem';
import { combine } from '../../../../common/utils/url';
import { set, get, template, isEqual } from 'lodash';
import { IMAGE_SRC } from '../../contants/apiUrl';
import XDrag from '../../../../common/ZNOComponents/XDrag';
import PicMagnifier from '../PicMagnifier';
import Selection from '../Selection';
import LazyLoad from 'react-lazy-load';
import {
  onOverImageItem,
  onOutImageItem,
  toggleImageItemSelected,
  onImageListDown,
  onDragStarted,
  deleteImage,
  onSelect,
  onSelectStop } from './handler';
import './index.scss';

class ImageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      magnifierParams: {
        isMagnifierShow: false,
        imageUrl: '',
        offset: {
          x: 0,
          y: 0,
          marginTop: 0
        }
      },
      magnifierShowTime: 1,
      selectedImageIds: []
    };

    this.onOverImageItem = (imageUrl) => onOverImageItem(this, imageUrl);
    this.onOutImageItem = () => onOutImageItem(this);
    this.onImageListDown = (event) => onImageListDown(this, event);
    this.toggleImageItemSelected = (id, event) => toggleImageItemSelected(this, id, event);
    this.onDragStarted = (event) => onDragStarted(this, event);
    this.deleteImage = (imageObj) => deleteImage(this, imageObj);
    this.onSelect = (selectionBox) => onSelect(this, selectionBox);
    this.onSelectStop = (selectionBox) => onSelectStop(this, selectionBox);
  }

  componentDidMount() {
    window.onscroll = this.onOutImageItem;
  }

  componentWillUnmount() {
    window.onscroll = null;
  }

  render() {
    const { uploadedImages, baseUrls } = this.props;
    const { selectedImageIds, magnifierParams } = this.state;
    const onOverImageItem = this.onOverImageItem;
    const onOutImageItem = this.onOutImageItem;
    const toggleImageItemSelected = this.toggleImageItemSelected;
    const imageItemActions = { onOutImageItem, onOverImageItem, toggleImageItemSelected };

    const { imageList } = this.refs;
    let selectionProps = null;
    if (imageList) {
      const containerOffsetTop = imageList.offsetTop + 93;
      const containerOffsetLeft = imageList.offsetLeft;
      const containerOffsetWidth = imageList.offsetWidth;
      const containerOffsetHeight = imageList.offsetHeight;
      selectionProps = {
        containerOffsetTop,
        containerOffsetLeft,
        containerOffsetWidth,
        containerOffsetHeight,
        actions: {
          onSelect: this.onSelect,
          onSelectStop: this.onSelectStop
        }
      };
    }

    const images = uploadedImages.map((v) => {
      const value = v;
      value.src = combine(baseUrls.get('uploadBaseUrl'), IMAGE_SRC, {
        qaulityLevel: 0,
        puid: v.encImgId || v.id,
        rendersize: 'fit350'
      });

      return value;
    });


    return (
      <div>
        <div className="image-list" ref="imageList" onMouseDown={this.onImageListDown}>
          {
            images
              ? images.map((imageObj, index) => {
                const isSelected = selectedImageIds.indexOf(imageObj.guid)>=0 ? true : false;
              return (
                <div key={index}>
                  <XDrag onDragStarted={ this.onDragStarted }>
                  <div className="lazy-item">
                    <LazyLoad height={95} offset={0}>
                      <ImageItem imageObj={imageObj}
                                 deleteImage={this.deleteImage.bind(this, imageObj)}
                                 isSelected={isSelected}
                                 actions={imageItemActions}/>
                    </LazyLoad>
                  </div>
                  </XDrag>
                </div>
              )
            })
              : null
          }
          {
            selectionProps
            ? <Selection {...selectionProps} />
            : null
          }
          <PicMagnifier data={magnifierParams}/>
        </div>
      </div>
    );
  }
}

ImageList.propTypes = {};

export default ImageList;
