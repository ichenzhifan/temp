import React, { PropTypes, Component } from 'react'

import Element from '../Element';

import './index.scss';

class TextElement extends Component {
  constructor(props) {
    super(props);

    this.onDblClick = this.onDblClick.bind(this);
  }

  onDblClick(e) {
    const { id, actions } = this.props;
    actions.onDblClick(id, e);
  }

  render() {
    const { imgUrl, width, height, textAlign, textVAlign } = this.props;
    const style = {
      width,
      height
    };
    const imgConrainerStyle = {
      width,
      height,
      textAlign,
      verticalAlign: textVAlign
    };
    return (
      <Element {...this.props}>
        <div className="text-element" onDoubleClick={this.onDblClick} style={style}>
          <div style={imgConrainerStyle}>
            <img src={imgUrl} draggable="false" />
          </div>
        </div>
      </Element>
    );
  }
}

TextElement.propTypes = {
  font: PropTypes.shape({
    family: PropTypes.string,
    size: PropTypes.number
  }),
  actions: PropTypes.shape({
    onDblClick: PropTypes.func
  })
};

export default TextElement;
