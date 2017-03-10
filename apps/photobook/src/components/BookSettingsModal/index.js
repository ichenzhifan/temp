import React, { Component, PropTypes } from 'react';
import { template } from 'lodash';

import { GET_FONT_THUMBNAIL } from '../../contants/apiUrl';


import XSelect from '../../../../common/ZNOComponents/XSelect';
import XSlider from '../../../../common/ZNOComponents/XSlider';
import XModal from '../../../../common/ZNOComponents/XModal';
import XColorPicker from '../../../../common/ZNOComponents/XColorPicker';
import XButton from '../../../../common/ZNOComponents/XButton';
import FontUrl from '../../components/FontUrl';

import './index.scss';

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 120;

class BookSettingsModal extends Component {
  constructor(props) {
    super(props);

    const { fontList, bookSetting, baseUrl } = this.props;
    const avaiableFontList = fontList.filter(font => !font.deprecated);

    const fontOptionList = avaiableFontList.map((font) => {
      return {
        title: font.displayName,
        label: font.displayName,
        value: font.id,
        fontThumbnailUrl: template(GET_FONT_THUMBNAIL)({
          baseUrl,
          fontName: font.name
        })
      };
    });


    const layoutOptionList = [
      {
        value: true,
        label: 'Open'
      },
      {
        value: false,
        label: 'Close'
      }
    ];

    const fontSetting = bookSetting.get('font');
    this.state = {
      defaultBgColor: bookSetting.getIn(['background', 'color']),
      defaultFontSize: fontSetting.get('fontSize'),
      defaultFontColor: fontSetting.get('color'),
      defaultFontName: fontSetting.get('fontFamilyId'),
      defaultFontWeight: fontSetting.get('fontId'),
      defaultLayout: bookSetting.get('autoLayout'),
      inputSize: fontSetting.get('fontSize'),
      fontOptionList,
      layoutOptionList
    };

    this.onSliderChange = this.onSliderChange.bind(this);
    this.onSizeInputChange = this.onSizeInputChange.bind(this);
    this.onSizeInputBlur = this.onSizeInputBlur.bind(this);

    this.onFontNameChange = this.onFontNameChange.bind(this);
    this.onFontWeightChange = this.onFontWeightChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);

    this.onBgColorChange = this.onBgColorChange.bind(this);
    this.onFontColorChange = this.onFontColorChange.bind(this);

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const oldIsShown = this.props.isShown;
    const newIsShown = nextProps.isShown;

