import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { merge, isEqual, get } from 'lodash';

import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';
import XSelect from '../../../../common/ZNOComponents/XSelect';
import './index.scss';

class OptionsModal extends Component {
  constructor(props) {
    super(props);
    // setting 为当前项目的信息对象，包含 size、type、product、title 等属性
    const { setting } = this.props;
    // 在 state 中为当前弹框中的数据设置缓存区
    this.state = {
      title: setting.title || '',
      type: setting.type || '',
      size: setting.size || '',
      warntipShow: false,
      warnMes: '',
      typeMap: [],
      sizeMap: [],
      isDoneClicked: false,
      isProjectTitleExists: true,
      isCheckingTitle: true
    };

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleSizeChange = this.handleSizeChange.bind(this);
    this.handleCheckTitle = this.handleCheckTitle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  // 当再一次点开的option 弹框时，根据当前 state 与 props 比较确定是否需要更新 state。
  componentWillReceiveProps(nextProps) {
    const oldSetting = this.props.setting;
    const newSetting = nextProps.setting;

    const oldOpened = this.props.opened;
    const newOpened = nextProps.opened;

    if (!isEqual(oldSetting, newSetting) || oldOpened !== newOpened) {
      this.setState(merge({}, this.state, newSetting, {
        warntipShow: false,
        isDoneClicked: false,
        isProjectTitleExists: true,
        isCheckingTitle: true
      }));
    }

    //  将源数据中的键名改为 XSelect组件需要的label 和 value 形式。
    const { optionMap } = nextProps;
    if (optionMap && optionMap.type) {
      let typeMap = [];
      let sizeMap = [];
      let squareSize = [];
      let landscapeSize = [];
      let portraitSize = [];
      // 更改typeMap 数组的键名
      typeMap = optionMap.type.map((item) => {
        return {
          value: item.id,
          label: item.name
        };
      });
      // 更改 sizeMap数组的键名
      sizeMap = optionMap.size.map((item) => {
        return {
          value: item.id,
          label: item.name
        };
      });
      // 更改 sizeMap在页面中的显示文字
      sizeMap.forEach((item) => {
        if (item.value.split('X')[0] - 0 === item.value.split('X')[1] - 0) {
          item.label = '(Square) ' + item.label;
          squareSize.push(item);
        } else if (item.value.split('X')[0] - 0 > item.value.split('X')[1] - 0) {
          item.label = '(Portrait) ' + item.label;
          portraitSize.push(item);
        } else if (item.value.split('X')[0] - 0 < item.value.split('X')[1] - 0) {
          item.label = '(Landscape) ' + item.label;
          landscapeSize.push(item);
        }
      });
      // 将 square/landscape/portrait/三种不同的size 在 sizeMap 中区分显示。
      sizeMap = squareSize.concat(landscapeSize).concat(portraitSize);
      this.setState({
        typeMap: typeMap,
        sizeMap: sizeMap
      });
    }
  }
  // 当 title 输入框内容变化时候将值 同步到 state.title
  handleTitleChange(event) {
    const title = event.target.value.trim();
    this.setState({
      title,
      warntipShow: false
    });
  }
  // 当 type 下拉框内容改变时将值同步到 state.type
  handleTypeChange(value) {
    this.setState({ type: value.value });
  }
  // 当 size 下拉框内容改变时将值同步到 state.size
  handleSizeChange(value) {
    this.setState({ size: value.value });
  }
  // 当title 输入框失焦时检验 title 格式并向服务器发送数据校验重名。
  handleCheckTitle() {
    const { boundEnvActions, userId, projectId, setting } = this.props;

    const { title } = this.state;

    if (!title) {
      this.setState({
        warntipShow: true,
        warnMes: 'Incorrect format,please try again.'
      });
      return false;
    } else if (!(/^[a-zA-Z 0-9\d_\s\-]+$/.test(title))) {
      this.setState({
        warntipShow: true,
        warnMes: 'Only letters, numbers, blank space, -(dash) and _ (underscore) are allowed in the title.' });
      return false;
    } else if (title === setting.title) {
      this.setState({
        isCheckingTitle: false,
        isProjectTitleExists: false
      });
    } else {
      boundEnvActions
      .isProjectTitleExists(userId, projectId, title).then((res) => {
        if (get(res, 'respCode') === '200') {
          this.setState({
            warntipShow: false,
            isProjectTitleExists: false,
            isCheckingTitle: false
          });
        } else {
          this.setState({
            warntipShow: true,
            warnMes: 'Title already exists, please try again.',
            isProjectTitleExists: true,
            isCheckingTitle: false
          });
        }
      });

      this.setState({
        isCheckingTitle: true
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const newIsDoneClicked = nextState.isDoneClicked;

    if (this.state.isCheckingTitle !== nextState.isCheckingTitle &&
      !nextState.isCheckingTitle && newIsDoneClicked) {
      const { title, type, size, isProjectTitleExists } = nextState;
      const {
        setting,
        onClosed,
        boundProjectActions,
      } = nextProps;

      if (!isProjectTitleExists) {
        const submitData = {};
        if (title !== setting.title) {
          submitData.title = title;
        }
        if (type !== setting.type) {
          submitData.type = type;
        }
        if (size !== setting.size) {
          submitData.size = size;
        }

        // 仅当title/type/size 三项至少有一项发生变化时才发送 action。
        if (Object.keys(submitData).length) {
          if (submitData.type || submitData.size) {
            if (window.confirm('This operation will remove all elements,' +
              ' would you like to continue?')) {
              boundProjectActions.changeProjectSetting(submitData);
            }
          } else {
            boundProjectActions.changeProjectSetting(submitData);
          }
        }

        // 关闭当前 options 弹窗组件
        onClosed();
      }
    }
  }

  handleSubmit() {
    this.handleCheckTitle();
    this.setState({
      isDoneClicked: true
    });
  }

  render() {
    const { onClosed, opened } = this.props;
    const { title, type, size, typeMap, sizeMap } = this.state;

    const className = classNames('format-tip', { 'show-inline': this.state.warntipShow });
    return (
      <XModal
        className="options-modal"
        onClosed={onClosed}
        opened={opened}
      >
        <div className="option-modal-name">Options</div>
        <div className="options-modal-title">
          <p className={className}>{this.state.warnMes}</p>
          <label htmlFor="options-modal-title" >Title:</label>
          <input
            type="text"
            id="options-modal-title"
            value={title}
            onChange={this.handleTitleChange}
          />
        </div>
        <div className="options-modal-panneltype">
          <label>Panel Type:</label>
          <div className="select-wrap">
            <XSelect
              options={typeMap}
              searchable={false}
              onChanged={this.handleTypeChange}
              value={type}
            />
          </div>
        </div>
        <div className="options-modal-size">
          <label>Size:</label>
          <div className="select-wrap">
            <XSelect
              options={sizeMap}
              searchable={false}
              onChanged={this.handleSizeChange}
              value={size}
            />
          </div>
        </div>
        <div className="options-modal-button">
          <XButton
            onClicked={this.handleSubmit}
            disabled={!title || !title.length}
          >Done</XButton>
        </div>
      </XModal>
   );
  }
}

OptionsModal.propTypes = {
  optionMap: PropTypes.object,
  setting: PropTypes.object.isRequired,
  boundProjectActions: PropTypes.object.isRequired,
  boundEnvActions: PropTypes.object.isRequired,
  userId: PropTypes.number.isRequired,
  projectId: PropTypes.number.isRequired,
  onClosed: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired
};

export default OptionsModal;
