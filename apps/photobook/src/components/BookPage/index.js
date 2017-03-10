import React, { Component } from 'react';
import { translate } from 'react-translate';
import { merge } from 'lodash';
import Immutable, { List } from 'immutable';
import classNames from 'classnames';
import { transform } from '../../../../common/utils/transform';

import { elementTypes } from '../../contants/strings';

import './index.scss';

// 导入组件
import BackgroundElement from '../BackgroundElement';
import CameoElement from '../CameoElement';
import PhotoElement from '../PhotoElement';
import DecorationElement from '../DecorationElement';
import TextElement from '../TextElement';
import XFileUpload from '../../../../common/ZNOComponents/XFileUpload';
import PhotoActionBar from '../PhotoActionBar';
import Handler from '../Handler';
import DisableHandler from '../DisableHandler';

import Rotatable from '../Rotatable';
import Resizable from '../Resizable';

import Selection from '../Selection';

// 导入处理函数
import * as elementHandler from './handler/element';
import * as pageHandler from './handler/page';
import * as draggableHandler from './handler/draggable';
import * as resizableHandler from './handler/resizable';
import * as rotatableHandler from './handler/rotatable';
import * as actionbarHandler from './handler/actionbar';
import * as actionbarEventsHandler from './handler/actionbarEvents';
import * as contextMenuEventsHandler from './handler/contextMenuEvents';
import * as autoLayoutHandler from './handler/autoLayout';


function getOffset(el) {
  if (!el) return null;
  return el.getBoundingClientRect();
}

