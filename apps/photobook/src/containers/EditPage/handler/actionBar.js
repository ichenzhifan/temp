import Immutable from 'immutable';
import { get } from 'lodash';
import { elementTypes, productTypes } from '../../../contants/strings';
import { getNewPosition } from '../../../utils/elementPosition';
import Element from '../../../utils/entries/element';

import { getAutoFillData } from '../../../utils/autofill/autofill';
import { checkIsSupportImageInCover } from '../../../utils/cover';

import { getPxByPt } from '../../../../../common/utils/math';

/**
 * design setting的处理函数
 */
export const onDesignSetting = (that) => {
  const { boundBookSettingsModalActions } = that.props;
  boundBookSettingsModalActions.showBookSettingsModal();
};

/**
 * auto fill的处理函数
 */
export const onAutoFill = (that) => {
  const {
    project,
    settings,
    boundTrackerActions,
    boundProjectActions,
    boundConfirmModalActions,
    boundTemplateActions,
    size
  } = that.props;
  const imageArray = project.get('imageArray');
  const pageArray = project.get('pageArray');

  const product = project.getIn(['setting', 'product']);
  const minSheetNumber = project.getIn(
    ['parameterMap', 'sheetNumberRange', 'min']
  );
  const currentSheetNumber = pageArray.size / 2;
  const addedSheetNumber = currentSheetNumber - minSheetNumber;

  let minImageSize = 0;

  switch (product) {
    case productTypes.LF:
    case productTypes.PS:
      minImageSize = 20;
      break;

    case productTypes.FM:
      minImageSize = 16;
      break;
    default:
      minImageSize = 20;
  }

  minImageSize += (addedSheetNumber * 2);

  if (imageArray.size < minImageSize) {
    boundConfirmModalActions.showConfirm({
      okButtonText: 'OK',
      confirmMessage: `Auto Fill requires at least ${minImageSize} photos, ` +
        'please add more photos!',
      onOkClick: () => {
        boundConfirmModalActions.hideConfirm();
      }
    });
  } else {
    boundConfirmModalActions.showConfirm({
      okButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      hideOnOk: false,
      confirmMessage: 'Auto Fill will replace your current book design on ' +
      'all pages, and this operation cannot be reversed.' +
      ' Would you like to continue?',
      onOkClick: () => {
        boundTrackerActions.addTracker('ClickAutofillAndContinue');
        const projectType = get(settings, 'spec.product');
        const coverType = get(settings, 'spec.cover');
        const sheetNumberRange = project.getIn(['parameterMap', 'sheetNumberRange']);

        const pageArray = project.get('pageArray');

        let minSheetNumber = sheetNumberRange.get('min');
        let maxSheetNumber = sheetNumberRange.get('max');
        const countSheets = pageArray.size / 2;
        // 减掉多余不能使用的2页
        const countPSPages = pageArray.size - 2;

        // 对pressbook做特殊处理.
        const isPressBook = projectType === productTypes.PS;

        const { renderInnerSheetSize } = size;
        const innerPageRatio = renderInnerSheetSize.width / renderInnerSheetSize.height;

        // autofill数据中的第一项, 是用于填充封面的.
        let autoFillData = getAutoFillData(
          isPressBook,
          minSheetNumber,
          maxSheetNumber,
          imageArray,
          innerPageRatio
        );

        let countInnerSheets = autoFillData.size - 1;

        // 判断封面是否支持添加图片. 如果不支持, 就需要把autoFillData的第一项数据
        // 移除.
        if (!checkIsSupportImageInCover(coverType) && autoFillData.size) {
          autoFillData = autoFillData.delete(0);

          countInnerSheets = autoFillData.size;
        }

        const availableSheetNumber = maxSheetNumber - currentSheetNumber;

        let addedSheetsNumber = countInnerSheets - countSheets;
        let addedPageNumber = countInnerSheets - countPSPages;

        let addedPageString = '';
        let realAddedSheetNumber = 0;

        if (isPressBook) {
          if (addedPageNumber / 2 > availableSheetNumber) {
            addedPageNumber = availableSheetNumber * 2;
          }

          if (addedPageNumber % 2 !== 0) {
            addedPageNumber += 1;
          }

          addedPageString = addedPageNumber;
          realAddedSheetNumber = addedPageNumber / 2;
        } else {
          if (addedSheetsNumber > availableSheetNumber) {
            addedSheetsNumber = availableSheetNumber;
          }

          addedPageString = addedSheetsNumber * 2;
          realAddedSheetNumber = addedSheetsNumber;
        }

        if (realAddedSheetNumber > 0) {
          boundConfirmModalActions.showConfirm({
            okButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            hideOnOk: true,
            confirmMessage: (
              'Your book currently does not have enough pages for' +
              ' your images. Running autofill will therefore' +
              ` add ${addedPageString} pages. Would you like to continue?`
            ),
            onOkClick: () => {
              boundTemplateActions.changeApplyTemplateStatus(true);

              that.setState(
                {
                  loading: {
                    isShown: true
                  }
                },
                () => {
                  boundProjectActions.deleteAll().then(() => {
                    boundProjectActions
                      .createMultipleDualPage(null, realAddedSheetNumber)
                      .then(() => {
                        that.doAutoLayout(autoFillData).then(() => {
                          boundTemplateActions.changeApplyTemplateStatus(false);
                        });
                      });
                  });
                }
              );
            }
          });
        } else {
          boundTemplateActions.changeApplyTemplateStatus(true);

          // 隐藏弹框.
          boundConfirmModalActions.hideConfirm();

          that.setState({
            loading: { isShown: true }
          }, () => {
            boundProjectActions.deleteAll().then(() => {
              that.doAutoLayout(autoFillData).then(() => {
                boundTemplateActions.changeApplyTemplateStatus(false);
              });
            });
          });
        }
      }
    });
  }
};

