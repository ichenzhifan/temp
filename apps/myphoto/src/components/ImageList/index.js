import React from 'react';
import {observer} from 'mobx-react';

import './style.scss';
import ImageGrid from '../ImageGrid';

@observer
class ImageList extends React.Component {
  render() {
    const {images} = this.props;
    return (
      <div className='ImageList'>
        {images.map((image, index) => (
          <ImageGrid key={index} image={image}/>
        ))}
      </div>
    )
  }
}

ImageList.propTypes = {
  images: React.PropTypes.object
};

export default ImageList;
