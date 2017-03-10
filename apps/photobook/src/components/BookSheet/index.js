import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import { merge, get } from 'lodash';
import classNames from 'classnames';
import { spineExpandingTopRatio } from '../../contants/strings';

import XDrag from '../../../../common/ZNOComponents/XDrag';
import XDrop from '../../../../common/ZNOComponents/XDrop';
import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';
import './index.scss';

import BookPage from '../BookPage';
import BookPageThumbnail from '../BookPageThumbnail';
import ShadowElement from '../ShadowElement';
import PageNumber from '../../components/PageNumber';
import DisableHandler from '../DisableHandler';
import PageHover from '../PageHover';
import DragLine from '../DragLine';

// 导入handler
import * as pageHandler from './handler/page';

class BookSheet extends Component {
  constructor(props) {
    super(props);

    this.getPageElements = (page, elements) => pageHandler.getPageElements(this, page, elements);
    this.computedInnerSheet = (workspaceRatio, size, pages, pageIndex) => pageHandler.computedInnerSheet(workspaceRatio, size, pages, pageIndex);

    // 移动page时触发.
    this.onDragPageStarted = (page, ref, event) => pageHandler.onDragPageStarted(this, page, ref, event);
    this.onDragPageEnd = (event) => pageHandler.onDragPageEnd(this, event);

    // 移到page的title时触发.
    this.onDragPageTitleStarted = (sheetIndex, pageIndex, event) => pageHandler.onDragPageTitleStarted(this, sheetIndex, pageIndex, event);
    this.onDragPageTitleEnd = (sheetIndex, pageIndex, event) => pageHandler.onDragPageTitleEnd(this, sheetIndex, pageIndex, event);

    // 在目标元素上释放鼠标时触发.
    this.onDropPage = (page, event) => pageHandler.onDropPage(this, page, event);
    this.onDragLeaved = (page, event) => pageHandler.onDragLeaved(this, page, event);
    this.onDragOvered = (page, event) => pageHandler.onDragOvered(this, page, event);

    this.state = {
      // 是否显示拖拽时, 进入目标元素后的样式.
      dropPageId: null,

      // 被拖拽的page的id.
      dragPageId: null
    };
  }

