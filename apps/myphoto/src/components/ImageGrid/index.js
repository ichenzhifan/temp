import React from 'react';
import {observer} from 'mobx-react';
import {observable, computed, reaction, autorun} from 'mobx';

import './style.scss';

@observer
class ImageGrid extends React.Component {
  render() {
    const {image} = this.props;
    const bgImageStyle = {backgroundImage: `url(${image.url})`};
    const activeClass = image.isSelected ? ' active' : '';

    return (
      <div className='ImageGrid'>
        <div className={`ImageGrid__cover ${activeClass}`} onClick={image.toggleSelect}>
          <div className='ImageGrid__image' style={bgImageStyle}/>
        </div>
        <p className='ImageGrid__name'>{image.name}</p>
      </div>
    )
  }
}

ImageGrid.propTypes = {
  image: React.PropTypes.object
};

export default ImageGrid
