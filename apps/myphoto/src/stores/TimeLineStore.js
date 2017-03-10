import {observable, computed, action} from 'mobx';
import ImageModel from '../models/ImageModel';
import TimeLineModel from '../models/TimeLineModel';

class TimeLineStore {

  imageGroups = [
    {title: '2017-1-2', photos: [
      {url: 'test1', title: 'test1'},
      {url: 'test2', title: 'test2'}
    ]},
    {title: '2017-1-1', photos: [
      {url: 'test1', title: 'test3'},
      {url: 'test2', title: 'test4'}
    ]},
    {title: '2017-1-3', photos: [
      {url: 'test1', title: 'test5'},
      {url: 'test2', title: 'test6'}
    ]},
    {title: '2017-1-2', photos: [
      {url: 'test1', title: 'test5'},
      {url: 'test2', title: 'test6'}
    ]}
  ];

  constructor() {
    this.sort.bind(this);
    this.addPhotos.bind(this);
  
    this.addPhotos(this.imageGroups);
    this.sort();
  }

  @observable timeLines = [];
  @observable orderBy = 'title';
  @observable orderDir = 'desc';

  @computed
  get selectedImages() {
    return []
  }

  @action
  sort() {
    this.timeLines.sort((preTime, nextTime) => {
      const result = preTime[this.orderBy] > nextTime[this.orderBy] ? 1 : -1;
      return result * (this.orderDir === 'desc' ? 1 : -1);
    });
  }

  @action
  addPhotos(imageGroups = []) {
    for(let imageGroup of imageGroups) {

      const groupDate = imageGroup.title;
      const groupPhotos = imageGroup.photos;
      const tIndex = this.timeLines.findIndex(timeLine => timeLine.title === groupDate);

      if(tIndex !== -1) {
        this.timeLines[tIndex].addPhotos(groupPhotos);
      } else {
        this.timeLines.push(new TimeLineModel(imageGroup));
      }

    }
  }
}

export default new TimeLineStore()
