import { observable, computed, action } from 'mobx';

import { DEFAULT_ACTIONS } from '../constants';
import { loadDomainUrls } from '../serivces/EnvService';
import { loadSessionUserInfo } from '../serivces/UserService';
import ProjectListStore from './ProjectListStore';
import TimeLineStore from './TimeLineStore';

let instance = null;

class AppStore {
  constructor() {
    this.initApp();

    this.onChangeViewMode = this.onChangeViewMode.bind(this);
  }

  @observable actions = DEFAULT_ACTIONS;
  @observable viewMode = 'TimeLine';
  @observable isLoading = false;
  @observable userInfo = {};
  @observable env = {};

  /**
   * 计算属性：获取projects和timeLine所有选中的图片
   * 
   * @return {Array} Image List
   */
  @computed get selectedImages() {
    return [
      ...ProjectListStore.selectedImages,
      ...TimeLineStore.selectedImages
    ]
  }

  @action
  onChangeViewMode(view) {
    this.viewMode = view;
  }

  async initApp() {
    this.env = await loadDomainUrls();
    const {status, user} = await loadSessionUserInfo(this.env);

    if (status.code !== '200') {
      throw 'Login Failed';
    }

    this.userInfo = user;
  }

  static getInstance() {
    if(!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }
}

export default AppStore.getInstance();
