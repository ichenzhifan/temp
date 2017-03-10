import {action, observable} from 'mobx';

import ImageModel from '../models/ImageModel';

class Project {
  @observable
  isShowMore = false;

  @observable
  images = [];

  constructor(project = {}) {
    this.size = project.size;
    this.guid = project.guid;
    this.title = project.title;
    this.artisan = project.artisan;
    this.product = project.product;
    this.category = project.category;
    this.description = project.description;
    this.createdDate = project.createdDate;
    this.updatedDate = project.updatedDate;

    this.addImages(project.images);
  }

  @action
  addImage(image) {
    this.images.push(new ImageModel(image));
  }

  @action
  addImages(images = []) {
    images.map(image => this.addImage(image));
  }
}

export default Project
