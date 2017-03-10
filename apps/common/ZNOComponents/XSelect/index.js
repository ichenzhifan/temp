import React, { Component } from 'react';
import { isEqual } from 'lodash';
import Select from 'react-select';
import './index.scss';

class XSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.value, nextProps.value)) {
      this.setState({
        value: nextProps.value
      });
    }
  }

  // to fix current select item reposition to previous item
  onOpen() {
    var _this = this;
    setTimeout(function() {
      _this.rePositionScrollBar(_this.state.value);
    });
  }

  rePositionScrollBar(option) {
    const elems = document.querySelectorAll('.Select-option');
    let selected;
    elems.forEach(elem => {
      let className = elem.getAttribute('class');
      if (/is-focused/.test(className)) {
        className = className.replace('is-focused', '');
        elem.setAttribute('class', className);
      }
      if (elem.innerHTML === option.label) {
        className += className.indexOf('is-selected') >= 0
          ? ''
          : ' is-selected';
        elem.setAttribute('class', className);
        selected = elem;
      }
    });
    if (selected) {
      const parent = selected.parentNode;
      parent.scrollTop = selected.offsetTop;
    }
  }

  render() {
    const {
      onChanged,
      optionComponent,
      options,
      searchable,
      placeholder,
      arrowRenderer,
      value,
      valueComponent
    } = this.props;
    return (
      <Select
        arrowRenderer={arrowRenderer}
        onChange={onChanged}
        optionComponent={optionComponent}
        options={options}
        placeholder={placeholder}
        value={this.state.value}
        searchable={searchable}
        onOpen={this.onOpen.bind(this)}
        valueComponent={valueComponent}
      />
    );
  }
}

export default XSelect;