class BookPage extends Component {
  constructor(props) {
    super(props);

    // element的相关方法.
    this.computedElementOptions = (element, ratio) => {
      return elementHandler.computedElementOptions(this, element, ratio);
    };

    // autolayout
    this.doAutoLayout = props => autoLayoutHandler.doAutoLayout(this, props);

    // bookPage基本的处理函数
    this.isCameoElement = element => pageHandler.isCameoElement(element);
    this.isPhotoElement = element => pageHandler.isPhotoElement(element);
    this.switchPage = e => pageHandler.switchPage(this, e);

    this.onPageDroped = event => pageHandler.onPageDroped(this, event);
    this.onPageDragOver = event => pageHandler.onPageDragOver(event);

    // dragable处理函数
    this.onDragStart = (data, e) => {
      return draggableHandler.onDragStart(this, data, e);
    };
    this.onDrag = (data, e, draggableData) => {
      this.showActionBar(data, e);
      return draggableHandler.onDrag(this, data, e, draggableData);
    };
    this.onDragStop = (data, e) => {
      this.showActionBar(data, e);
      return draggableHandler.onDragStop(this, data, e);
    };

    // 缩放的处理函数
    this.onResizeStart = (data, e) => {
      return resizableHandler.onResizeStart(this, data, e);
    };
    this.onResize = (data, dir, e, draggableData) => {
      this.showActionBar(data, e);
      return resizableHandler.onResize(this, data, dir, e, draggableData);
    };
    this.onResizeStop = (data, e) => {
      this.showActionBar(data, e);
      return resizableHandler.onResizeStop(this, data, e);
    };

    // 旋转的处理函数
    this.onRotateStart = (data, e) => {
      this.hideActionBar(this);
      return rotatableHandler.onRotateStart(this, data, e);
    };
    this.onRotate = (data, e, draggableData) => {
      this.showActionBar(data, e);
      return rotatableHandler.onRotate(this, data, e, draggableData);
    };
    this.onRotateStop = (data, e) => {
      return rotatableHandler.onRotateStop(this, data, e);
    };

    this.onMouseDown = (data, e) => {
      const { isRatioChanged } = this.state;
      if (isRatioChanged) {
        this.updateOffset();
        this.setState({
          isRatioChanged: false
        });
      }
      return draggableHandler.onMouseDown(this, data, e);
    };

    this.onMouseUp = () => {
      return draggableHandler.onMouseUp(this);
    };

    window.addEventListener('mouseup', this.onMouseUp);

    // 右键菜单的点击事件
    this.actionbarActions = {
      onEditImage: (element, e) => actionbarEventsHandler.onEditImage(this, element, e),
      onRotateImage: (element, e) => actionbarEventsHandler.onRotateImage(this, element, e),
      onFlipImage: (element, e) => actionbarEventsHandler.onFlipImage(this, element, e),
      onExpandToFullSheet: (element, e) => actionbarEventsHandler.onExpandToFullSheet(this, element, e),
      onExpandToLeftPage: (element, e) => actionbarEventsHandler.onExpandToLeftPage(this, element, e),
      onExpandToRightPage: (element, e) => actionbarEventsHandler.onExpandToRightPage(this, element, e),
      onFilter: (element, e) => actionbarEventsHandler.onFilter(this, element, e),
      onRemoveImage: (element, e) => actionbarEventsHandler.onRemoveImage(this, element, e),
      onUploadImage: (element, e) => actionbarEventsHandler.onUploadImage(this, element, e),
      onBringToFront: (element, e) => actionbarEventsHandler.onBringToFront(this, element, e),
      onSendToback: (element, e) => actionbarEventsHandler.onSendToback(this, element, e),
      onBringForward: (element, e) => actionbarEventsHandler.onBringForward(this, element, e),
      onSendBackward: (element, e) => actionbarEventsHandler.onSendBackward(this, element, e),
      onEditText: (element, e) => actionbarEventsHandler.onEditText(this, element, e)
    };

    this.toggleModal = (type, status) => contextMenuEventsHandler.toggleModal(this, type, status);

    this.showActionBar = () => {
      const { elementArray } = this.state;
      const selectedElementArray = elementArray.filter(o => o.get('isSelected'));

      if (selectedElementArray.size === 1) {
        const element = selectedElementArray.first();
        const elementId = element.get('id');
        const currentSelectElement = elementArray.find((item) => {
          return item.get('id') === elementId;
        });
        const html = this.renderActionBar.bind(this)(currentSelectElement);
        this.setState({
          actionBarHtml: html
        }, () => {
          actionbarHandler.showActionBar(this, element);
        });
      }
    };

    this.hideActionBar = () => {
      actionbarHandler.hideActionBar(this);
    };

    // 获取待渲染的html
    this.getRenderHtml = this.getRenderHtml.bind(this);
    this.getRenderHandlerHtml = this.getRenderHandlerHtml.bind(this);

    const { actions } = this.props;
    const { boundTextEditModalActions, boundImageEditModalActions } = actions;

    this.elementRadians = {};
    const basicActions = merge({}, actions, {
      // draggable
      onDrag: this.onDrag,
      onDragStart: this.onDragStart,
      onDragStop: this.onDragStop,

      // resizing
      onResize: this.onResize,
      onResizeStart: this.onResizeStart,
      onResizeStop: this.onResizeStop,

      // rotate
      onRotate: this.onRotate,
      onRotateStart: this.onRotateStart,
      onRotateStop: this.onRotateStop,

      onMouseDown: this.onMouseDown
    });
    const that = this;
    this.state = {
      elementArray: Immutable.List(),
      photoActions: merge({}, basicActions, {
        handleClick: this.showActionBar,
        handleDblClick: (handlerData) => {
          const { element } = handlerData;
          that.actionbarActions.onEditImage(element);
        }
      }),

      textActions: merge({}, basicActions, {
        handleClick: this.showActionBar,
        handleDblClick: (handlerData) => {
          const { element } = handlerData;
          boundTextEditModalActions.showTextEditModal({ element });
        }
      }),

      decorationActions: merge({}, basicActions, {
        handleClick: this.showActionBar
      }),

      // 右键菜单.
      actionBarHtml: '',
      actionBarData: {
        offset: {
          top: 0,
          left: 0
        },
        elementId: '',
        rotate: 0
      },
      isRatioChanged: false
    };

    this.onSelect = this.onSelect.bind(this);
    this.onSelectStop = this.onSelectStop.bind(this);
  }

