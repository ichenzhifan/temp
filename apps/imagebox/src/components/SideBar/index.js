import React, { Component, PropTypes } from 'react';
import { merge, isEqual } from 'lodash';
import XFileUpload from '../../../../common/ZNOComponents/XFileUpload';
import XButton from '../../../../common/ZNOComponents/XButton';
import { elementTypes } from '../../contants/strings';
import { translate } from 'react-translate';
import ListTab from '../ListTab';
import SortAndFilter from '../SortAndFilter';
import ImageList from '../ImageList';
import './index.scss';

class SideBar extends Component {
  constructor(props) {
    super(props);

    const { imageArray } = this.props;

    this.state = {
      selectedSize: null,
      sortBy: '',
      isChecked: false,
      imageArray
    };
  }

  onToggleHideUsed(isChecked) {
    const { imageArray, imageUsedCountMap } = this.props;
    this.setState({
      isChecked: isChecked
    });

    let newImages = this.checkUsageCount(merge([], imageArray), imageUsedCountMap);

    if (isChecked) {
      newImages = this.state.imageArray.filter(item=> {
        return item.usedCount === 0;
      });
      this.setState({
        imageArray: newImages
      })
    } else {
      this.setState({
        imageArray: newImages
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.imageArray, nextProps.imageArray) || !isEqual(this.props.imageUsedCountMap, nextProps.imageUsedCountMap)) {

      const newImages = this.checkUsageCount(merge([], nextProps.imageArray), nextProps.imageUsedCountMap);
      newImages.sort((a, b) => {
        return a[this.state.sortBy] > b[this.state.sortBy];
      });

      if (this.state.isChecked) {
        const nonUsedImages = newImages.filter((item) => {
          return item.usedCount === 0;
        });
        this.setState({
          imageArray: nonUsedImages
        });
      } else {
        this.setState({
          imageArray: newImages
        });
      }
    }
  }

  /**
   * 设置图片的使用次数.
   * @param imageArr 图片数组
   * @param imageUsedCountMap 包含使用次数的对象.
   */
  checkUsageCount(imageArr, imageUsedCountMap) {
    if (imageArr && imageArr.length) {
      imageArr.forEach((v) => {
        const count = imageUsedCountMap && imageUsedCountMap[v.id] ? imageUsedCountMap[v.id] : 0;
        v.usedCount = count;
      });
    }

    return imageArr;
  }

  onSorted(param) {
    const { imageArray, imageUsedCountMap } = this.props;
    const { value } = param;

    this.setState({
      sortBy: value
    });

    const newImages = this.checkUsageCount(merge([], imageArray), imageUsedCountMap);
    newImages.sort((a, b) => {
      return a[value] > b[value];
    });

    if (this.state.isChecked) {
      const nonUsedImages = newImages.filter(item=> {
        return item.usedCount === 0;
      });
      this.setState({
        imageArray: nonUsedImages
      })
    } else {
      this.setState({
        imageArray: newImages
      });
    }
  }

  uploadFileClicked() {
    const { currentSpread, boundWorkspaceActions } = this.props;
    const { spreadOptions } = currentSpread;
    const { id } = spreadOptions;
    const hasPhotoElement = currentSpread.elementsOptions.some(element=> {
      return element.type === elementTypes.photo;
    });
    if (!hasPhotoElement) {
      boundWorkspaceActions.autoAddPhotoToCanvas(true, id, spreadOptions.w, spreadOptions.h);
    }
  }

  getImageListAndBtnsHtml() {
    let html = '';
    const { imageArray, boundProjectActions, boundUploadedImagesActions, baseUrls } = this.props;

    if (imageArray && imageArray.length) {
      html = (<div>
        <SortAndFilter onSorted={this.onSorted.bind(this)}
                       onToggleHideUsed={this.onToggleHideUsed.bind(this)}
        />
        <ImageList
          uploadedImages={this.state.imageArray}
          baseUrls={baseUrls}
          boundUploadedImagesActions={ boundUploadedImagesActions }
          boundProjectActions={ boundProjectActions }
        />
      </div>);
    }
    return html;
  }

  render() {
    const { boundUploadedImagesActions, toggleModal, t } = this.props;

    return (
      <aside className="side-bar">

        <ListTab className="list-tab">
          { t('IMAGES') }
        </ListTab>

        <XFileUpload
          className="add-photo"
          boundUploadedImagesActions={ boundUploadedImagesActions }
          toggleModal={ toggleModal }
          uploadFileClicked={this.uploadFileClicked.bind(this)}
          multiple="multiple"
        >
          { t('ADD_PHOTOS') }
        </XFileUpload>

        {/* 图片列表和排序按钮 */}
        {this.getImageListAndBtnsHtml()}

      </aside>
    );
  }
}

export default translate('SideBar')(SideBar);
