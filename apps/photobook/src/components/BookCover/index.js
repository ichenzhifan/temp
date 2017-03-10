import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import { merge } from 'lodash';
import classNames from 'classnames';
import './index.scss';

import { cameoShapeTypes, pageTypes } from '../../contants/strings';

import BookPage from '../BookPage';
import BookPageThumbnail from '../BookPageThumbnail';
import PageNumber from '../../components/PageNumber';
import DisableHandler from '../DisableHandler';

// 导入handler
import * as handler from './handler';

class BookCover extends Component {
  constructor(props) {
    super(props);

    this.getPageElements = (page, elements) => handler.getPageElements(this, page, elements);
    this.computedCoverSheet = (workspaceRatio, size, pages, pageIndex, isCrystalOrMetal) => handler.computedCoverSheet(workspaceRatio, size, pages, pageIndex, isCrystalOrMetal);
  }

  render() {
    const { actions, data } = this.props;
    const {
      boundTemplateActions,
      boundPaginationActions,
      boundProjectActions,
      boundImageEditModalActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundTextEditModalActions,
      boundPropertyModalActions,
      boundTrackerActions,
      hideCameoActionBar,
      doSnipping
    } = actions;
    const {
      thumbnail,
      urls,
      size,
      ratios,
      position,
      styles,
      pageNumberStyle,
      materials,
      variables,
      template,
      pagination,
      paginationSpread,
      settings,
      parameters,
      isPreview,
      isCameoActionBarShow
    } = data;

    const summary = paginationSpread.get('summary');
    const pages = paginationSpread.get('pages');
    const elements = paginationSpread.get('elements');
    const images = paginationSpread.get('images');

    const cameoShape = summary.get('cameoShape');
    const coverimage = variables && variables.getIn(['coverAsset', 'coverimage']);
    const effectImg = materials.getIn(['cover', 'img']);
    const bgImage = coverimage && effectImg ? `url("${urls.baseUrl}${coverimage.substring(1)}")` : '';

    const containerStyle = merge({}, {
      width: size.coverWorkspaceSize.width + 'px',
      height: size.coverWorkspaceSize.height + 'px'
    }, styles);

    const renderStyle = {
      width: size.renderCoverSize.width + 'px',
      height: size.renderCoverSize.height + 'px',
      backgroundImage: bgImage
    };

    const coverClass = classNames('book-cover item');

    // 页面元素
    const ratio = {
      workspace: ratios.coverWorkspace,
      cameoTop: cameoShape === cameoShapeTypes.rect
	    ? ratios.rectCameoPaddingTop
	    : ratios.roundCameoPaddingTop,
      cameoLeft: cameoShape === cameoShapeTypes.rect
        ? ratios.rectCameoPaddingLeft
        : ratios.roundCameoPaddingLeft
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
      boundTrackerActions,
      hideCameoActionBar,
      doSnipping
    };
    const bookPages = [];

    if (pages && pages.size) {
      pages.forEach((page, index) => {
        const pageData = {
          isPreview,
          urls,
          summary,
          page,
          images,
          elements: this.getPageElements(page, elements),
          pagination,
          ratio,
          index,
          settings,
          template,
          paginationSpread,
          parameters,
          size,
          isCameoActionBarShow
        };

        // 计算当前page的renderInnerSheetSize和renderInnerSheetSizeWithoutBleed的值.
        const isCrystalOrMetal = summary.get('isSupportHalfImageInCover');
        const coverSheetSizeObj = this.computedCoverSheet(ratios.coverWorkspace, size, pages, index, isCrystalOrMetal);

        const sheetStyle = {
          width: (coverSheetSizeObj.renderCoverSheetSizeWithoutBleed.width + 2) + 'px',
          height: (coverSheetSizeObj.renderCoverSheetSizeWithoutBleed.height + 2) + 'px',
          top: (position.render.top + coverSheetSizeObj.renderCoverSheetSizeWithoutBleed.top - 1) + 'px',
          left: (position.render.left+ coverSheetSizeObj.renderCoverSheetSizeWithoutBleed.left) + 'px'
        };

        const sheetWithBleedStyle = {
          width: coverSheetSizeObj.renderCoverSheetSize.width + 'px',
          height: coverSheetSizeObj.renderCoverSheetSize.height + 'px',
          top: (coverSheetSizeObj.renderCoverSheetSize.top ) + 'px',
          left: (coverSheetSizeObj.renderCoverSheetSize.left) + 'px'
        };

        const coverSheetClassName = classNames('cover-sheet', {
          'overflow-h': isCrystalOrMetal,
          'pointer-events-none': page.get('type') === pageTypes.spine
        });

        if (thumbnail) {
          bookPages.push(
            <div key={index} className={coverSheetClassName} style={sheetStyle}>
              <div className="cover-sheet-with-bleed" style={sheetWithBleedStyle}>
                <BookPageThumbnail actions={pageActions} data={pageData} />
              </div>
            </div>);
        } else {
          bookPages.push(
            <div key={index} className={coverSheetClassName} style={sheetStyle}>
              <div className="cover-sheet-with-bleed" style={sheetWithBleedStyle}>
                <BookPage actions={pageActions} data={pageData} />
              </div>
            </div>);
        }
      });
    }

    // disable handler的数据.
    const disableHandlerData = {
      style: {
        width: size.renderCoverSize.width + 'px',
        height: size.renderCoverSize.height + 'px',
        background: 'transparent',
        backgroundImage: ''
      }
    };

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

    const pageNumberActions = {};
    const pageNumberData = { pageNumber, pageItemStyle, style: pageNumberStyle };

    const pageNumberHtml = [];
    if (thumbnail) {
      pageNumberHtml.push();
    }

    return (
      <div key="cover" className={coverClass} style={containerStyle}>
        {/* PageNumber */}
        { thumbnail ? <PageNumber actions={pageNumberActions} data={pageNumberData} /> : null }

        <div className="cover-effect" style={renderStyle} draggable="false">
          <img className="effect-img" src={effectImg} onLoad={doSnipping} />
        </div>

        { bookPages }

        {
          isPreview ? <DisableHandler data={disableHandlerData}/> : null
        }
      </div>
    );
  }
}

BookCover.propTypes = {
};

BookCover.defaultProps = {
};

export default translate('BookCover')(BookCover);