/**
 * { item_description }
 */
 export const onChangeBgColor = (that) => {
   const { boundChangeBgColorModalActions, paginationSpread } = that.props;
   const selectedPageId = paginationSpread.getIn(['summary', 'pageId']);
   const pages = paginationSpread.get('pages');
   let bgColor;
   pages.forEach((item) => {
     if (item.get('id') === selectedPageId) { bgColor = item.get('bgColor')};
   });
   boundChangeBgColorModalActions.showChangeBgColorModal({
     selectedPageId,
     bgColor
   });
 };


function addFrame(that, type, width, height) {
  const {
    boundProjectActions,
    project,
    pagination,
    paginationSpread
  } = that.props;

  const currentPageId = pagination.pageId;
  if (!currentPageId) {
    throw 'currentPageId can not null';
  }

  const currentPageArray = paginationSpread.get('pages');

  const elementArray = project.get('elementArray');

  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });

  const currentElementArray = elementArray.filter((element) => {
    return currentPage.get('elements').indexOf(element.get('id')) !== -1;
  });

  const maxDepElement = currentElementArray.maxBy((element) => {
    return element.get('dep');
  });

  const newElementPosition = getNewPosition(elementArray, currentPage);

  let newElement = null;
  if (type === elementTypes.photo) {
    newElement = new Element({
      type,
      width,
      height,
      x: newElementPosition.x,
      y: newElementPosition.y,
      px: newElementPosition.x / currentPage.get('width'),
      py: newElementPosition.y / currentPage.get('height'),
      pw: width / currentPage.get('width'),
      ph: height / currentPage.get('height'),
      dep: maxDepElement ? maxDepElement.get('dep') + 1 : 0,
    });
  } else if (type === elementTypes.text) {
    const bookSetting = project.get('bookSetting');
    const fontColor = bookSetting.getIn(['font', 'color']);
    const fontSize = bookSetting.getIn(['font', 'fontSize']);
    const fontWeight = bookSetting.getIn(['font', 'fontId']);
    const fontFamily = bookSetting.getIn(['font', 'fontFamilyId']);

    newElement = {
      width,
      height,
      fontColor,
      fontWeight,
      fontFamily,
      fontSize: getPxByPt(fontSize) / currentPage.get('height'),
      text: '',
      type: elementTypes.text,
      textAlign: 'left',
      textVAlign: 'top',
      dep: maxDepElement ? maxDepElement.get('dep') + 1 : 0,
      x: newElementPosition.x,
      y: newElementPosition.y,
      px: newElementPosition.x / currentPage.get('width'),
      py: newElementPosition.y / currentPage.get('height'),
      pw: width / currentPage.get('width'),
      ph: height / currentPage.get('height'),
      rot: 0,
    };
  }

  boundProjectActions.createElement(currentPageId, newElement);
}

