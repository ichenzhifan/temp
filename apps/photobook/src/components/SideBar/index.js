import React, { Component, PropTypes } from 'react';
import { template, merge } from 'lodash';
import { translate } from "react-translate";
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import classNames from 'classnames';

import { onSelect } from './handler';
import PhotoTab from '../PhotoTab';
import LayoutTab from '../LayoutTab';
import DecorationTab from '../DecorationTab';
import * as layoutHandler from './handler/layout';
import './index.scss';

class SideBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabsText: [],
      numTemplate: {},
      templateList: [],
      pageSize: 8,
      page: 1,
      getMoreShow: true,
      currentFilterTag: 'top',
      isLoaded: false,
      html: ''
    };

    this.applyTemplate = (guid) => layoutHandler.applyTemplate(this, guid);
    this.sortTemplateByNum = (list) => layoutHandler.sortTemplateByNum(list);
    this.onSelectFilter = (tag) => layoutHandler.onSelectFilter(this, tag);
    this.getMore = () => layoutHandler.getMore(this);
    this.receiveProps = (nextProps) => layoutHandler.receiveProps(this, nextProps);
    this.willMount = () => layoutHandler.willMount(this);

    // 禁用默认的tabs样式.
    Tabs.setUseDefaultStyles(false);

    // 选项卡选中时的处理函数.
    this.onSelect = (selectedIndex) => onSelect(this, selectedIndex);
  }

  componentWillReceiveProps(nextProps) {
    this.receiveProps(nextProps);
  }

  render() {
    const { t, data, actions } = this.props;
    const { sidebar, paginationSpread, uploadedImages, baseUrls, stickerList, setting, imageUsedCountMap, pagination, ratio, decorationUsedCountMap } = data;
    const { toggleModal, boundImagesActions, boundProjectActions, boundTemplateActions, boundStickerActions, boundTrackerActions } = actions;
    const { currentFilterTag, isLoaded, page, templateList } = this.state;

    // TODO： 由于功能还未完善, 美国建议先隐藏
    // const tabsText = [t('PHOTOS'), t('LAYOUTS'), t('DECORATINOS')];
    const tabsText = [t('PHOTOS'), t('LAYOUTS')];

    const photoTabActions = { toggleModal, boundImagesActions, boundProjectActions, boundTrackerActions };
    const photoTabData = { uploadedImages, baseUrls, imageUsedCountMap };
    const onSelectFilter = this.onSelectFilter;
    const applyTemplate = this.applyTemplate;
    const getMore = this.getMore;
    const layoutTabActions = { boundTemplateActions, boundProjectActions, boundTrackerActions, onSelectFilter, applyTemplate, getMore };
    const layoutTabData = { paginationSpread, uploadedImages, templateList, currentFilterTag, baseUrls, setting, pagination, isLoaded, page, pagination };
    const decorationTabActions = { boundStickerActions };
    const decorationTabData = { stickerList, baseUrls, setting, decorationUsedCountMap, ratio }
    const tabs = tabsText.map((text, i) => {
      const classes = classNames('item', { 'active': i === sidebar.tabIndex });
      return (<Tab key={i} className={classes}>{text}</Tab>);
    });

    // 为 handler 中 tab 切换埋点提供 数据。
    this.tabsText = tabsText;
    return (
      <div className="side-bar">
        <Tabs onSelect={this.onSelect} selectedIndex={sidebar.tabIndex} forceRenderTabPanel={true}>
          <TabList className="list">
            {tabs}
          </TabList>

          {/* photos */}
          <TabPanel>
            <PhotoTab actions={photoTabActions} data={photoTabData} />
          </TabPanel>

          {/* layouts */}
          <TabPanel>
            <LayoutTab actions={layoutTabActions} data={layoutTabData} />
          </TabPanel>

          {/* decoration */}
          {/* TODO： 由于功能还未完善, 美国建议先隐藏.
            <TabPanel>
              <DecorationTab actions={decorationTabActions} data={decorationTabData} />
            </TabPanel>
          */}
        </Tabs>
      </div>
    );
  }
}

SideBar.propTypes = {};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default translate('SideBar')(SideBar);
