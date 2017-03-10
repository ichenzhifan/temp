import React, { Component, PropTypes } from 'react';
import {
  Router,
  Route,
  IndexRedirect,
  hashHistory
} from 'react-router';
import { translate } from 'react-translate';

import PageNav from '../PageNav';
import EditPage from '../../containers/EditPage';
import ArrangePages from '../../containers/ArrangePages';
import PhotoGrouping from '../../containers/PhotoGrouping';
import SelectThemes from '../../containers/SelectThemes';
import BookOptions from '../../containers/BookOptions';

import './index.scss';

class ViewTabs extends Component {
  constructor(props) {
    super(props);

    this.trackSelectedTab = this.trackSelectedTab.bind(this);

    this.routes = (
      <Route path="/" component={PageNav}>
        <IndexRedirect to="editpage" />
        <Route
          path="editpage"
          component={EditPage}
          onEnter={this.trackSelectedTab}
        />
        <Route
          path="arragepages"
          component={ArrangePages}
          onEnter={this.trackSelectedTab}
        />
        <Route
          path="photogrouping"
          component={PhotoGrouping}
          onEnter={this.trackSelectedTab}
        />
        <Route
          path="selectthemes"
          component={SelectThemes}
          onEnter={this.trackSelectedTab}
        />
        <Route
          path="bookoptions"
          component={BookOptions}
          onEnter={this.trackSelectedTab}
        />
      </Route>
    );
  }

  trackSelectedTab(nextState, replace) {
    const { location } = nextState;
    const { actions } = this.props;
    const { boundTrackerActions } = actions;

    switch (location.pathname) {
      case '/editpage':
        boundTrackerActions.addTracker('ChangeView,EditPage');
        break;
      case '/arragepages':
        boundTrackerActions.addTracker('ChangeView,ArrangePages');
        break;
      case '/photogrouping':
        boundTrackerActions.addTracker('ChangeView,PhotoGrouping');
        break;
      case '/selectthemes':
        boundTrackerActions.addTracker('ChangeView,SelectThemes');
        break;
      case '/bookoptions':
        boundTrackerActions.addTracker('ChangeView,BookOptions');
        break;
      default:
    }
  }

  render() {
    return (
      <Router history={hashHistory} routes={this.routes} />
    );
  }
}

ViewTabs.propTypes = {
  actions: PropTypes.shape({
    boundTrackerActions: PropTypes.object.isRequired
  }).isRequired,
};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default translate('ViewTabs')(ViewTabs);