/**
 * add text的处理函数
 */
export const onAddText = (that) => {
  const DEFAULT_TEXT_WIDTH = 1970;
  const DEFAULT_TEXT_HEIGHT = 810;

  addFrame(that, elementTypes.text, DEFAULT_TEXT_WIDTH, DEFAULT_TEXT_HEIGHT);
};

/**
 * add frame的处理函数
 */
export const onAddFrame = (that) => {
  const DEFAULT_FRAME_WIDTH = 960;
  const DEFAULT_FRAME_HEIGHT = 640;

  addFrame(that, elementTypes.photo, DEFAULT_FRAME_WIDTH, DEFAULT_FRAME_HEIGHT);
};


export const onFlipHorizontally = (that) => {
  const {
    boundProjectActions,
    project,
    pagination,
    paginationSpread
  } = that.props;
  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');

  const elementArray = project.get('elementArray');

  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });

  const currentElementArray = elementArray.filter((element) => {
    return currentPage.get('elements').indexOf(element.get('id')) !== -1;
  });

  const centerX = currentPage.get('width') / 2;
  let updateObjectArray = Immutable.List();

  currentElementArray.forEach((element) => {
    const elementId = element.get('id');
    const elementX = element.get('x');
    const deltaX = centerX - elementX;
    const x = (centerX + deltaX) - element.get('width');

    updateObjectArray = updateObjectArray.push(Immutable.Map({
      id: elementId,
      x,
      px: x / currentPage.get('width')
    }));
  });

  if (updateObjectArray.size) {
    boundProjectActions.updateElements(updateObjectArray);
  }
};

export const onFlipVertically = (that) => {
  const {
    boundProjectActions,
    project,
    pagination,
    paginationSpread
  } = that.props;
  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');

  const elementArray = project.get('elementArray');

  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });

  const currentElementArray = elementArray.filter((element) => {
    return currentPage.get('elements').indexOf(element.get('id')) !== -1;
  });

  const centerY = currentPage.get('height') / 2;
  let updateObjectArray = Immutable.List();

  currentElementArray.forEach((element) => {
    const elementId = element.get('id');
    const elementY = element.get('y');
    const deltaY = centerY - elementY;
    const y = (centerY + deltaY) - element.get('height');

    updateObjectArray = updateObjectArray.push(Immutable.Map({
      id: elementId,
      y,
      py: y / currentPage.get('height')
    }));
  });

  if (updateObjectArray.size) {
    boundProjectActions.updateElements(updateObjectArray);
  }
};

/**
 * undo的处理函数
 */
export const onUndo = (that) => {
  // todo
};

/**
 * redo的处理函数
 */
export const onRedo = (that) => {
  // todo
};

function clearCurrentPageElements(that, typeList) {
  const {
    pagination,
    paginationSpread,
    project,
    boundProjectActions
  } = that.props;

  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');

  const elementArray = project.get('elementArray');

  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });

  const currentElementIds = currentPage.get('elements');

  const currentPhotoElements = elementArray.filter((element) => {
    return currentElementIds.indexOf(element.get('id')) !== -1 &&
      typeList.indexOf(element.get('type')) !== -1;
  });

  boundProjectActions.deleteElements(
    currentPage.get('id'),
    currentPhotoElements.map(e => e.get('id')).toArray()
  );
}

/**
 * clear all images的处理函数
 */
