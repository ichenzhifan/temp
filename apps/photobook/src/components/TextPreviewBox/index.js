import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Loader from 'react-loader';

import './index.scss';

class TextPreviewBox extends Component {

  constructor(props) {
    super(props);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);

    this.onLoad = this.onLoad.bind(this);

    this.state = {
      previewImgPosition: {
        x: 0,
        y: 0
      },
      isLoaded: true
    };

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onDragStop);
  }

  componentWillReceiveProps(nextProps) {
    const oldImageSrc = this.props.imageSrc;
    const newImageSrc = nextProps.imageSrc;

    if (oldImageSrc !== newImageSrc) {
      this.setState({
        previewImgPosition: {
          x: 0,
          y: 0
        },
        isLoaded: false
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onDragStart);
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.onDragStop);
  }

  onDragStart(e) {
    this.isDragging = true;
    this.startDragPosition = {
      x: e.pageX,
      y: e.pageY
    };
  }

  onDrag(e) {
    if (!this.isDragging) return;

    const deltaX = e.pageX - this.startDragPosition.x;
    const deltaY = e.pageY - this.startDragPosition.y;

    this.startDragPosition = {
      x: e.pageX,
      y: e.pageY
    };

    const { previewImgPosition, imgWidth, imgHeight } = this.state;
    let newImgPositionX = previewImgPosition.x + deltaX;
    let newImgPositionY = previewImgPosition.y + deltaY;

    const containerWidth = this.textPreviewBox.offsetWidth;
    const containerHeight = this.textPreviewBox.offsetHeight;

    const minX = imgWidth > containerWidth ?
      (containerWidth - imgWidth) : 0;
    const minY = imgHeight > containerHeight ?
      (containerHeight - imgHeight) : 0;

    if (newImgPositionX < minX) {
      newImgPositionX = minX;
    } else if (newImgPositionX > 0) {
      newImgPositionX = 0;
    }

    if (newImgPositionY < minY) {
      newImgPositionY = minY;
    } else if (newImgPositionY > 0) {
      newImgPositionY = 0;
    }

    this.setState({
      previewImgPosition: {
        x: newImgPositionX,
        y: newImgPositionY
      }
    });
  }

  onDragStop(e) {
    this.isDragging = false;
  }

  onLoad(e) {
    this.setState({
      imgWidth: e.target.offsetWidth,
      imgHeight: e.target.offsetHeight,
      isLoaded: true
    });
  }

  renderPreviewBox() {
    const { imageSrc } = this.props;
    const options = {
      lines: 13,
      length: 20,
      width: 10,
      radius: 30,
      scale: 0.12,
      corners: 1,
      color: '#7b7b7b',
      opacity: 0.25,
      rotate: 0,
      direction: 1,
      speed: 1,
      trail: 60,
      fps: 20,
      zIndex: 2e9,
      top: '50%',
      left: '-36%',
      shadow: false,
      hwaccel: false,
      position: 'absolute'
    };

    const { previewImgPosition, isLoaded } = this.state;

    const imgStyle = {
      left: `${previewImgPosition.x}px`,
      top: `${previewImgPosition.y}px`
    };

    const resultHtml = [];

    if (imageSrc) {
      if (!isLoaded) {
        resultHtml.push(
          <div className="load-container" key="0">
            <div className="load-mask" />
            <div className="load-content">
              <Loader loaded={isLoaded} options={options} />
              Loading
            </div>
          </div>
        );
      }
      resultHtml.push(
        <img
          key="1"
          src={imageSrc}
          alt=""
          className="preview-img"
          style={imgStyle}
          draggable="false"
          onLoad={this.onLoad}
        />
      );
    } else {
      resultHtml.push(
        <div className="no-preview" key="2">
          No Preview available
        </div>
      );
    }

    return resultHtml;
  }


  render() {
    const { imgWidth, imgHeight } = this.state;

    const previewBoxStyle = classNames('text-preview-box', {
      grab: this.textPreviewBox && imgWidth && imgHeight &&
        (imgWidth > this.textPreviewBox.offsetWidth ||
          imgHeight > this.textPreviewBox.offsetHeight)
    });

    return (
      <div
        className={previewBoxStyle}
        ref={(div) => { this.textPreviewBox = div; }}
        onMouseDown={this.onDragStart}
      >
        {this.renderPreviewBox()}
      </div>
    );
  }
}

TextPreviewBox.propTypes = {
  imageSrc: PropTypes.string
};

export default TextPreviewBox;
