import React from 'react';
import {observer} from 'mobx-react';
import DevTool from 'mobx-react-devtools';

import './style.scss';
import SideBar from '../SideBar';
import PageHeader from '../PageHeader';
import TimeLine from '../TimeLine';
import ProjectList from '../ProjectList';
import Loading from '../../components/Loading';

import TimeLineStore from '../../stores/TimeLineStore';
import ProjectListStore from '../../stores/ProjectListStore';

@observer
class App extends React.Component {
  render() {
    const {store} = this.props;

    return (
      <div className='App'>

        <PageHeader actions={store.actions}/>

        <SideBar
          viewMode={store.viewMode}
          onChangeViewMode={store.onChangeViewMode}/>

        <TimeLine
          store={TimeLineStore}
          isShow={store.viewMode === 'TimeLine'} />

        <ProjectList
          store={ProjectListStore}
          isShow={store.viewMode === 'ProjectList'} />

        <Loading isLoading={store.isLoading}/>

        <div>{JSON.stringify(store.selectedImages)}</div>
        <div>{JSON.stringify(TimeLineStore.selectedImages)}</div>
        <div>{JSON.stringify(ProjectListStore.selectedImages)}</div>

        {__DEVELOPMENT__
          ? <DevTool />
          : null}
      </div>
    );
  }
}

App.propTypes = {
  store: React.PropTypes.object.isRequired
};

export default App;