export const onClearAllImages = (that) => {
  const {
    pagination,
    paginationSpread,
    project,
    boundProjectActions
  } = that.props;

  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');

  const elementArray = project.get('elementArray');

  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });

  const currentElementIds = currentPage.get('elements');

  const typeList = [elementTypes.photo, elementTypes.cameo];
  const currentPhotoElements = elementArray.filter((element) => {
    return currentElementIds.indexOf(element.get('id')) !== -1 &&
      typeList.indexOf(element.get('type')) !== -1;
  });

  let updateObjectArray = Immutable.List();
  currentPhotoElements.forEach((element) => {
    updateObjectArray = updateObjectArray.push(Immutable.Map({
      id: element.get('id'),
      imageid: null,
      encImgId: null
    }));
  });

  boundProjectActions.updateElements(updateObjectArray);
};

/**
 * remove all frames的处理函数
 */
export const onRemoveAllFrames = (that) => {
  clearCurrentPageElements(that, [
    elementTypes.photo,
    elementTypes.text,
    elementTypes.cameo,
    elementTypes.decoration
  ]);
};

/**
 * remove sheet的处理函数
 */
export const onRemoveSheet = (that) => {
  const {
    paginationSpread,
    pagination,
    boundProjectActions,
    boundConfirmModalActions
  } = that.props;
  boundConfirmModalActions.showConfirm({
    okButtonText: 'Continue',
    cancelButtonText: 'Cancel',
    confirmMessage: 'This operation will remove current sheet, ' +
    'would you like to continue?',
    onOkClick: () => {
      const pageIds = paginationSpread.get('pageIds');
      const leftPageId = pageIds.first();
      const rightPageId = pageIds.last();

      boundProjectActions.deleteDualPage(leftPageId, rightPageId).then(() => {
        let sheetIndex = pagination.sheetIndex;
        // 删除page后，总sheet数量并没有更新，手动减1
        const maxIndex = pagination.total - 1;
        if (sheetIndex > maxIndex) {
          sheetIndex = maxIndex;
        }
        that.switchSheet({
          current: sheetIndex
        });
      });
    }
  });
};

/**
 * restart的处理函数
 */
export const onRestart = (that) => {
  const {
    boundProjectActions,
    boundConfirmModalActions,
    boundTrackerActions,
    boundSnippingActions,
    boundPaginationActions
  } = that.props;

  boundConfirmModalActions.showConfirm({
    okButtonText: 'Continue',
    cancelButtonText: 'Cancel',
    confirmMessage: 'This operation will remove all photo frames and ' +
    'text frames from all pages to start over from scratch, ' +
    'would you like to continue?',
    onOkClick: () => {
      boundTrackerActions.addTracker('ClickRestartAndContinue');

      boundProjectActions.deleteAll().then(() => {
        // 重置store上的封面截图.
        boundSnippingActions.updateSnippingThumbnail({
          type: 'cover',
          base64: ''
        });

        // 重置到封面当book options发生改变时.
        boundPaginationActions.switchSheet(0);
      });
    }
  });
};

/**
 * 添加sheet到最前面的处理函数
 */
export const onAddToFront = (that) => {
  // todo
};

/**
 * 添加sheet到最后面的处理函数
 */
export const onAddToBack = (that) => {
  const {
    boundProjectActions,
    boundPaginationActions,
    pagination,
    project
  } = that.props;

  boundProjectActions.createDualPage().then(() => {
    const projectType = project.getIn(['setting', 'product']);
    const isPressBook = (projectType === productTypes.PS);
    const sheetIndex = isPressBook ? pagination.total : pagination.total + 1;
    boundPaginationActions.switchSheet(sheetIndex);
  });
};

/**
 * 添加sheet到当前页的后面处理函数
 */
export const onAddAfterThisPage = (that) => {
  const {
    boundProjectActions,
    boundPaginationActions,
    pagination
  } = that.props;

  const insertIndex = pagination.sheetIndex * 2;
  boundProjectActions.createDualPage(insertIndex).then(() => {
    boundPaginationActions.switchSheet(pagination.sheetIndex + 1);
  });
};

/**
 * 添加sheet到当前页的前面的处理函数
 */
export const onAddBeforeThisPage = (that) => {
  const {
    boundProjectActions,
    boundPaginationActions,
    pagination
  } = that.props;

  const insertIndex = (pagination.sheetIndex - 1) * 2;
  boundProjectActions.createDualPage(insertIndex).then(() => {
    boundPaginationActions.switchSheet(pagination.sheetIndex);
  });
};
