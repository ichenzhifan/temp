import { merge } from 'lodash';
import {setTransferData} from '../../../../common/utils/drag';
import { elementTypes } from '../../contants/strings';


let timer = null;

export const onOverImageItem = (that, imageObj) => {
  const imageUrl = imageObj.src;
  const { guid } = imageObj;
  const { imageList } = that.refs;

  const container = document.querySelector(`[data-guid="${guid}"]`);

  const containerPosition = container.getBoundingClientRect();
  const winHeight = window.innerHeight;
  const scaleInMagnifier = reCalsScale(imageObj.width, imageObj.height);

  // 如果图片框稍微全部显示在可视区域，为避免bug，不做放大处理。
  if (containerPosition.top + containerPosition.height > winHeight + 10) {
    return ;
  }
  let x = containerPosition.left + containerPosition.width + 15;
  let y = containerPosition.top + containerPosition.height / 2;
  let marginTop = 0;

  // 解决底部部分显示不了问题
  if (y + (scaleInMagnifier.height + 22) / 2 > winHeight) {
    marginTop = y + (scaleInMagnifier.height + 22) / 2 - winHeight;
    y -= marginTop;
  }

  timer = setTimeout(function() {
    that.setState({
      magnifierParams: {
        isMagnifierShow: true,
        imageUrl,
        offset : {
          x,
          y,
          marginTop
        }
      }
    });
  }, that.state.magnifierShowTime * 1000);
};

export const onOutImageItem = (that) => {
  clearTimeout(timer);
  that.setState({
    magnifierParams: {
      isMagnifierShow: false,
      imageUrl: '',
      offset: {
        x: 0,
        y: 0
      }
    }
  });
};

export const toggleImageItemSelected = (that, id, event) => {
  const e = event || window.event;
  let ids = merge([], that.state.selectedImageIds);
  const index = ids.indexOf(id);
  if (!e.ctrlKey && (that.state.selectedImageIds.length <= 1 || (that.state.selectedImageIds.length>1 && index<0))) {
    // ids = [];
  }
  if (index >= 0) {
    if (!e.ctrlKey && ids.length > 1) {

    } else {
      if (e.ctrlKey) {
        ids.splice(index, 1);
      }
    }
  } else {
    if (ids.length===1 && !e.ctrlKey) {
      ids = [];
    }
    ids.push(id);
  }
  that.setState({
    selectedImageIds: ids
  });
  stopEvent(event);
};

export const onImageListDown = (that) => {
  clearImageIds(that);
};

export const onDragStarted = (that, event) => {
  const { selectedImageIds } = that.state;
  const { uploadedImages } = that.props;
  clearTimeout(timer);
  that.setState({
    magnifierParams: {
      isMagnifierShow: false,
      imageUrl: '',
      offset: {
        x: 0,
        y: 0
      }
    }
  });
  let imagesNeedTransfer = [];
  uploadedImages.map((item) => {
    if (selectedImageIds.indexOf(item.guid) >= 0) {
      imagesNeedTransfer.push({
        encImgId: item.encImgId,
        imageid: item.id,
        width: item.width,
        height: item.height,
        type: elementTypes.photo
      });
    }
  });

  setTransferData(event, imagesNeedTransfer);

  that.setState({
    selectedImageIds: []
  });
};

export const deleteImage = (that, imageObj) => {
  const { boundProjectActions } = that.props;
  if (imageObj.encImgId) {
    boundProjectActions.deleteProjectImage(imageObj.encImgId);
  }
};

export const onSelect = (that, selectionBox) => {
  if (selectionBox.p1 && selectionBox.p2) {
    selectElements(that, selectionBox.p1, selectionBox.p2);
  }
};


export const onSelectStop = (that, selectionBox) => {
  if (selectionBox.p1 && selectionBox.p2) {
    selectElements(that, selectionBox.p1, selectionBox.p2);
  }
};

const selectElements = (that, p1, p2) => {
  const selectElementIds = [];
  const elementsArray = Array.prototype.slice.call(document.querySelectorAll('.preview-image'), 0);
  const tempP1 = {
    x: p1.x < p2.x ? p1.x : p2.x,
    y: p1.y < p2.y ? p1.y : p2.y
  };

  const tempP2 = {
    x: p2.x > p1.x ? p2.x : p1.x,
    y: p2.y > p1.y ? p2.y : p1.y
  };

  const selectedElementArray = elementsArray.map((element) => {
    const container = element.parentNode.parentNode;
    const position = {
      x: container.offsetLeft,
      y: container.offsetTop
    };
    const position2 = {
      x: container.offsetLeft + element.offsetWidth,
      y: container.offsetTop + element.offsetHeight
    };

    if (tempP1.y < position2.y && tempP2.y > position.y &&
      tempP1.x < position2.x && tempP2.x > position.x) {
      const guid = container.getAttribute('data-guid');
      selectElementIds.push(guid);
    }
  });
  if (selectElementIds.length) {
    that.setState({
      selectedImageIds: selectElementIds
    });
  }
};

const stopEvent = (event) => {
  const e = event || window.event;
  e.stopPropagation();
};

const clearImageIds = (that) => {
  that.setState({
    selectedImageIds: []
  });
};


const reCalsScale = (width, height) => {
  const MAX_WIDTH = 350;
  const MAX_HEIGHT = 350;
  const ratio = width / height;
  if (width >= height) {
    const rWidth = Math.min(width, MAX_WIDTH);
    return {
      width: rWidth,
      height: rWidth / ratio
    };
  } else {
    const rHeight = Math.min(height, MAX_HEIGHT);
    return {
      width: rHeight * ratio,
      height: rHeight
    };
  }
};
