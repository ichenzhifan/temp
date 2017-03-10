import React, { Component, PropTypes} from 'react';
import { get } from 'lodash';
import './index.scss';

class OptionsControl extends Component {

  handleWidthChange(event) {
    const { spreadOptions } = this.props;
    const width = +event.target.value;
    const pw = width / spreadOptions.oriWidth;
    this.editElement({
      width,
      pw
    });
  }

  handleHeightChange(event) {
    const { spreadOptions } = this.props;
    const height = +event.target.value;
    const ph = height / spreadOptions.oriHeight;
    this.editElement({
      height,
      ph
    });
  }

  handleRotationChange(event) {
    const rot = +event.target.value;
    this.editElement({
      rot
    });
  }

  handleXChange(event) {
    const { spreadOptions } = this.props;
    const x = +event.target.value;
    const px = x / spreadOptions.oriWidth;
    this.editElement({
      x,
      px
    });
  }

  handleYChange(event) {
    const { spreadOptions } = this.props;
    const y = +event.target.value;
    const py = y / spreadOptions.oriHeight;
    this.editElement({
      y,
      py
    });
  }

  editElement(newAttribute) {
    const { elements, selectedElementIndex } = this.props;
    const element = get(elements, selectedElementIndex);
    const { actions } = this.props;
    actions.updateElement(
      element.id,
      newAttribute
    )
  }

  render() {
    const { elements, selectedElementIndex, isSideBarShow } = this.props;
    const element = get(elements, selectedElementIndex);
    const Style = {
      left: (window.innerWidth - 1000) / 2 + 1015,
      display: isSideBarShow ? 'block' : 'none'
    };
    return (
      <div className="element-info" style={Style}>
        <div id="box-info">
          <div className="label-detail"><i className="glyphicon glyphicon-resize-horizontal"></i> Width</div>
          <div className="label-item" id="inputbox-width">
            <input type="text" className="form-control" id="input-width" onChange={this.handleWidthChange.bind(this)} value={element?element.width:0}/>
          </div>
          <div className="label-detail"><i className="glyphicon glyphicon-resize-vertical"></i> Height</div>
          <div className="label-item" id="inputbox-height">
            <input type="text" className="form-control" id="input-height" onChange={this.handleHeightChange.bind(this)} value={element?element.height:0} />
          </div>
          <div className="label-detail"><i className="glyphicon glyphicon-repeat"></i> Rotation</div>
          <div className="label-item" id="inputbox-rotate">
            <input type="text" className="form-control" id="input-rotate" onChange={this.handleRotationChange.bind(this)} value={element?element.rot:0} />
          </div>

          <div className="label-detail"><i className="glyphicon glyphicon-arrow-left"></i> Left (x)</div>
          <div className="label-item" id="inputbox-ox">
            <input type="text" className="form-control" id="input-ox" onChange={this.handleXChange.bind(this)} value={element?element.x:0} />
          </div>
          <div className="label-detail"><i className="glyphicon glyphicon-arrow-up"></i> Top (y)</div>
          <div className="label-item" id="inputbox-oy">
            <input type="text" className="form-control" id="input-oy" onChange={this.handleYChange.bind(this)} value={element?element.y:0} />
          </div>
          {/* <div className="label-detail"><i className="glyphicon glyphicon-sort"></i> Depth</div>
          <div className="label-item" id="inputbox-oy">
            <input type="text" className="form-control" id="input-oy" />
          </div> */}
        </div>
      </div>
    );
  }
}

OptionsControl.propTypes = {
  selectedElementIndex: PropTypes.number.isRequired,
  elements: PropTypes.array.isRequired,
  spreadOptions: PropTypes.object.isRequired,
  isSideBarShow: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    updateElement: PropTypes.func.isRequired
  })
}

export default OptionsControl;