    if (oldIsShown !== newIsShown && newIsShown) {
      const bookSetting = nextProps.bookSetting;
      const fontSetting = bookSetting.get('font');

      const { fontList, baseUrl } = this.props;

      const selectedFont = fontList.find((font) => {
        return font.id === fontSetting.get('fontFamilyId');
      });

      if (selectedFont.deprecated) {
        const fontOptionList = fontList.map((font) => {
          return {
            disabled: font.deprecated,
            title: font.displayName,
            label: font.displayName,
            value: font.id,
            fontThumbnailUrl: template(GET_FONT_THUMBNAIL)({
              baseUrl,
              fontName: font.name
            })
          };
        });

        this.setState({
          fontOptionList
        });
      }

      const fontWeightOptionList = selectedFont.font.map((o) => {
        const displayName = o.displayName.replace(/\s*\d+/, '');
        return {
          disabled: selectedFont.deprecated,
          title: displayName,
          label: displayName,
          value: o.id
        };
      });

      this.setState({
        defaultBgColor: bookSetting.getIn(['background', 'color']),
        defaultFontSize: fontSetting.get('fontSize'),
        defaultFontColor: fontSetting.get('color'),
        defaultFontName: fontSetting.get('fontFamilyId'),
        defaultFontWeight: fontSetting.get('fontId'),
        defaultLayout: bookSetting.get('autoLayout'),
        inputSize: fontSetting.get('fontSize'),
        fontWeightOptionList
      });
    }
  }

  onSliderChange(fontSize) {
    this.setState({
      defaultFontSize: fontSize,
      inputSize: fontSize
    });
  }

  onSizeInputChange(e) {
    const inputValue = e.target.value.trim();

    this.setState({
      inputSize: inputValue
    });
  }

  onSizeInputBlur(e) {
    const inputValue = +e.target.value;

    let fontSize = inputValue;
    if (inputValue > MAX_FONT_SIZE) {
      fontSize = MAX_FONT_SIZE;
    } else if (inputValue < MIN_FONT_SIZE) {
      fontSize = MIN_FONT_SIZE;
    }

    this.setState({
      inputSize: fontSize,
      defaultFontSize: fontSize
    });
  }

  onFontNameChange(selectedOption) {
    const { fontList } = this.props;
    const selectedFont = fontList.filter((font) => {
      return font.id === selectedOption.value;
    })[0];

    const fontWeightOptionList = selectedFont.font.map((o) => {
      const displayName = o.displayName.replace(/\s*\d+/, '');
      return {
        title: displayName,
        label: displayName,
        value: o.id
      };
    });

    this.setState({
      defaultFontName: selectedOption.value,
      defaultFontWeight: selectedFont.font[0].id,
      fontWeightOptionList
    });
  }

  onFontWeightChange(selectedOption) {
    this.setState({
      defaultFontWeight: selectedOption.value
    });
  }

  onLayoutChange(selectedOption) {
    this.setState({
      defaultLayout: selectedOption.value
    });
  }

  onBgColorChange(color) {
    this.setState({
      defaultBgColor: color.hex
    });
  }

  onFontColorChange(color) {
    this.setState({
      defaultFontColor: color.hex
    });
  }

  onSubmit() {
    const {
      changeBookSetting,
      closeBookSettingsModal,
      addNotification
    } = this.props;
    const {
      defaultBgColor,
      defaultFontName,
      defaultFontWeight,
      defaultFontSize,
      defaultFontColor,
      defaultLayout,
    } = this.state;

    changeBookSetting({
      autoLayout: defaultLayout,
      background: {
        color: defaultBgColor
      },
      font: {
        color: defaultFontColor,
        fontSize: defaultFontSize,
        fontFamilyId: defaultFontName,
        fontId: defaultFontWeight
      }
    });

    addNotification({
      message: 'Setting saved successfully!',
      level: 'success',
      autoDismiss: 2
    });

    closeBookSettingsModal();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isShown !== nextProps.isShown ||
      this.state.defaultBgColor !== nextState.defaultBgColor ||
      this.state.defaultFontName !== nextState.defaultFontName ||
      this.state.defaultFontWeight !== nextState.defaultFontWeight ||
      this.state.defaultFontSize !== nextState.defaultFontSize ||
      this.state.defaultFontColor !== nextState.defaultFontColor ||
      this.state.defaultLayout !== nextState.defaultLayout ||
      this.state.inputSize !== nextState.inputSize) {
      return true;
    }

    return false;
  }

  render() {
    const { closeBookSettingsModal, isShown } = this.props;

    const needResetColor = isShown;

    const {
      defaultBgColor,
      defaultFontColor,
      defaultFontName,
      defaultFontWeight,
      defaultFontSize,
      defaultLayout,
      inputSize,
      fontOptionList,
      fontWeightOptionList,
      layoutOptionList
    } = this.state;

    return (
      <XModal
        className="book-setting-modal"
        onClosed={closeBookSettingsModal}
        opened={isShown}
      >
        <h2 className="modal-title">Book Setting</h2>

        <div className="setting-panel">
          <h4 className="panel-title">Default Background</h4>
          <div className="setting-box">
            <div className="setting-item">
              <span>Color:</span>
              <XColorPicker
                needResetColor={needResetColor}
                initHexString={defaultBgColor}
                onColorChange={this.onBgColorChange}
              />
            </div>
          </div>
        </div>

        <div className="setting-panel">
          <h4 className="panel-title">Default font</h4>
          <div className="setting-box">
            <div className="setting-item">
              <span>Font:</span>
              <div className="select-container">
                <XSelect
                  className="font"
                  options={fontOptionList}
                  searchable={false}
                  onChanged={this.onFontNameChange}
                  value={defaultFontName}
                  optionComponent={FontUrl}
                />
              </div>
              <div className="select-container">
                <XSelect
                  className="font-weight"
                  options={fontWeightOptionList}
                  searchable={false}
                  onChanged={this.onFontWeightChange}
                  value={defaultFontWeight}
                />
              </div>

            </div>
            <div className="setting-item">
              <span>Size:</span>
              <div className="slider-container">
                <XSlider
                  value={defaultFontSize}
                  min={MIN_FONT_SIZE}
                  max={MAX_FONT_SIZE}
                  step={1}
                  handleSliderChange={this.onSliderChange}
                />
              </div>
              <input
                type="number"
                className="size-input"
                value={inputSize}
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                onChange={this.onSizeInputChange}
                onBlur={this.onSizeInputBlur}
              />
            </div>
            <div className="setting-item">
              <span>Color:</span>
              <XColorPicker
                needResetColor={needResetColor}
                initHexString={defaultFontColor}
                onColorChange={this.onFontColorChange}
              />
            </div>
          </div>
        </div>

        <div className="setting-panel">
          <h4 className="panel-title">Default Layout</h4>
          <div className="setting-box">
            <div className="setting-item">
              <span>Auto Layout:</span>
              <div className="select-container">
                <XSelect
                  className="layout"
                  options={layoutOptionList}
                  searchable={false}
                  onChanged={this.onLayoutChange}
                  value={defaultLayout}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="button-container">
          <XButton
            width={160}
            className="white"
            onClicked={closeBookSettingsModal}
          >Cancel</XButton>
          <XButton
            width={160}
            onClicked={this.onSubmit}
          >Done</XButton>
        </p>
      </XModal>
    );
  }
}

BookSettingsModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  fontList: PropTypes.array.isRequired,
  bookSetting: PropTypes.object.isRequired,
  closeBookSettingsModal: PropTypes.func.isRequired,
  changeBookSetting: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  addNotification: PropTypes.func.isRequired
};

export default BookSettingsModal;
