import Immutable from 'immutable';
import { get } from 'lodash';
import { elementTypes, pageTypes } from '../../../contants/strings';
import Element from '../../../utils/entries/element';
import { getCropOptions, getCropLRByOptions } from '../../../utils/crop';
import {getTransferData} from '../../../../../common/utils/drag';

export const stopEvent = (event) => {
  const ev = event || window.event;
  ev.preventDefault();
  ev.stopPropagation();
};

export const getOffset = (el) => {
  let _x = 0;
  let _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
};

const convertElement = (that, currentPage, curElement, index, x, y) => {
  const { data, actions } = that.props;
  const {
    ratio,
    elements,
    paginationSpread,
    pagination,
    parameters
  } = data;
  const { width, height } = curElement;
  const eWidth = curElement.type === elementTypes.photo ? 960 : curElement.width;
  const eHeight = curElement.type === elementTypes.photo ? 640 : curElement.height;
  const step = 80;
  const viewEleWidth = eWidth * ratio.workspace;
  const viewEleHeight = eHeight * ratio.workspace;
  const viewConWidth = currentPage.get('width') * ratio.workspace;
  const viewConHeight = currentPage.get('height') * ratio.workspace;
  const containerProps = document.querySelector('.inner-sheet')
    ? getOffset(document.querySelector('.inner-sheet'))
    : getOffset(document.querySelector('.cover-sheet'));
  // 计算鼠标放开位置的真实坐标
  let viewX = x - containerProps.left;
  let viewY = y - containerProps.top;
  let xStep = index * step;
  let yStep = index * step;

  const leftPage = paginationSpread.getIn(['pages', 0]);
  const innerPageBleed = parameters.get('innerPageBleed');
  const leftPageWidth = (leftPage.get('width') - innerPageBleed.get('left') - innerPageBleed.get('right')) * ratio.workspace;

  // 如果不在当前选中page区域内，不添加元素
  if (pagination.pageIndex >= 1) {
    // 如果为右页，减去左页的宽度
    viewX -= leftPageWidth;
  }

  // 区域检测
  if (viewX <= 0) {
    viewX = 0;
  }
  if (viewY <= 0) {
    viewY = 0;
  }
  if (viewX >= viewConWidth - viewEleWidth) {
    viewX = viewConWidth - viewEleWidth;
    xStep -= 2 * step;
  }
  if (viewY >= viewConHeight - viewEleHeight) {
    viewY = viewConHeight - viewEleHeight;
    yStep -= 2 * step;
  }

  const ex = viewX / ratio.workspace + xStep;
  const ey = viewY / ratio.workspace + yStep;
  const defaultPosition = { x: ex, y: ey};

  const options = getCropOptions(width, height, eWidth * ratio.workspace, eHeight * ratio.workspace, 0);
  const { cropLUX, cropLUY, cropRLX, cropRLY } = options;
  const maxDepElement = elements.maxBy((item) => {
    return item.get('dep');
  });

  const dep = (maxDepElement ? maxDepElement.get('dep') : 0) + 1;
  let newPhotoElement;
  if (curElement.type === elementTypes.photo) {
    newPhotoElement = new Element({
      type: elementTypes.photo,
      x: defaultPosition.x,
      y: defaultPosition.y,
      width: eWidth,
      height: eHeight,
      px: defaultPosition.x / currentPage.get('width'),
      py: defaultPosition.y / currentPage.get('height'),
      pw: eWidth / currentPage.get('width'),
      ph: eHeight / currentPage.get('height'),
      encImgId: curElement.encImgId,
      imageid: curElement.imageid,
      dep,
      cropLUX,
      cropLUY,
      cropRLX,
      cropRLY
    });
  } else if (curElement.type === elementTypes.sticker) {
    newPhotoElement = {
      type: elementTypes.decoration,
      x: defaultPosition.x,
      y: defaultPosition.y,
      width: eWidth,
      height: eHeight,
      px: defaultPosition.x / currentPage.get('width'),
      py: defaultPosition.y / currentPage.get('height'),
      pw: eWidth / currentPage.get('width'),
      ph: eHeight / currentPage.get('height'),
      decorationid: curElement.guid,
      decorationtype: elementTypes.sticker,
      rot: 0,
      dep
    };
  }
  return newPhotoElement;
};

const addElements = (that, elements, x, y) => {
  const { data, actions } = that.props;
  const {
    pagination,
    paginationSpread,
  } = data;
  const { boundProjectActions } = actions;
  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');
  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });
  let newElements = [];
  elements.map((curElement, index) => {
    newElements.push(convertElement(that, currentPage, curElement, index, x, y));
  });
  boundProjectActions.createElements(currentPageId, newElements).then(()=> {
    // that.doAutoLayout();
  });
};