  componentWillMount() {
    pageHandler.componentWillMount(this);
  }

  componentDidMount() {
    this.updateOffset();
  }

  componentWillReceiveProps(nextProps) {
    pageHandler.componentWillReceiveProps(this, nextProps);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  updateOffset() {
    this.setState({
      containerOffset: getOffset(this.bookPage)
    });
  }

  renderElement(element, index) {
    const { actions, data } = this.props;
    const { containerOffset } = this.state;
    const {
      isPreview,
      summary,
      page,
      ratio,
      paginationSpread,
      settings,
      parameters,
      size,
      pagination,
      isCameoActionBarShow
    } = data;
    const isCover = summary.get('isCover');

    switch (element.get('type')) {
      case elementTypes.cameo: {
        const cameoData = {
          summary,
          element,
          ratio,
          page,
          paginationSpread,
          setting: settings.spec,
          parameters,
          size,
          isPreview,
          isCameoActionBarShow,
          containerOffset
        };
        return <CameoElement key={index} actions={actions} data={cameoData} />;
      }
      case elementTypes.photo: {
        // 在预览模式下, 要过滤空的图片框.
        if (isPreview && !element.get('encImgId')) {
          return null;
        }

        const { photoActions, elementArray } = this.state;

        const photoData = {
          summary,
          element,
          ratio,
          page,
          paginationSpread,
          isPreview,
          pagination,
          parameters,
          elementArray,
          isCover,
          containerOffset
        };

        return (
          <PhotoElement
            key={index}
            actions={photoActions}
            data={photoData}
          />
        );
      }
      case elementTypes.text: {
        // 在预览模式下, 要过滤空的文本框.
        if (isPreview && !element.get('text')) {
          return null;
        }

        const { textActions, elementArray } = this.state;
        const textData = {
          summary,
          element,
          ratio,
          page,
          paginationSpread,
          isPreview,
          pagination,
          parameters,
          elementArray,
          isCover,
          containerOffset
        };

        return (
          <TextElement
            key={index}
            actions={textActions}
            data={textData}
          />
        );
      }
      case elementTypes.decoration: {
        const { decorationActions } = this.state;
        const decorationData = { element, ratio, page, containerOffset };

        return (
          <DecorationElement
            key={index}
            actions={decorationActions}
            data={decorationData}
          />
        );
      }
      default:
        return null;
    }
  }

  renderActionBar(element, menu, isText) {
    const menuList = menu || actionbarHandler.getMenuList(this, element) || [];
    const elements = menuList.map((item, index) => {
      const classname = `icon-item item-${item.subfix}`;
      const submenuClass = classNames('sub-menu', {
        text: item.type === 'text'
      });
      return (
        <li key={index} onClick={item.onClick}
          className={classname} title={item.label}
        >
          <label>
            <a>{ isText ? item.label : '' }</a>
          </label>
          {
            (item.sub)
            ? (
              <ul className={submenuClass}>
                { this.renderActionBar(element, item.sub, item.type === 'text') }
              </ul>
              )
            : ''
          }
        </li>
      );
    });
    return elements;
  }

  getPhotoActionBarStyle() {
    const { actionBarData, elementArray, containerOffset } = this.state;
    const { data } = this.props;
    const { page, ratio } = data;
    const pageWidth = page.get('width') * ratio.workspace;
    const pageHeight = page.get('height') * ratio.workspace;
    const bleedTop = page.getIn(['bleed', 'top']) * ratio.workspace;
    const bleedBottom = page.get('bleed', 'bottom') * ratio.workspace;
    const containerPosition = containerOffset || { left: 0, top: 0 };
    // 最顶层元素
    const topElements = List(elementArray).maxBy((item) => {
      return item.get('dep');
    });
    const zIndex = topElements ? topElements.get('dep') + 101 : 999;
     // 当前选中元素
    const currentSelectElement = elementArray.find((item) => {
      return item.get('id') === actionBarData.elementId;
    });
     // actionbar宽度
    const actionbarWidth = actionBarData.hasImage
      ? 350
      : currentSelectElement && currentSelectElement.get('type') === elementTypes.text ? 150 : 100;
     // 计算旋转后的真实坐标
    const transformRotate = transform({
      x: actionBarData.offset.left + containerPosition.left,
      y: actionBarData.offset.top + containerPosition.top,
      width: actionBarData.offset.width,
      height: actionBarData.offset.height
    }, actionBarData.rotate);

    let top = `${transformRotate.bottom + 3}px`;
    let left = `${transformRotate.left + ((transformRotate.width - actionbarWidth) / 2)}px`;

    // 边缘检测
    // left
    if (parseFloat(left) + actionbarWidth/2 <= containerPosition.left) {
      left = containerPosition.left - actionbarWidth/2;
    }
    // right
    if (parseFloat(left) + actionbarWidth >= containerPosition.left + pageWidth) {
      left = containerPosition.left + pageWidth - actionbarWidth;
    }
    //bottom
    if (parseFloat(top) >= containerPosition.top + pageHeight - bleedTop) {
      top = containerPosition.top + pageHeight - bleedTop;
    }

    return {
      display: currentSelectElement && currentSelectElement.get('isSelected') ? 'block' : 'none',
      position: 'fixed',
      top,
      left,
      width: `${actionbarWidth}px`,
      zIndex
    };
  }

  getRenderHtml() {
    const { elementArray, actionBarData } = this.state;
    const { data, t } = this.props;
    const { summary, page, ratio, isPreview, settings } = data;
    const html = [];
    const pageEnabled = page.get('enabled');
    const isPressBook = summary.get('isPressBook');
    const isCover = summary.get('isCover');

    const pageWidth = page.get('width') * ratio.workspace;
    const pageHeight = page.get('height') * ratio.workspace;

    const actionbarActions = this.actionbarActions;
    const photoActionBarStyle = this.getPhotoActionBarStyle();
    const photoActionBarData = {
      style: photoActionBarStyle,
      hasImage: actionBarData.hasImage
    };
     // backgroundElement的数据.
    const backgroundActions = {};
    const backgroundElementData = {
      element: Immutable.fromJS({
        computed: {
          width: Math.round(pageWidth),
          height: Math.round(pageHeight),
          left: 0,
          top: 0
        }
      }),
      style: {
        background: pageEnabled
          ? page.get('bgColor')
          : (isPreview ? '#fff' : '')
      },
      ratio,
      page
    };

    if (elementArray.size) {
      elementArray.forEach((element, index) => {
        if (element.get('type') === elementTypes.cameo && summary.get('cameo') === 'none') {
          // nothing to do here.
        } else {
          html.push(this.renderElement(element, index));
        }
      });
    } else if (!isPreview) {
      if (pageEnabled) {
        // 如果不是封面, 就给它添加一个默认的提示性的元素.
        const enableBackgroundElementData = merge({}, backgroundElementData, { text: t('ENABLED_BACKGROUND_TIP') });
        html.push(<BackgroundElement key="0" actions={backgroundActions} data={backgroundElementData} />);
      }
    }

     // 如果是pressbook, 并且page为disable并且是内页. 那么就直接添加一个默认的提示元素.
    if (isPressBook && !pageEnabled && !isCover) {
      const disableBackgroundElementData = merge({}, backgroundElementData, {
        text: isPreview ? ' ' : t('DISABLED_BACKGROUND_TIP')
      });
      html.push(<BackgroundElement key="0" actions={backgroundActions} data={disableBackgroundElementData} />);
    }

     // 如果有元素并且当前页不是cover, 那么就添加一个action bar的组件.
    if (elementArray.size && pageEnabled) {
      html.push(<PhotoActionBar key="PhotoActionBar" actions={actionbarActions} data={photoActionBarData}>
        {this.state.actionBarHtml}
      </PhotoActionBar>);
    }
    return html;
  }

  getRenderHandlerHtml() {
    const { data } = this.props;
    const { page, isPreview } = data;
    const pageEnabled = page.get('enabled');
    let html;

    // handler的action和data.
    const handlerActions = { handleDragOver: this.onPageDragOver, handleDrop: this.onPageDroped };
    const handlerData = {};
    const disableHandlerData = {};

    // 如果为预览模式, 一律添加disablehandler
    if (isPreview) {
      html = (<DisableHandler data={disableHandlerData} />);
    } else {
      html = pageEnabled ?
        (<Handler data={handlerData} actions={handlerActions} />)
        :
        (<DisableHandler data={disableHandlerData} />);
    }

    return html;
  }

  onSelect(selectionBox) {

  }

  onSelectStop(selectionBox) {

  }

  render() {
    const { data, actions } = this.props;
    const { boundImagesActions } = actions;
    const { page, ratio, summary } = data;

    const offset = page.get('offset');
    const pageEnabled = page.get('enabled');
    const isPressBook = summary.get('isPressBook');
    const isCover = summary.get('isCover');

    const bookPageClassName = classNames('book-page', {
      enabled: pageEnabled,
      disabled: !pageEnabled,

      cover: isCover,
      inner: !isCover,

      pressbook: isPressBook
    });

    // 对水晶封面的front page做特殊处理.
    // 该封面的front页, 左边有一小段皮.
    const left = offset.get('left');

    const bookPageStyle = {
      position: 'absolute',
      top: `${offset.get('top') * ratio.workspace}px`,
      left: `${left * ratio.workspace}px`,
      width: `${Math.round(page.get('width') * ratio.workspace)}px`,
      height: `${Math.round(page.get('height') * ratio.workspace)}px`,
      background: page.get('bgColor'),
      userSelect: 'none'
    };

    const { elementArray, containerOffset } = this.state;

    const selectedElementArray = elementArray.filter(o => o.get('isSelected'));
    const firstElement = selectedElementArray.first();

    let elementControlsStyle = {};


    let selectionProps = null;
    let degree = 0;

    if (containerOffset) {
      if (firstElement) {
        const computed = firstElement.get('computed');

        degree = firstElement.get('rot');

        elementControlsStyle = {
          width: computed.get('width'),
          height: computed.get('height'),
          left: containerOffset.left + computed.get('left'),
          top: containerOffset.top + computed.get('top'),
          transform: `rotate(${degree}deg)`
        };
      }

      selectionProps = {
        parentNode: this.bookPage,
        containerOffsetTop: containerOffset.top,
        containerOffsetLeft: containerOffset.left,
        containerOffsetWidth: containerOffset.width,
        containerOffsetHeight: containerOffset.height,
        actions: {
          onSelect: this.onSelect,
          onSelectStop: this.onSelectStop
        }
      };
    }


    return (
      <div
        ref={(div) => { this.bookPage = div; }}
        className={bookPageClassName}
        style={bookPageStyle}
        onMouseDown={this.switchPage}
        onMouseUp={this.onMouseUp}
      >
        {this.getRenderHtml()}
        {this.getRenderHandlerHtml()}

        {
          pageEnabled ? (
            <XFileUpload
              className="hide"
              boundUploadedImagesActions={boundImagesActions}
              toggleModal={this.toggleModal}
              ref="fileUpload"
            />
          ) : null
        }

        <div
          className="element-controls"
          style={elementControlsStyle}
          data-html2canvas-ignore="true"
        >
          <Rotatable
            isShown={Boolean(selectedElementArray.size)}
            rot={degree}
            actions={{
              onRotate: this.onRotate,
              onRotateStart: this.onRotateStart,
              onRotateStop: this.onRotateStop
            }}
          />
          <Resizable
            isShown={Boolean(selectedElementArray.size)}
            rot={degree}
            actions={{
              onResizeStart: this.onResizeStart,
              onResize: this.onResize,
              onResizeStop: this.onResizeStop
            }}
          />
        </div>


        { /*
          selectionProps
          ? <Selection {...selectionProps} />
          : null
        */ }
      </div>
    );
  }
}

BookPage.propTypes = {
};

BookPage.defaultProps = {
};

export default translate('BookPage')(BookPage);

