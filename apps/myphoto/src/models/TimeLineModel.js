import {observable, action} from 'mobx';

class TimeLine {
  @observable
  title = '';

  @observable
  photos = [];

  constructor(timeLine) {
    this.title = timeLine.title;
    this.photos = timeLine.photos;
    this.addPhotos.bind(this);
  }

  @action
  addPhotos(photos) {
    this.photos = [
      ...this.photos,
      ...photos
    ]
  }
}

export default TimeLine