// drag and add elements
const addElement = (that, curElement, index, x, y) => {
  const { data, actions } = that.props;
  const {
    pagination,
    paginationSpread,
  } = data;
  const { boundProjectActions } = actions;
  const currentPageId = pagination.pageId;
  const currentPageArray = paginationSpread.get('pages');
  const currentPage = currentPageArray.find((page) => {
    return page.get('id') === currentPageId;
  });
  const newPhotoElement = convertElement(that, currentPage, curElement, 0, x, y)
  boundProjectActions.createElement(currentPageId, newPhotoElement).then(()=> {
    if (curElement.type === elementTypes.photo) {
      // that.doAutoLayout();
    }
  });
};

/**
 * 切换当前的page为工作目录.
 * @param  {object} that BookPage的this指向
 */
export const switchPage = (that, e, callback) => {
  const { actions, data } = that.props;
  const { boundPaginationActions } = actions;
  const { page, index, pagination } = data;
  const event = e || window.event;
  // event.stopPropagation();

  if (page && pagination.pageId !== page.get('id') && page.get('type') !== pageTypes.spine) {
    boundPaginationActions.switchPage(index, page.get('id')).then(() => {
      callback && callback();
    });
  }
};

function convertElements(that, nextProps, elements, ratio) {
  let outList = Immutable.List();
  const props = nextProps || that.props;
  const { elementArray } = that.state;

  elements.forEach((element) => {
    const computed = that.computedElementOptions(props, element, ratio);

    const stateElement = elementArray.find((o) => {
      return o.get('id') === element.get('id');
    });

    const extraProps = {
      isDisabled: false,
      isSelected: false
    };

    if (stateElement) {
      extraProps.isDisabled = stateElement.get('isDisabled');
      extraProps.isSelected = stateElement.get('isSelected');
    }

    outList = outList.push(
      element.merge({ computed }, extraProps)
    );
  });

  return outList;
}

export const componentWillMount = (that) => {
  const { elements, ratio } = that.props.data;
  that.setState({
    elementArray: convertElements(that, that.props, elements, ratio.workspace)
  });
};

export const componentWillReceiveProps = (that, nextProps) => {
  const oldData = that.props.data;
  const newData = nextProps.data;

  const oldElements = oldData.elements;
  const newElements = newData.elements;

  const oldRatio = oldData.ratio.workspace;
  const newRatio = newData.ratio.workspace;

  if (!Immutable.is(oldElements, newElements) || oldRatio !== newRatio) {
    const newElementArray = convertElements(that, nextProps, newElements, newRatio);

    that.setState({
      elementArray: newElementArray
    });
  }

  const oldPageId = oldData.pagination.pageId;
  const newPageId = newData.pagination.pageId;
  const page = newData.page;

  // 切换page时，取消其他page所有已选择的状态
  if (oldPageId !== newPageId && page.get('id') !== newPageId) {
    const { elementArray } = that.state;

    that.setState({
      elementArray: elementArray.map((element) => {
        return element.set('isSelected', false);
      })
    });
  }

  if (oldRatio !== newRatio) {
    that.updateOffset();
  }

  // autolayout
  const oldPhotoElementsSize = oldData.elements.filter(ele => ele.get('type') === elementTypes.photo);
  const newPhotoElementsSize = newData.elements.filter(ele => ele.get('type') === elementTypes.photo);

  // 当在sidebar上选择模板并应用时, isManualApplied会被设为true. 在这种情况下, 这里就不需要再做一次autolayout.
  const isInApplyingTemplate = get(nextProps, 'data.template.isInApplyingTemplate');

  if (!isInApplyingTemplate &&
    newPhotoElementsSize &&
    oldPhotoElementsSize &&
    oldPhotoElementsSize.size !== newPhotoElementsSize.size &&
    newPhotoElementsSize.size) {
    that.doAutoLayout(nextProps);
  }
};

export const onPageDragOver = (e) => {
  stopEvent(e);
};

export const onPageDroped = (that, e) => {
  const event = e || window.event;
  const { data, actions } = that.props;
  const {
    ratio,
    paginationSpread,
    pagination,
    parameters,
    page
  } = data;
  const x = event.pageX;
  const y = event.pageY;
  let elementsProps;
  elementsProps = getTransferData(event);

  const index = pagination.pageIndex === 1 ? 0 : 1;
  if (elementsProps.length) {
    if (page && pagination.pageId !== page.get('id') && page.get('type') !== pageTypes.spine) {
      switchPage(that, e, () => {
        addElements(that, elementsProps, x, y);
      });
    } else {
      addElements(that, elementsProps, x, y);
    }
  } else if (elementsProps.type === elementTypes.sticker) {
    if (page && pagination.pageId !== page.get('id') && page.get('type') !== pageTypes.spine) {
      switchPage(that, e, () => {
        addElement(that, elementsProps, 0, x, y);
      });
    } else {
      addElement(that, elementsProps, 0, x, y);
    }
  }
  stopEvent(event);
};

