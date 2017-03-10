import { set } from 'lodash';

function getElementIndex(that, elementId) {
  const { elementArray } = that.state;

  return elementArray.findIndex((element) => {
    return element.get('id') === elementId;
  });
}

function getElement(that, elementId) {
  const { elementArray } = that.state;
  const elementIndex = getElementIndex(that, elementId);
  return elementArray.get(elementIndex);
}

export const onRotateStart = (that, e) => {
  const { containerOffset, elementArray } = that.state;
  const containerOffsetTop = containerOffset.top;
  const containerOffsetLeft = containerOffset.left;

  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));
  const element = selectedElementArray.first();

  const elementId = element.get('id');

  const theElement = getElement(that, elementId);
  const computed = theElement.get('computed');
  const width = computed.get('width');
  const height = computed.get('height');
  const x = computed.get('left');
  const y = computed.get('top');


  const p1 = {
    x: x + containerOffsetLeft + (width / 2),
    y: y + containerOffsetTop + (height / 2),
  };

  const p2 = {
    x: e.pageX,
    y: e.pageY
  };

  const { elementRadians } = that;
  const elementRadian = elementRadians[elementId];
  const lastRadians = elementRadian
    ? elementRadian.lastRadians : (theElement.get('rot') * Math.PI) / 180;

  set(
    that,
    `elementRadians.${elementId}.startRadians`,
    Math.atan2(p2.y - p1.y, p2.x - p1.x) - lastRadians
  );
};

export const onRotate = (that, e, rotateData) => {
  const { containerOffset, elementArray } = that.state;
  const containerOffsetTop = containerOffset.top;
  const containerOffsetLeft = containerOffset.left;

  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));
  const element = selectedElementArray.first();

  const elementId = element.get('id');

  const theElementIndex = getElementIndex(that, elementId);
  const theElement = elementArray.get(theElementIndex);

  const computed = theElement.get('computed');
  const width = computed.get('width');
  const height = computed.get('height');
  const x = computed.get('left');
  const y = computed.get('top');


  const p1 = {
    x: x + containerOffsetLeft + (width / 2),
    y: y + containerOffsetTop + (height / 2),
  };

  const p2 = {
    x: e.pageX,
    y: e.pageY
  };

  const { elementRadians } = that;
  const elementRadian = elementRadians[elementId];
  const startRadians = elementRadian ? elementRadian.startRadians : 0;

  const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x) - startRadians;

  const angleDeg = Math.round(radians * (180 / Math.PI));

  let formatedDeg = 0;
  if (angleDeg < 0) {
    formatedDeg = (angleDeg % 360) + 360;
  } else {
    formatedDeg = angleDeg % 360;
  }

  set(
    that,
    `elementRadians.${elementId}.lastRadians`,
    radians
  );

  that.setState({
    elementArray: elementArray.set(
      theElementIndex, theElement.set('rot', formatedDeg)
    )
  });
};

export const onRotateStop = (that, e) => {
  const { actions } = that.props;
  const { elementArray } = that.state;
  const { boundProjectActions } = actions;

  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));
  const element = selectedElementArray.first();

  boundProjectActions.updateElement({
    id: element.get('id'),
    rot: element.get('rot')
  });
};
