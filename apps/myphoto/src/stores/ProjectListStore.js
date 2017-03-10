import {observable, action, computed} from 'mobx';

import projectsData from '../../test/data/projects';
import ProjectModel from '../models/ProjectModel';

let instance = null;

class ProjectListStore {

  @observable projects = [];

  constructor() {
    this.addProjects(projectsData);
  }

/**
 * 计算属性：获取所有projects下面选中的图片
 * 
 * @return {Array} Image List
 */
  @computed get selectedImages() {
    return this.projects.reduce((selectedImages, project) => {
      return [
        ...selectedImages,
        ...project.images.filter(image => image.isSelected)
      ]
    }, [])
  }

  @action
  createProduct() {

  }

  @action
  addProject(project) {
    this.projects.push(new ProjectModel(project));
  }
  
  @action
  addProjects(projects =[]) {
    projects.forEach((project) => {
      this.addProject(project);
    });
  }

  static getInstance() {
    if(!ProjectListStore.instance) {
      ProjectListStore.instance = new ProjectListStore();
    }
    return ProjectListStore.instance;
  }
}

export default ProjectListStore.getInstance();
