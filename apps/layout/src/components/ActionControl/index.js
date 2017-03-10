import React, { Component, PropTypes} from 'react';
import { get } from 'lodash';
import './index.scss';

class ActionControl extends Component {

  handleToFront() {
    const { elements, selectedElementIndex, actions } = this.props;
    const element = get(elements, selectedElementIndex);
    actions.elementToFront(element.id);
  }

  handleToBack() {
    const { elements, selectedElementIndex, actions } = this.props;
    const element = get(elements, selectedElementIndex);
    actions.elementToBack(element.id);
  }

  handleSetKeepRatio(keepRatio) {
    const { elements, selectedElementIndex, actions } = this.props;
    const element = get(elements, selectedElementIndex);
    actions.updateElement(element.id, {
      keepRatio
    });
  }

  handleSetLock(isLock) {
    const { elements, selectedElementIndex, actions } = this.props;
    const element = get(elements, selectedElementIndex);
    actions.updateElement(element.id, {
      isLock
    });
  }

  render() {
    const { elements, selectedElementIndex, actions, isSideBarShow } = this.props;
    const element = get(elements, selectedElementIndex);
    const keepRatio =  element && element.keepRatio ? true : false;
    const isLock =  element && element.isLock ? true : false;
    const Style = {
      left: (window.innerWidth - 1000) / 2 + 1015,
      display: isSideBarShow ? 'block' : 'none'
    };
    return (
      <div className="action-button" style={Style}>
        <div className="label-detail"><i className="glyphicon glyphicon-sort"></i> Depth</div>
        <div className="label-item" id="inputbox-oy">
          <button type="button" className="btn btn-primary btn-sm" onClick={this.handleToFront.bind(this)}>Front</button>
          <button type="button" className="btn btn-default btn-sm" onClick={this.handleToBack.bind(this)}>Back</button>
        </div>
        <div className="label-detail"><i className="glyphicon glyphicon-lock"></i> Element</div>
        <div className="label-item" id="inputbox-oy">
          <input type="radio" id="lock" name="islock" checked={isLock===true} onChange={this.handleSetLock.bind(this, true)}/> <label htmlFor="lock">Lock</label> <br />
          <input type="radio" id="unlock" name="islock" checked={isLock===false} onChange={this.handleSetLock.bind(this, false)} /> <label htmlFor="unlock">Unlock</label> <br />
        </div>
        <div className="label-detail"><i className="glyphicon glyphicon-fullscreen"></i> Scale</div>
        <div className="label-item" id="inputbox-oy">
        <input type="radio" id="keep" name="keepratio"  checked={keepRatio===true} onChange={this.handleSetKeepRatio.bind(this, true)}/> <label htmlFor="keep">Keep Ratio</label> <br />
        <input type="radio" id="free" name="keepratio" checked={keepRatio===false}  onChange={this.handleSetKeepRatio.bind(this, false)} /> <label htmlFor="free">Free Ratio</label> <br />
        </div>
      </div>
    );
  }
}

ActionControl.propTypes = {
  selectedElementIndex: PropTypes.number.isRequired,
  elements: PropTypes.array.isRequired,
  isSideBarShow: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    elementToFront: PropTypes.func.isRequired,
    elementToBack: PropTypes.func.isRequired,
    updateElement: PropTypes.func.isRequired
  })
}

export default ActionControl;
