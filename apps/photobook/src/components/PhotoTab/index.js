import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';

import { merge, get, isEqual, isNumber } from 'lodash';
import Immutable from 'immutable';

import XFileUpload from '../../../../common/ZNOComponents/XFileUpload';
import XButton from '../../../../common/ZNOComponents/XButton';

import SortAndFilter from '../SortAndFilter';
import ImageList from '../ImageList';

import { onToggleHideUsed, onSorted, uploadFileClicked } from './handler';

import './index.scss';


class PhotoTab extends Component {
  constructor(props) {
    super(props);
    const { data } = this.props;
    let { uploadedImages } = data;
    uploadedImages = uploadedImages.map(item => {
      return merge({}, item, {
        usedCount: 0,
        uploadTime: new Date().getTime()
      });
    });
    this.state = {
      uploadedImages,
      copyUploadedImages: uploadedImages,
      isHideUseChecked: false,
      sortValue: '<,uploadTime'
    };

    this.onToggleHideUsed = () => onToggleHideUsed(this);
    this.onSorted = (param) => onSorted(this, param);
    this.uploadFileClicked = () => uploadFileClicked(this);
  }

  getNewElements(oldElements, newElements) {
    const oldImageIds = [];
    oldElements.map(element => {
      oldImageIds.push(element.id);
    });
    return newElements.filter(element => {
      return oldImageIds.indexOf(element.id)===-1;
    });
  }

    /**
   * 设置图片的使用次数.
   * @param imageArr 图片数组
   * @param imageUsedCountMap 包含使用次数的对象.
   */
  checkUsageCount(imageArr, imageUsedCountMap) {
    if (imageArr && imageArr.length) {
      imageArr.forEach((v) => {
        const count = imageUsedCountMap && imageUsedCountMap[v.encImgId] ? imageUsedCountMap[v.encImgId] : 0;
        v.usedCount = count;
        v.uploadedImages = new Date().getTime();
      });
    }

    return imageArr;
  }

  componentWillReceiveProps(nextProps) {
    const oldElements = get(this.props, 'data.uploadedImages');
    const newElements = get(nextProps, 'data.uploadedImages');
    const oldImageUsedCountMap = get(this.props, 'data.imageUsedCountMap');
    const imagesUsedCountMap = get(nextProps, 'data.imageUsedCountMap');
    if (oldElements!=newElements || oldImageUsedCountMap!=imagesUsedCountMap) {
      let newImages = this.checkUsageCount(merge([], newElements), imagesUsedCountMap.toJS());
      newImages.map(item => {
        if (!item.shotTime) {
          item.shotTime = new Date().getTime();
        }
      });
      const valueArr = this.state.sortValue.split(',');

      const diffTag = valueArr[0];
      const realValue = valueArr[1];
      newImages.sort((a, b) => {
        switch (diffTag) {
          case '<' : {
            if (realValue === 'name') {
              return (b[realValue]).localeCompare(a[realValue]);
            } else {
              return b[realValue] - a[realValue];
            }
          }
          default : {
            if (realValue === 'name') {
              return (a[realValue]).localeCompare(b[realValue]);
            } else {
              return a[realValue] - b[realValue];
            }
          }
        }
      });

      if (this.state.isHideUseChecked) {
        const nonUsedImages = newImages.filter((item) => {
          return item.usedCount === 0;
        });
        this.setState({
          uploadedImages: nonUsedImages,
          copyUploadedImages: newImages
        });
      } else {
        this.setState({
          uploadedImages: newImages,
          copyUploadedImages: newImages
        });
      }
    }
  }

  componentDidMount() {
    const elements = get(this.props, 'data.uploadedImages');
    const imagesUsedCountMap = get(this.props, 'data.imageUsedCountMap');
    let newImages = this.checkUsageCount(merge([], elements), imagesUsedCountMap.toJS());
    newImages.map(item => {
      if (!item.shotTime) {
        item.shotTime = new Date().getTime();
      }
    });
    const valueArr = this.state.sortValue.split(',');

    const diffTag = valueArr[0];
    const realValue = valueArr[1];
    newImages.sort((a, b) => {
      switch (diffTag) {
        case '<' : {
          if (realValue === 'name') {
            return (b[realValue]).localeCompare(a[realValue]);
          } else {
            return b[realValue] - a[realValue];
          }
        }
        default : {
          if (realValue === 'name') {
            return (a[realValue]).localeCompare(b[realValue]);
          } else {
            return a[realValue] - b[realValue];
          }
        }
      }
    });
    this.setState({
      uploadedImages: newImages,
      copyUploadedImages: newImages
    });
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const oldElements = get(this.props, 'data.uploadedImages');
  //   const newElements = get(nextProps, 'data.uploadedImages');
  //   const oldImageUsedCountMap = get(this.props, 'data.imageUsedCountMap');
  //   const imagesUsedCountMap = get(nextProps, 'data.imageUsedCountMap');
  //   if (Immutable.is(oldElements, newElements) && Immutable.is(oldImageUsedCountMap, imagesUsedCountMap)) {
  //     return false;
  //   }
  //   return true;
  // }

  render() {
    const { t, actions, data } = this.props;
    const { uploadedImages, isHideUseChecked, copyUploadedImages } = this.state;
    const { boundImagesActions, boundProjectActions, toggleModal } = actions;
    const { baseUrls, imageUsedCountMap } = data;
    const isFilterShow = !!copyUploadedImages.length;
    return (
      <div className="PhotoTab">
        <XFileUpload
          className="add-photo"
          multiple="multiple"
          boundUploadedImagesActions={ boundImagesActions }
          toggleModal={ toggleModal }
          uploadFileClicked={this.uploadFileClicked}
        >
          { t('ADD_PHOTOS') }
        </XFileUpload>
        <SortAndFilter onToggleHideUsed={this.onToggleHideUsed}
                       onSorted={this.onSorted}
                       isShow={isFilterShow}/>
        <ImageList uploadedImages={uploadedImages}
                   boundProjectActions={boundProjectActions}
                   baseUrls={baseUrls}
                   imageUsedCountMap={imageUsedCountMap}/>
      </div>
    );
  }
}

PhotoTab.proptype = {

}

export default translate('PhotoTab')(PhotoTab);
