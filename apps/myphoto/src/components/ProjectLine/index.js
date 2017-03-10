import React from 'react';
import {observer} from 'mobx-react';

import './style.scss';
import ImageList from '../ImageList';

@observer
class ProjectLine extends React.Component {
  render() {
    const {project} = this.props;
    return (
      <div className='Project'>
        <div className='Project__head'>
          <h1 className='Project__head--title'>{project.title}</h1>
          <ul className='Project__head--props'>
            <li className='Project__head--prop'>{project.product}</li>
            <li className='Project__head--prop'>{project.size}</li>
            <li className='Project__head--prop'>{project.photoLength}</li>
            <li className='Project__head--prop'>{project.photoNum}</li>
          </ul>
        </div>
        <ImageList images={project.images}/>
      </div>
    )
  }
}

ProjectLine.propTypes = {
  project: React.PropTypes.object
};

export default ProjectLine;
