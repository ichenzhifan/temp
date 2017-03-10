 import React, { Component, PropTypes } from 'react';
 import { connect } from 'react-redux';
 import { translate } from 'react-translate';
 import Immutable, { Map } from 'immutable';
 import { get, merge, pick } from 'lodash';
 import classNames from 'classnames';

// 导入selector
 import { mapEditPageDispatchToProps } from '../../selector/mapDispatch';
 import { mapStateToProps } from '../../selector/mapState/editPage';

 import './index.scss';

// 导入组件
 import XPagination from '../../../../common/ZNOComponents/XPagination';
 import XLoading from '../../../../common/ZNOComponents/XLoading';
 import ActionBar from '../../components/ActionBar';
 import Undo from '../../components/Undo';
 import SheetsList from '../../components/SheetsList';
 import CameoPaintedButtons from '../../components/CameoPaintedButtons';
 import PageNumberIcon from '../../components/PageNumberIcon';

// 导入handler
 import * as handler from './handler/editPage';
 import * as actionBarHandler from './handler/actionBar';
 import * as cameoHandler from './handler/cameo';
 import * as paginationHandler from './handler/pagination';
 import * as templateHandler from './handler/template';
 import * as snippingHandler from './handler/snipping';
 import * as autoLayoutHandler from './handler/autoLayout';
 import * as saveLayoutHandler from './handler/saveLayout';

 import { checkIsSupportFullImageInCover, checkIsSupportHalfImageInCover } from '../../utils/cover';
 import { productTypes, coverTypes, elementTypes } from '../../contants/strings';

 class EditPage extends Component {
  constructor(props) {
    super(props);

    // 判断是否已有render图.
    const materials = this.props.materials;
    const coverEffectImg = materials ? materials.getIn(['cover', 'img']) : null;

    // 内部state.
    this.state = {
      loading: {
        isShown: false
      },
      hasCoverRender: !!coverEffectImg,
      isCameoActionBarShow: false,
      isSettingloaded: false,
      isSavingLayout: false,
      cameo: {
        cameo: 'M',
        cameoShape: 'Rect'
      }
    };

    // 自动选择模板.
    this.doAutoLayout = autoFillData => autoLayoutHandler.doAutoLayout(this, autoFillData);

    // 截图.
    this.doSnipping = () => snippingHandler.doSnipping(this);

    // 翻页时的处理函数.
    this.switchSheet = (param) => {
      paginationHandler.switchSheet(this, param);
    };

    // 切换page到指定的页面.
    this.switchPageTo = (pageIndex) => {
      paginationHandler.switchPageTo(this, pageIndex);
    };

    // action bar的处理函数
    this.actionBarHandler = {
      onDesignSetting: () => {
        actionBarHandler.onDesignSetting(this);
      },
      onAutoFill: () => {
        actionBarHandler.onAutoFill(this);
      },
      onAddText: () => {
        actionBarHandler.onAddText(this);
      },
      onAddFrame: () => {
        actionBarHandler.onAddFrame(this);
      },
      onFlipHorizontally: () => {
        actionBarHandler.onFlipHorizontally(this);
      },
      onFlipVertically: () => {
        actionBarHandler.onFlipVertically(this);
      },
      onUndo: () => {
        actionBarHandler.onUndo(this);
      },
      onRedo: () => {
        actionBarHandler.onRedo(this);
      },
      onClearAllImages: () => {
        actionBarHandler.onClearAllImages(this);
      },
      onRemoveAllFrames: () => {
        actionBarHandler.onRemoveAllFrames(this);
      },
      onRemoveSheet: () => {
        actionBarHandler.onRemoveSheet(this);
      },
      onRestart: () => {
        actionBarHandler.onRestart(this);
      },
      onAddToFront: () => {
        actionBarHandler.onAddToFront(this);
      },
      onAddToBack: () => {
        actionBarHandler.onAddToBack(this);
      },
      onAddAfterThisPage: () => {
        actionBarHandler.onAddAfterThisPage(this);
      },
      onAddBeforeThisPage: () => {
        actionBarHandler.onAddBeforeThisPage(this);
      },
      onSaveLayout: () => {
        saveLayoutHandler.handleSaveTemplate(this);
      },
      onChangeBgColor: () => {
        actionBarHandler.onChangeBgColor(this);
      }
    };

    // cameo, painted text按钮的处理函数.
    this.onAddCameo = event => cameoHandler.onAddCameo(this, event);
    this.hideCameoActionBar = () => cameoHandler.hideCameoActionBar(this);
    this.onRemoveCameo = () => cameoHandler.onRemoveCameo(this);
    this.onAddPaintedText = () => cameoHandler.onAddPaintedText(this);
    this.onSaveTemplate = () => templateHandler.onSaveTemplate(this);
  }

  componentWillMount() {
    const pageIndex = get(this.props, 'pagination.pageIndex');
    const pageId = get(this.props, 'pagination.pageId');

    // 如果pageIndex无效或pageId为空, 就重新切换到有效的页面.
    if (pageIndex === -1 || !pageId) {
      paginationHandler.switchPage(this, this.props);
    }

    // 如果为PressBook，且Cover为Linen cover和Leatherette自动添加天窗
    if (get(this.props,'settings.spec.product') === productTypes.PS && [coverTypes.PSNC, coverTypes.PSLC].indexOf(get(this.props,'settings.spec.cover'))>=0) {
      const allElements = this.props.allElements;
      const cameoElement = allElements.find(element => {
        return element.get('type') === elementTypes.cameo;
      });
      // 如果还未添加过天窗则添加天窗
      if (!cameoElement && get(this.props, 'settings.spec.cameo')) {
        this.onAddCameo();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const watchArr = ['cover', 'gilding', 'leatherColor', 'paper', 'paperThickness', 'product', 'size'];
    // 当sheetIndex变化时, 更新pageId.
    const oldSheetIndex = get(this.props, 'pagination.sheetIndex');
    const newSheetIndex = get(nextProps, 'pagination.sheetIndex');

    if (oldSheetIndex !== newSheetIndex) {
      paginationHandler.switchPage(this, nextProps);
    }

    // 初始化pageId
    // 在插入新的pages后, 也需要switchPage. 这里检测sheet total是否发生变化.
    const oldPages = this.props.paginationSpread.get('pages');
    const newPages = nextProps.paginationSpread.get('pages');
    const oldPageId = get(this.props, 'pagination.pageId');

    const oldSheetsTotal = get(this.props, 'pagination.total');
    const newSheetsTotal = get(nextProps, 'pagination.total');

    const oldSpec = Map(pick(get(this.props, 'settings.spec'), watchArr));
    const newSpec = Map(pick(get(nextProps, 'settings.spec'), watchArr));

    const isProjectLoadCompleted = nextProps.project.get('isProjectLoadCompleted');

    if (((!Immutable.is(oldPages, newPages) && newPages.size && !oldPageId) || oldSheetsTotal !== newSheetsTotal) && isProjectLoadCompleted) {
      paginationHandler.switchPage(this, nextProps);
    }

    // 程序的启动时, 会初始化project两次. 这就导致了pagination上的pageId没有同步的问题.
    // 解决方案是: 等project加载完毕后, 我们再初始化pagination.
    const newPageId = get(nextProps, 'pagination.pageId');
    if(isProjectLoadCompleted && !newPageId){
      paginationHandler.switchPage(this, nextProps);
    }

    // 判断是否需要截图.
    const oldPaginationSpreadForCover = get(this.props, 'paginationSpreadForCover');
    const newPaginationSpreadForCover = get(nextProps, 'paginationSpreadForCover');
    if (!Immutable.is(oldPaginationSpreadForCover, newPaginationSpreadForCover) &&
      newSheetIndex === 0) {
      this.doSnipping();
    }

    // 如果封面效果图已经生成了, 那就隐藏页面loading.
    const materials = nextProps.materials;
    const coverEffectImg = materials ? materials.getIn(['cover', 'img']) : null;
    if(coverEffectImg){
      this.setState({
        hasCoverRender: true
      });
    }
  }

  render() {
    const {
      undoData,
      urls,
      size,
      ratios,
      settings,
      template,
      snipping,
      position,
      materials,
      variables,
      pagination,
      paginationSpread,
      parameters,
      project,
      allImages,

      // actions
      boundTodoActions,
      boundRandomActions,
      boundProjectActions,
      boundPaginationActions,
      boundImageEditModalActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundTextEditModalActions,
      boundPropertyModalActions,
      boundTrackerActions,
      boundTemplateActions
    } = this.props;

    const { isCameoActionBarShow } = this.state;
    const hideCameoActionBar = this.hideCameoActionBar;

    // 封装actions方法到一个对象, 以减少组件属性的传递.
    // 顶部导航方法与数据

    // 封装actions方法到一个对象, 以减少组件属性的传递.
    // 顶部导航方法与数据
    const spreadsListActions = {
      boundProjectActions,
      boundPaginationActions,
      boundImageEditModalActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundTextEditModalActions,
      boundPropertyModalActions,
      boundTrackerActions,
      boundTemplateActions,
      hideCameoActionBar,
      doSnipping: this.doSnipping
    };

    // 校正一下ratios对象中的coverWorkspace的值.
    // 为了保持封面和内页的渲染高度相同, 在getRenderSize中对封面的各个size做了校正. 但是coverWorkspace
    // 还是老的值. 这里我们再次把它校验到正确的值.
    if(size.coverSpreadSize.width &&
      ratios.coverWorkspace &&
      size.coverSpreadSize.width * ratios.coverWorkspace !== size.coverWorkspaceSize.width){
      ratios.coverWorkspace = size.coverWorkspaceSize.width / size.coverSpreadSize.width;
    }

    const spreadsListData = { urls, size, ratios, position, materials, paginationSpread, variables, template, pagination, settings, project, parameters, snipping, isCameoActionBarShow, allImages };
    // 封装actions方法到一个对象, 以减少组件属性的传递.
    // 顶部导航方法与数据
    const summary = paginationSpread.get('summary');
    const pages = paginationSpread.get('pages');
    const page = pages.find(p => p.get('id') === summary.get('pageId'));
    const cameoPaintedActions = {
      onAddCameo: this.onAddCameo,
      onRemoveCameo: this.onRemoveCameo,
      onAddPaintedText: this.onAddPaintedText,
      onSaveTemplate: this.onSaveTemplate
    };
    const isCover = summary.get('isCover');
    const isPressBook = summary.get('isPressBook');
    const isSupportHalfImageInCover = summary.get('isSupportHalfImageInCover');

    const cameoPaintedStyle = {
      width: summary.get('isCover') ? `${size.renderCoverSheetSizeWithoutBleed.width}px` : `${size.renderInnerSheetSize.width}px`
    };

    const cameoPaintedData = {
      isShowCameo: variables && isCover && get(settings, 'spec.product') !== productTypes.PS ? variables.get('cameoSupportCondition') : false,
      isShowAddCameoBtn: !summary.get('hasCameoElement') && isCover,

      // TODO: painted text在第一期不做.
      // isShowPaintedText: variables && isCover ? variables.get('paintedTextSupportCondition'): false,
      isShowPaintedText: false,

      // isShowSaveTemplate: !isCover,
      isShowSaveTemplate: false,
      style: cameoPaintedStyle
    };

    // 翻书组件的样式.
    const paginationStyle = {
      marginTop: size.renderCoverSheetSize.width < 900 ? '10px' : '-24px'
    };
    const paginationActions = { onPage: this.switchSheet };
    const paginationData = {
      total: pagination.total,
      current: pagination.sheetIndex,
      style: paginationStyle,
      isPressBook
    };

    // 只要当spread有值的时候, 才显示画布.
    const className = classNames('edit-page', { hide: !pages.size });

    const product = get(settings, 'spec.product');
    const { sheetIndex, total } = pagination;

    const minSheetNumber = project.getIn(
      ['parameterMap', 'sheetNumberRange', 'min']
    );
    const maxSheetNumber = project.getIn(
      ['parameterMap', 'sheetNumberRange', 'max']
    );

    const pageEnabled = page ? page.get('enabled') : true;
    const disableSaveLayout = !pageEnabled || (isSupportHalfImageInCover && isCover) || this.state.isSavingLayout;

    const disableInsertAfterSheet = (isPressBook && sheetIndex === 0) ||
      (isPressBook && sheetIndex === total);
    const disableInsertBeforeSheet = (sheetIndex === 0) ||
      (isPressBook && sheetIndex === 1);
    const disableInsertAfterBook = (isPressBook && sheetIndex === total);

    const actionsBarActions = merge({}, this.actionBarHandler, { boundTrackerActions });
    const actionBarData = {
      disableAddText: !pageEnabled,
      disableAddFrame: !pageEnabled,
      disableFlip: !pageEnabled,
      disableAddSheet: total >= maxSheetNumber,
      addSheetPanel: {
        disableAddToBack: disableInsertAfterBook,
        disableAddToAfter: disableInsertAfterSheet,
        disableAddToBefore: disableInsertBeforeSheet,
      },
      cleanUpPanel: {
        disableClearAllImages: false,
        disableRemoveAllFrames: isPressBook && summary.get('isCover') &&
          [coverTypes.PSNC, coverTypes.PSLC].indexOf(get(settings, 'spec.cover')) !== -1,
        disableRemoveSheet: summary.get('isCover') ||
         total <= minSheetNumber || (isPressBook && sheetIndex === 1) ||
         (isPressBook && sheetIndex === total),
        disableRestart: false,
      },
      disableSaveLayout,
      disableChangeBgColor: !pageEnabled,
      isPressBook
    };

    // pageNumber
    const pageNumber = paginationSpread.get('pageNumber');
    const pageNumberStyle = {
      width: summary.get('isCover') ?
      `${size.renderCoverSheetSizeWithoutBleed.width}px` :
      `${size.renderInnerSheetSize.width}px`
    };
    const pageNumberActions = { switchPage: this.switchPageTo };
    const pageNumberData = { pageNumber, style: pageNumberStyle };

    // sheet容器.
    const containerWidth = size.renderCoverSize.width > size.renderInnerSize.width ? size.renderCoverSize.width : size.renderInnerSize.width;
    const containerHeight = size.renderCoverSize.height > size.renderInnerSize.height ? size.renderCoverSize.height : size.renderInnerSize.height;

    // 加一个container容器, 为了使封面和内页渲染在相同大小的容器内.
    const sheetsContainerStyle = {
      width: containerWidth + 'px',
      height: containerHeight + 'px',
      margin: '0 auto'
    };

    const wrapStyle = {
      display: this.state.hasCoverRender ? 'block' : 'none'
    };

    return (
      <div className={className}>
        <div style={wrapStyle}>
          {/* action bar */}
          <ActionBar actions={actionsBarActions} data={actionBarData} />

          {/* sheets list */}
          <div style={sheetsContainerStyle}>
            <SheetsList actions={spreadsListActions} data={spreadsListData} />
          </div>

          <div className="btns-list">
            {/* page序号 */}
            {
              summary.get('isPressBook') && !summary.get('isCover')?
              (<PageNumberIcon actions={pageNumberActions} data={pageNumberData} />) : null
            }

            {/* 添加cameo, painted-text 按钮. */}
            <CameoPaintedButtons actions={cameoPaintedActions} data={cameoPaintedData} />

            {/* 翻页组件. */}
            <XPagination actions={paginationActions} data={paginationData} />
          </div>
        </div>

        {/* loading */}
        <XLoading isShown={this.state.loading.isShown || !this.state.hasCoverRender} />
      </div>
    );
  }
}

 EditPage.propTypes = {};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default connect(mapStateToProps, mapEditPageDispatchToProps)(translate('EditPage')(EditPage));
