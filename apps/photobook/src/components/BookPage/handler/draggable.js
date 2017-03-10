import Immutable from 'immutable';
import { merge } from 'lodash';

export const onDragStart = (that, data, e) => {
  that.isDragging = true;
  that.startDragPosition = {
    x: e.pageX,
    y: e.pageY
  };
};

function moveElement(that, deltaX, deltaY) {
  const { elementArray } = that.state;
  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));
  let newElementArray = Immutable.List();
  if (selectedElementArray.size) {
    elementArray.forEach((element) => {
      if (element.get('isSelected')) {
        const computed = element.get('computed');
        const newElement = element.set('computed', computed.merge({
          left: computed.get('left') + deltaX,
          top: computed.get('top') + deltaY
        }));

        newElementArray = newElementArray.push(newElement);
      } else {
        newElementArray = newElementArray.push(element);
      }
    });

    that.setState({
      elementArray: newElementArray
    });
  }
}

function updateElementPosition(that) {
  const { elementArray } = that.state;
  const { data, actions } = that.props;
  const { boundProjectActions } = actions;
  const { ratio, page } = data;
  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));

  let updateObjectArray = Immutable.List();
  selectedElementArray.forEach((element) => {
    const computed = element.get('computed');
    const x = computed.get('left') / ratio.workspace;
    const y = computed.get('top') / ratio.workspace;

    if ((x !== element.get('x') || y !== element.get('y'))) {
      updateObjectArray = updateObjectArray.push(Immutable.Map({
        id: element.get('id'),
        x,
        y,
        px: x / page.get('width'),
        py: y / page.get('height')
      }));
    }
  });

  if (updateObjectArray.size) {
    boundProjectActions.updateElements(updateObjectArray);
  }
}


export const onDrag = (that, data, e, draggableData) => {
  if (!that.isDragging) return;
  const deltaX = e.pageX - that.startDragPosition.x;
  const deltaY = e.pageY - that.startDragPosition.y;

  that.startDragPosition = {
    x: e.pageX,
    y: e.pageY
  };

  moveElement(that, deltaX, deltaY);
};

export const onDragStop = (that, data, e) => {
  that.isDragging = false;

  updateElementPosition(that);

  e.stopPropagation();
};


function selectSingleElement(that, id) {
  const { elementArray } = that.state;
  let newElementArray = Immutable.List();

  elementArray.forEach((element) => {
    if (element.get('id') === id) {
      newElementArray = newElementArray.push(element.set('isSelected', true));
    } else {
      newElementArray = newElementArray.push(element.set('isSelected', false));
    }
  });

  that.setState({
    elementArray: newElementArray
  });
}

export const onMouseDown = (that, data, e) => {
  const { element } = data;
  const elementId = element.get('id');

  selectSingleElement(that, elementId);
};

export const onMouseUp = (that) => {
  const { elementArray } = that.state;
  let newElementArray = Immutable.List();
  elementArray.forEach((element) => {
    newElementArray = newElementArray.push(
      element.set('isSelected', false)
    );
  });

  that.setState({
    elementArray: newElementArray
  });
};
