import React from 'react';
import {observer} from 'mobx-react';

import './style.scss';
import ProjectLine from '../../components/ProjectLine';

@observer
class PreviewModal extends React.Component {
  render() {
    const {store, viewMode} = this.props;
    const {projects} = store;

    if (viewMode !== 'ProjectList') return null;

    return (
      <div className='Projects'>
        {projects.map((project, index) => (
          <ProjectLine project={project} key={index}/>
        ))}
      </div>
    );
  }
}

PreviewModal.propTypes = {
  store: React.PropTypes.object
};

export default PreviewModal;
