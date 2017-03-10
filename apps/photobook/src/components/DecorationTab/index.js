import classNames from 'classnames';
import { translate } from 'react-translate';
import React, { Component, PropTypes } from 'react';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';

import * as handler from './handler.js';
import StickerList from '../StickerList';
import DecorationFilter from '../DecorationFilter';
import './index.scss';

class DecorationTab extends Component {
  constructor(props) {
    super(props);
    // 禁用默认的tabs样式.
    Tabs.setUseDefaultStyles(false);
    this.onSelect = this.onSelect.bind(this);

    this.state = {
      tabIndex: 0
    };
  }

  /**
 * tab切换时, 触发. 设置选中样式.
 * @param that 组件的this指向.
 * @param event
 */
  onSelect(selectedIndex) {
    this.setState({
      tabIndex: selectedIndex
    });
  }

  render() {
    const { t, data, actions } = this.props;
    const { boundStickerActions } = actions;
    const { stickerList, baseUrls, setting, decorationUsedCountMap, ratio } = data;
    const stickerListData = { stickerList, baseUrls, setting, decorationUsedCountMap, ratio }
    const stickerListActions = { stickerList, boundStickerActions }

    // TODO: 隐藏没有实现的功能.
    // const tabsText = [t('PAGE'), t('BACKGROUND'), t('STICKERS'), t('BORDERS')];
    // const tabsText = [t('PAGE'), t('STICKERS')];
    const tabsText = [t('STICKERS')];

    // 生成tab的html
    const tabs = tabsText.map((text, i) => {
      const classes = classNames('item', { 'active': i === this.state.tabIndex });
      return (<Tab key={i} className={classes}><span>{text}</span></Tab>);
    });
    return (
      <div className="decoration-tab">

        <DecorationFilter />

        <Tabs
          onSelect={this.onSelect}
          selectedIndex={this.state.tabIndex}
          forceRenderTabPanel={true}
        >
          <TabList className="list">
            {tabs}
          </TabList>

          {/*
          <TabPanel>
            pages
          </TabPanel>
          */}

          {/*
            <TabPanel>
              background
            </TabPanel>
          */}

          {/* stickers */}
          <TabPanel>
            <StickerList data={stickerListData} actions={stickerListActions}/>
          </TabPanel>

          {/*
            <TabPanel>
              borders
            </TabPanel>
          */}
        </Tabs>
      </div>
    );
  }
}

DecorationTab.proptype = {

};

export default translate('DecorationTab')(DecorationTab);
