import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get, set } from 'lodash';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';

import * as envActions from '../../actions/envActions';
import * as projectActions from '../../actions/projectActions';

import PageHeader from '../../components/PageHeader';
import BasicInfo from '../../components/BasicInfo';
import ControlPanel from '../../components/ControlPanel';

import LayoutContainer from '../../components/LayoutContainer';
import OptionsControl from '../../components/OptionsControl';
import ActionControl from '../../components/ActionControl';
import TextEditor from '../../components/TextEditor';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalSwitches: {
        texteditorShow: false
      },
      textOptions: null,
      isSideBarShow: false
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.editText = this.editText.bind(this);
  }

  toggleModal(type, status) {
    const state = set(this.state, `modalSwitches.${type}`, status);
    this.setState(state);
  }

  editText(textOptions) {
    this.setState({
      textOptions
    });
  }

  render() {
    const {
      baseUrls,
      uidPk,
      elements,
      setting,
      selectedElementIndex,
      spreadOptions,
      boundEnvActions,
      boundprojectActions,
      boundElementActions
    } = this.props;
    const isSideBarShow = spreadOptions.isSidebarShow;
    const layoutProps = {
      elements,
      bgUrl: spreadOptions.bgUrl,
      baseUrls,
      spreadOptions,
      actions: {
        updateElement: boundprojectActions.updateElement,
        updateMultiElement: boundprojectActions.updateMultiElement,
        elementToFront: boundprojectActions.elementToFront,
        toggleSideBar: boundprojectActions.toggleSideBar,
        toggleModal: this.toggleModal,
        editText: this.editText
      }
    };

    const pageheaderProps = {
      uidPk,
      actions: {
        getEnv: boundEnvActions.getEnv,
        getProjectData: boundprojectActions.getProjectData,
        getSpreadInfomation: boundprojectActions.getSpreadInfomation,
        getStyleList: boundprojectActions.getStyleList
      }
    };

    const pannelProps = {
      selectedElementIndex,
      elements,
      setting,
      actions: {
        saveProject: boundprojectActions.saveProject,
        copyProject: boundprojectActions.copyProject,
        updateSetting: boundprojectActions.updateSetting
      }
    };

    const optionsProps = {
      selectedElementIndex,
      elements,
      isSideBarShow,
      spreadOptions,
      actions: {
        updateElement: boundprojectActions.updateElement
      }
    };

    const actionsProps = {
      selectedElementIndex,
      elements,
      isSideBarShow,
      actions: {
        elementToFront: boundprojectActions.elementToFront,
        elementToBack: boundprojectActions.elementToBack,
        updateElement: boundprojectActions.updateElement
      }
    };

    const texteditorProps = {
      baseUrls,
      spreadOptions,
      opened: this.state.modalSwitches.texteditorShow,
      textOptions: this.state.textOptions,
      onClosed: this.toggleModal.bind(this, 'texteditorShow', false),
      boundProjectActions: boundprojectActions
    };

    return (
      <div>
        <PageHeader {...pageheaderProps} />
        <BasicInfo setting={setting} />
        <ControlPanel {...pannelProps} />
        <OptionsControl {...optionsProps} />
        <ActionControl {...actionsProps} />
        {
          Object.keys(spreadOptions).length
          ? <LayoutContainer {...layoutProps} />
          : null
        }
        <TextEditor {...texteditorProps} />
      </div>
    );
  }
}

// 包装 component ，注入 dispatch 和 state 到其默认的 connect(select)(App) 中；
const mapStateToProps = state => ({
  uidPk: get(state, 'project.uidPk'),
  baseUrls: get(state, 'system.env.urls'),


  setting: get(state, 'project.setting'),
  selectedElementIndex: get(state, 'project.selectedElementIndex'),
  elements: get(state, 'project.spread.elements.element'),
  spreadOptions: get(state, 'project.spreadOptions'),
});

const mapDispatchToProps = dispatch => ({
  boundEnvActions: bindActionCreators(envActions, dispatch),
  boundprojectActions: bindActionCreators(projectActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
