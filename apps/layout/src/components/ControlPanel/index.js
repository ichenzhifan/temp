import React, { Component, PropTypes } from 'react';
import './index.scss';

class ControlPanel extends Component {

  handleSave() {
    const { actions } = this.props;
    const { saveProject } = actions;
    saveProject();
  }

  handlePublish() {
    const { actions } = this.props;
    const { saveProject } = actions;
    saveProject({
      isPublish: true
    });
    // boundprojectActions.updateMultiElement([
    //   {id:"f73ee758-143f-135e-f8cc-ade4aa0af5b2",x:12,y:13},
    //   {id:"6611184b-1565-36fd-5892-f447f2d9c586",x:15,y:20}]);
  }

  handleCopy() {
    const { actions } = this.props;
    const { copyProject } = actions;
    copyProject();
  }

  handleCoverDefaultChange(value) {
    const isCoverDefault = value;
    this.updateSetting({
      isCoverDefault
    });
  }

  handleBestChosenChange(value) {
    const bestChosen = value;
    this.updateSetting({
      bestChosen
    });
  }

  handleShareFlagChange(value) {
    const shareFlag = value;
    this.updateSetting({
      shareFlag
    });
  }

  updateSetting(newSetting) {
    const { actions } = this.props;
    const { updateSetting } = actions;
    updateSetting(newSetting);
  }


  render() {
    const { setting } = this.props;
    const { isCoverDefault, bestChosen, shareFlag } = setting;
    const coverDefaultFlag = isCoverDefault ? isCoverDefault : false;
    const chosenFlag = bestChosen && bestChosen==1 ? true : false;
    const isShareFlag = shareFlag && shareFlag==1 ? true : false;
    return (
      <div className="panel panel-info  panel-info canvas-panel">
          <div className="panel-heading">
              <h3 className="panel-title"><i className="glyphicon glyphicon-wrench"></i>Control Panel</h3>
          </div>
          <div className="panel-body">
            <div>
              <h5>
                <i className="glyphicon glyphicon-move"></i>
                Circle handler scaling
                <small>
                  (enable circle handler for scaling)
                </small>
              </h5>
              <div className="radio radio-block">
                <label title="circle handler can be used for scaling">
                  <input type="radio" name="scaleRadio" />
                  Enable
                </label>
              </div>
              <div className="radio radio-block">
                <label>
                  <input type="radio" name="scaleRadio"/>
                  Disable
                </label>
              </div>
            </div>

            <div>
      			  <h5><i className="glyphicon glyphicon-heart-empty"></i> The same type,size,Images total is the default </h5>
      				<div className="radio radio-block">
      					<label>
      						<input type="radio" name="defaultRadio" checked={coverDefaultFlag==true} onClick={this.handleCoverDefaultChange.bind(this, true)}/>
      						is default
      					</label>
      				</div>
      				<div className="radio radio-block">
      					<label>
      						<input type="radio" name="defaultRadio" checked={coverDefaultFlag==false} onClick={this.handleCoverDefaultChange.bind(this, false)}/>
      						not default
      					</label>
      				</div>
      			</div>

            <div>
      			  <h5><i className="glyphicon glyphicon-check"></i> Chosen for App </h5>
      			  <div className="radio radio-block">
      				  <label>
      					  <input type="radio" name="chosenRadio" checked={chosenFlag==true} onClick={this.handleBestChosenChange.bind(this, 1)}/>
      					  is chosen
      				  </label>
      			  </div>
      			  <div className="radio radio-block">
      				  <label>
      					  <input type="radio" name="chosenRadio" checked={chosenFlag==false} onClick={this.handleBestChosenChange.bind(this, 0)} />
      					  not chosen
      				  </label>
      			  </div>
      		  </div>

            <div>
      				<h5><i className="glyphicon glyphicon-share"></i> if share: </h5>
      				<div className="radio radio-block">
      					<label>
      						<input type="radio" name="shareRadio" checked={isShareFlag==true} onClick={this.handleShareFlagChange.bind(this, 1)} />
      						is share for relation
      					</label>
      				</div>
      				<div className="radio radio-block">
      					<label>
      						<input type="radio" name="shareRadio" checked={isShareFlag==false} onClick={this.handleShareFlagChange.bind(this, 0)} />
      						not share for relation
      					</label>
      				</div>
      			</div>

            <div className="button-block">
      				<a className="btn btn-sm btn-danger"
                 id="button-close"
                 href="javascript:window.opener=null;window.open('','_self');window.close();">
                <i className="glyphicon glyphicon-remove"></i> Close
              </a>
      				<a className="btn btn-sm btn-primary admin-btn"
                 id="button-save"
                 href="javascript:void(0);"
                 onClick={this.handleSave.bind(this)}>
                <i className="glyphicon glyphicon-floppy-disk"></i> Save
              </a>
      				<a className="btn btn-sm btn-primary admin-btn"
                 id="button-publish"
                 href="javascript:void(0);"
                 title="Your data will be saved automatically before publishing"
                 onClick={this.handlePublish.bind(this)}>
                <i className="glyphicon glyphicon-send"></i> Publish
              </a>
      				<a className="btn btn-sm btn-primary admin-btn"
                 id="button-copy"
                 href="javascript:void(0);"
                 onClick={this.handleCopy.bind(this)}>
                <i className="glyphicon glyphicon-plus"></i> Copy
              </a>
      			</div>
          </div>
      </div>
    );
  }
}

ControlPanel.propTypes = {
  setting: PropTypes.object.isRequired,
  selectedElementIndex: PropTypes.number.isRequired,
  elements: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    saveProject: PropTypes.func.isRequired,
    copyProject: PropTypes.func.isRequired,
    updateSetting: PropTypes.func.isRequired
  })
}

export default ControlPanel;