  render() {
    const { data, actions } = this.props;
    const {
      boundTemplateActions,
      boundPaginationActions,
      boundProjectActions,
      boundImageEditModalActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundTextEditModalActions,
      boundPropertyModalActions,
      boundTrackerActions
    } = actions;
    const {
      urls,
      size,
      settings,
      position,
      ratios,
      variables,
      styles,
      pageNumberStyle,
      materials,
      template,
      pagination,
      paginationSpread,
      index,
      thumbnail,
      snipping,
      isPreview,
      parameters
    } = data;
    const summary = paginationSpread.get('summary');
    const pages = paginationSpread.get('pages');
    const elements = paginationSpread.get('elements');
    const images = paginationSpread.get('images');
    const shadow = paginationSpread.get('shadow');
    const isSetCoverAsInnerBg = summary.get('isSetCoverAsInnerBg');
    const sheetIndex = summary.get('sheetIndex');

    // 页面元素
    const ratio = {
      workspace: ratios.innerWorkspace
    };

    // const className = classNames('book-sheet item', {'show': pagination.sheetIndex % 3 === index});
    const className = classNames('book-sheet item');

    const containerStyle = merge({}, {
      width: size.innerWorkspaceSize.width + 'px',
      height: size.innerWorkspaceSize.height + 'px'
    }, styles);

    // 获取封面素材的地址.
    const coverimage = variables && variables.getIn(['coverAsset', 'coverimage']);
    const effectImg = materials.getIn(['cover', 'img']);
    const bgImage = isSetCoverAsInnerBg
      ? `url(${snipping.get('cover')})`
      : (coverimage && effectImg ? `url("${urls.baseUrl}${coverimage.substring(1)}")` : 'transparent');

    const sheetWithBleedPosition = {
      top: (size.renderInnerSheetSize.height - size.renderInnerSheetSizeWithoutBleed.height) / 2,
      left: (size.renderInnerSheetSize.width - size.renderInnerSheetSizeWithoutBleed.width) / 2
    };

    const renderStyle = {
      width: size.renderInnerSize.width + 'px',
      height: size.renderInnerSize.height + 'px',
      backgroundImage: bgImage,
      backgroundPosition: `${position.render.outLeft}px ${isSetCoverAsInnerBg ? position.render.outTop - 2: position.render.outTop - 5}px`,
      backgroundSize: `${size.renderInnerSize.width- position.render.outLeft * 2}px ${size.renderInnerSize.height - position.render.outTop * 2 + 10}px`
    };

    const sheetStyle = {
      width: size.renderInnerSheetSizeWithoutBleed.width + 'px',
      height: size.renderInnerSheetSizeWithoutBleed.height + 'px',
      top: position.render.top + 'px',
      left: position.render.left + 'px',
      // background: get(settings, 'bookSetting.background.color')
    };

    const sheetWithBleedStyle = {
      width: size.renderInnerSheetSize.width + 'px',
      height: size.renderInnerSheetSize.height + 'px',
      top: -sheetWithBleedPosition.top + 'px',
      left: -sheetWithBleedPosition.left + 'px'
    };

    // book page的actions和data
    const pageActions = {
      boundTemplateActions,
      boundPaginationActions,
      boundProjectActions,
      boundImageEditModalActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundTextEditModalActions,
      boundPropertyModalActions,
      boundTrackerActions
    };
    const bookPages = [];
    const handlerActions = {
      handleDragOver: this.onSheetDragOver,
      handleDrop: this.onSheetDroped
    };
    const handlerData = { };
    let isCover = false;

    if (pages.size) {
      pages.forEach((page, index) => {
        isCover = summary.get('isCover');
        const isPageDraggable = page.get('isPageDraggable');
        const isPageDropable = page.get('isPageDropable');

        const pageData = {
          urls,
          size,
          summary,
          page,
          elements: this.getPageElements(page, elements),
          template,
          pagination,
          ratio,
          paginationSpread,
          index,
          images,
          settings,
          isPreview,
          parameters
        };

        const ref = pageHandler.getRefName(sheetIndex, index);

        // 是否渲染缩略图
        if (isCover) {
          if (thumbnail) {
            bookPages.push(<BookPageThumbnail key={index} actions={pageActions} data={pageData} />);
          } else {
            bookPages.push(<BookPage key={index} actions={pageActions} data={pageData} />);
          }
        } else {
          // 计算当前page的renderInnerSheetSize和renderInnerSheetSizeWithoutBleed的值.
          const innerSheetSizeObj = this.computedInnerSheet(ratios.innerWorkspace, size, pages, index);

          const innerSheetPosition = {
            top: position.render.top + innerSheetSizeObj.renderInnerSheetSizeWithoutBleed.top,
            left: position.render.left+ innerSheetSizeObj.renderInnerSheetSizeWithoutBleed.left
          };
          const innerSheetStyle = {
            width: innerSheetSizeObj.renderInnerSheetSizeWithoutBleed.width + 'px',
            height: innerSheetSizeObj.renderInnerSheetSizeWithoutBleed.height + 'px',
            top: innerSheetPosition.top + 'px',
            left: innerSheetPosition.left + 'px'
          };

          const innerSheetWithBleedStyle = {
            width: innerSheetSizeObj.renderInnerSheetSize.width + 'px',
            height: innerSheetSizeObj.renderInnerSheetSize.height + 'px',
            top: (innerSheetSizeObj.renderInnerSheetSize.top -(size.renderInnerSheetSize.height - size.renderInnerSheetSizeWithoutBleed.height)/2) + 'px',
            left: (innerSheetSizeObj.renderInnerSheetSize.left-(size.renderInnerSheetSize.width - size.renderInnerSheetSizeWithoutBleed.width)/2) + 'px'
          };

          // pagehover
          const pageHoverStyle = {
            width: innerSheetStyle.width,
            height: innerSheetStyle.height,
            top: 0,
            left: 0
          };
          const pageHoverData = {
            style: pageHoverStyle
          };

          // drag line
          const dragLineStyle = {
            height: renderStyle.height,
            top: 0,

            // 如果为第一页, drawline需要显示在两个sheet中间.
            left: index === 0 ? (innerSheetPosition.left - (15 + position.render.left)) + 'px' : innerSheetPosition.left + 'px'
          };
          const drawLineData = {
            style: dragLineStyle,
            isShown: this.state.dropPageId === page.get('id')
          };

          // 内页.
          if (thumbnail) {
              const bookPageHtml = (<BookPageThumbnail ref={ref} actions={pageActions} data={pageData} />
            );
            const dropData = {isShowDropActive: this.state.isShowDropActive};

            bookPages.push(
              <div>
                {
                  isPageDraggable ? (
                    <DragLine data={drawLineData} />
                  ) : null
                }

                <div key={index} className="inner-sheet" style={innerSheetStyle}>
                  {
                    isPageDraggable ? (
                      <PageHover data={pageHoverData} />
                    )
                    : null
                  }

                  <div className="inner-sheet-with-bleed" style={innerSheetWithBleedStyle}>
                    {isPageDraggable ?
                      (
                        <XDrag onDragStarted={this.onDragPageStarted.bind(this, page, ref)}
                               onDragEnded={this.onDragPageEnd.bind(this)}>
                          {
                            isPageDropable ? (
                              <XDrop
                                onDroped={this.onDropPage.bind(this, page)}
                                onDragOvered={this.onDragOvered.bind(this, page)}
                                onDragLeaved={this.onDragLeaved.bind(this, page)}
                                data={dropData} >
                                {bookPageHtml}
                              </XDrop>
                            )
                            : bookPageHtml
                          }
                        </XDrag>
                      )
                      : isPageDropable ? (
                            <XDrop
                              onDroped={this.onDropPage.bind(this, page)}
                              onDragOvered={this.onDragOvered.bind(this, page)}
                              onDragLeaved={this.onDragLeaved.bind(this, page)}
                              data={dropData}>
                              {bookPageHtml}
                            </XDrop>
                          )
                          : bookPageHtml
                    }
                  </div>
                </div>
              </div>
            );
          } else {
            bookPages.push(
              <div key={index} className="inner-sheet" style={innerSheetStyle}>
                <div className="inner-sheet-with-bleed" style={innerSheetWithBleedStyle}>
                  <BookPage actions={pageActions} data={pageData} />
                </div>
              </div>
            );
          }
        }
      });
    }

    const shadowElements = [];
    // 给内页的sheet添加一个shadow.
    if (!isCover) {
      const shadowActions = {};
      const shadowData = { element: shadow, ratio };
      shadowElements.push(<ShadowElement key="shadow-element" actions={shadowActions} data={shadowData}/>);
    }

    // disable handler的数据.
    const disableHandlerData = { style: merge({}, renderStyle, { background: 'transparent' }) };

    // PageNumber
    const pageNumber = paginationSpread.get('pageNumber');
    const pageItemStyle = {
      leftStyle: {
        paddingLeft: position.render.left + 'px'
      },
      rightStyle: {
        paddingRight: position.render.left + 'px'
      }
    };

    const pageNumberActions = {
      onDragStarted: this.onDragPageTitleStarted,
      onDragEnded: this.onDragPageTitleEnd
    };
    const pageNumberData = {
      pageNumber,
      pageItemStyle,
      pages,
      style: pageNumberStyle
    };

    return (
      <div key={index} className={className} style={containerStyle}>
        {/* PageNumber */}
        { thumbnail
	        ? <PageNumber actions={pageNumberActions} data={pageNumberData} />
          : null
        }

        <div className="inner-effect" style={renderStyle} draggable="false">
          <img alt="" className="effect-img" src={materials.getIn(['inner', 'img'])} draggable="false" />
        </div>

        {/* 渲染内页的page */}
        {
          !isCover ? bookPages : null
        }

        <div className="inner-sheet no-event" style={sheetStyle}>
          <div className="inner-sheet-with-bleed" style={sheetWithBleedStyle}>
            {
              isCover ? bookPages : null
            }
            {shadowElements}
          </div>
        </div>
        {
          isPreview ? <DisableHandler data={disableHandlerData} /> : null
        }
      </div>
    );
  }
}

BookSheet.propTypes = {
};

BookSheet.defaultProps = {
};

export default translate('BookSheet')(BookSheet);

