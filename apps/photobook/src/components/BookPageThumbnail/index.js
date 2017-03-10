import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import { merge } from 'lodash';
import Immutable, { List } from 'immutable';
import classNames from 'classnames';
import { transform } from '../../../../common/utils/transform';

import { elementTypes } from '../../contants/strings';

import './index.scss';

// 导入组件
import BackgroundElement from '../BackgroundElement';
import CameoElementThumbnail from '../CameoElementThumbnail';
import PhotoElementThumbnail from '../PhotoElementThumbnail';
import TextElementThumbnail from '../TextElementThumbnail';
import DecorationElement from '../DecorationElement';

// 导入处理函数
import * as elementHandler from './handler/element';
import * as pageHandler from './handler/page';

class BookPageThumbnail extends Component {
  constructor(props) {
    super(props);

    // element的相关方法.
    this.computedElementOptions = (element, ratio) => {
      return elementHandler.computedElementOptions(this, element, ratio);
    };

    // 获取待渲染的html
    this.getRenderHtml = this.getRenderHtml.bind(this);

    this.elementRadians = {};

    this.state = {
      elementArray: Immutable.List(),
      photoActions: {},
      textActions: {}
    };
  }

  componentWillMount() {
    pageHandler.componentWillMount(this);
  }

  componentWillReceiveProps(nextProps) {
    pageHandler.componentWillReceiveProps(this, nextProps);
  }

  renderElement(element, index) {
    const { actions, data } = this.props;
    const { summary, page, ratio, paginationSpread, settings, parameters, size } = data;
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
          size
        };
        return <CameoElementThumbnail key={index} actions={actions} data={cameoData} />;
      }
      case elementTypes.photo: {
        // 过滤空的图片框.
        if(!element.get('encImgId')){
          return null;
        }

        const { photoActions } = this.state;

        const photoData = {
          summary,
          element,
          ratio,
          page,
          paginationSpread
        };

        return (
          <PhotoElementThumbnail
            key={index}
            actions={photoActions}
            data={photoData}
          />
        );
      }
      case elementTypes.text: {
        // 过滤空的文本框.
        if(!element.get('text')){
          return null;
        }

        const { textActions } = this.state;
        const textData = { element, ratio, page };

        return (
          <TextElementThumbnail
            key={index}
            actions={textActions}
            data={textData}
          />
        );
      }
      case elementTypes.decoration: {
        const { decorationActions } = this.state;
        const decorationData = { element, ratio, page };

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

  getRenderHtml() {
    const { elementArray, actionBarData } = this.state;
    const { data } = this.props;
    const { summary, page, ratio } = data;
    const html = [];

    if (elementArray.size) {
      elementArray.forEach((element, index) => {
        if (element.get('type') === elementTypes.cameo && summary.get('cameo') === 'none'){
          // nothing to do here.
        } else {
          html.push(this.renderElement(element, index));
        }
      });
    }

    return html;
  }

  render() {
    const { data, actions } = this.props;
    const { page, ratio, summary, paginationSpread } = data;

    const pageEnabled = page.get('enabled');
    const isCover = summary.get('isCover');
    const isPressBook = summary.get('isPressBook');
    const isCrystalOrMetal = summary.get('isSupportHalfImageInCover');

    const offset = page.get('offset');
    const handlerActions = {  };
    const handlerData = { };

    const bookPageStyle = {
      position: 'absolute',
      top: offset.get('top') * ratio.workspace + 'px',
      left: offset.get('left') * ratio.workspace + 'px',
      width: Math.round(page.get('width') * ratio.workspace) + 'px',
      height: Math.round(page.get('height') * ratio.workspace) + 'px',
      background: isPressBook && !pageEnabled && !isCover? '#fff' : page.get('bgColor')
    };

    const bookPageClassName = classNames('book-page-thumbnail');

    return (
      <div
        ref="bookPage"
        className={bookPageClassName}
        style={bookPageStyle}
      >
        {this.getRenderHtml()}
      </div>
    );
  }
}

BookPageThumbnail.propTypes = {
};

BookPageThumbnail.defaultProps = {
};

export default translate('BookPage')(BookPageThumbnail);

