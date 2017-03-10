import React, { Component, PropTypes } from 'react';
import { template, merge, get } from 'lodash';
import { translate } from "react-translate";
import { connect } from 'react-redux';

import {spineExpandingTopRatio} from '../../contants/strings';

// 导入selector
import { mapArragePagesDispatchToProps } from '../../selector/mapDispatch';
import { mapStateToProps } from '../../selector/mapState/editPage';

// 导入组件.
import XLoading from '../../../../common/ZNOComponents/XLoading';
import BookCover from '../../components/BookCover';
import BookSheet from '../../components/BookSheet';
import AddPagesButton from '../../components/AddPagesButton';

// 导入处理函数.
import * as arrangePagesHandler from './handler/arrangePages';

import './index.scss';

class ArrangePages extends Component {
  constructor(props) {
    super(props);
    this.onAddPages = () => arrangePagesHandler.onAddPages(this);

    // 如果封面效果图已经生成了, 那就隐藏页面loading.
    const materials = this.props.materials;
    const coverEffectImg = materials ? materials.getIn(['cover', 'img']) : null;

    this.state = {
      hasCoverRender: !!coverEffectImg
    };
  }

  componentWillReceiveProps(nextProps) {
    // 如果封面效果图已经生成了, 那就隐藏页面loading.
    const materials = nextProps.materials;
    const coverEffectImg = materials ? materials.getIn(['cover', 'img']) : null;

    this.setState({
      hasCoverRender: !!coverEffectImg
    });
  }

  render() {
    const { t,
      urls,
      materials,
      variables,
      pagination,
      settings,
      snipping,
      parameters,
      arrangePagesRatios,
      arrangePagesPosition,
      arrangePagesSize,
      allSheets,

      boundProjectActions
    } = this.props;

    // 校正一下ratios对象中的coverWorkspace的值.
    // 为了保持封面和内页的渲染高度相同, 在getRenderSize中对封面的各个size做了校正. 但是coverWorkspace
    // 还是老的值. 这里我们再次把它校验到正确的值.
    if(arrangePagesSize.coverSpreadSize.width &&
      arrangePagesRatios.coverWorkspace &&
      arrangePagesSize.coverSpreadSize.width * arrangePagesRatios.coverWorkspace !== arrangePagesSize.coverWorkspaceSize.width){
      // 重新计算preview的coverWorkspace.
      arrangePagesRatios.coverWorkspace = arrangePagesSize.coverWorkspaceSize.width / arrangePagesSize.coverSpreadSize.width;
    }

    const size = arrangePagesSize;
    const ratios = arrangePagesRatios;
    const sheets = [];

    // 最大sheet和当前的sheet总数.
    const maxSheetNumber = parameters ? parameters.getIn(['sheetNumberRange', 'max']) : 0;
    const totalSheetNumber = get(pagination, 'total');

    if(allSheets.size && this.state.hasCoverRender){
      const sheetActions = {
        boundProjectActions
      };

      // sheet容器.
      const containerWidth = size.coverWorkspaceSize.width > size.innerWorkspaceSize.width ? size.coverWorkspaceSize.width : size.innerWorkspaceSize.width;
      const containerHeight = size.coverWorkspaceSize.height > size.innerWorkspaceSize.height ? size.coverWorkspaceSize.height : size.innerWorkspaceSize.height;
      const containerStyle = {
        width: containerWidth + 'px',
        height: containerHeight + 'px'
      };

      allSheets.forEach((sheet, index)=> {
        const isCover = sheet.getIn(['summary', 'isCover']);

        const pageNumberStyle = merge({}, {
          width: isCover ? size.renderCoverSize.width + 'px': size.renderInnerSize.width + 'px',
          display: containerWidth ? 'block' : 'none'
        });

        // 如果是封面.
        if(isCover){
          const bookCoverData = {styles: containerStyle, pageNumberStyle, thumbnail: true, urls, size, ratios, position: arrangePagesPosition.cover, materials, variables, pagination, paginationSpread: sheet, settings, parameters};
          sheets.push(<BookCover key={index} actions={sheetActions} data={bookCoverData} />);
        }else{
          // 正常的内页.
          const sheetData = {styles: containerStyle, pageNumberStyle, thumbnail: true, urls, size, ratios, position: arrangePagesPosition.inner, materials, variables, pagination, paginationSpread: sheet, settings, parameters, snipping};
          sheets.push(<BookSheet key={index} actions={sheetActions} data={sheetData} />);
        }
      });

      // add pages buttons
      const addPagesData = {
        style: {
          width: size.renderInnerSheetSizeWithoutBleed.width + 'px',
          height: size.renderInnerSheetSizeWithoutBleed.height + 'px',
          marginLeft: (arrangePagesPosition.inner.render.left + 30) + 'px',
          marginTop: arrangePagesPosition.inner.sheet.top + spineExpandingTopRatio * size.renderInnerSize.height + 'px',
          lineHeight: size.renderInnerSheetSizeWithoutBleed.height + 'px',
          display: size.renderInnerSheetSizeWithoutBleed.width ? 'block' : 'none'
        }
      };

      if(totalSheetNumber < maxSheetNumber){
        const addPagesAction = {onAddPages: this.onAddPages};
        sheets.push(<AddPagesButton data={addPagesData} actions={addPagesAction}/>);
      }
    }
    return (
      <div className="arrange-pages">
        <div>
          {sheets}
        </div>
        <XLoading isShown={!this.state.hasCoverRender} />
      </div>
    );
  }
}

ArrangePages.propTypes = {};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default connect(mapStateToProps, mapArragePagesDispatchToProps)(translate('ArrangePages')(ArrangePages));
