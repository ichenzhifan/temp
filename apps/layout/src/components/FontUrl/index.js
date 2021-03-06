import React, {Component} from 'react';
const fontPath = './fonts';

class FontUrl extends Component {
  handleMouseDown(event) {
    const { onSelect, option } = this.props;
		event.preventDefault();
		event.stopPropagation();
		onSelect(option, event);
	}

	handleMouseEnter (event) {
    const { onFocus, option } = this.props;
		onFocus(option, event);
	}

	handleMouseMove (event) {
    const { onFocus, option } = this.props;
		onFocus(option, event);
	}

  render() {
    const { className } = this.props;
    const { label, title, id, thumbnail } = this.props.option;
    return (
      <div className={className}
    			 onMouseDown={this.handleMouseDown.bind(this)}
    		 	 onMouseEnter={this.handleMouseEnter.bind(this)}
    			 onMouseMove={this.handleMouseMove.bind(this)}
    			 title={label} >
        <img src={thumbnail} />
      </div>
    );
  }
}

export default FontUrl;
