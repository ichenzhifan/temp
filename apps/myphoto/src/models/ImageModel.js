import {observable, action} from 'mobx'

class Image {
  @observable isSelected = false;
  @observable name = '';

  constructor(image) {
    this.id = image.id;
    this.url = image.url;
    this.guid = image.guid;
    this.name = image.name;
    this.order = image.order;
    this.width = image.width;
    this.height = image.height;
    this.shotDate = image.shotDate;
    this.encImgId = image.encImgId;
    this.updateDate = image.updateDate;
    this.uploadDate = image.uploadDate;

    this.toggleSelect = this.toggleSelect.bind(this);
  }

  @action
  toggleSelect() {
    this.isSelected = !this.isSelected;
  }
}

export default Image
