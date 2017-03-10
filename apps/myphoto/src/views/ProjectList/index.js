import React from 'react';
import {observer} from 'mobx-react';
import classNames from 'classnames';

import './style.scss';
import ProjectLine from '../../components/ProjectLine';

@observer
class ProjectList extends React.Component {
  render() {
    const {store, isShow} = this.props;
    const {projects} = store;

    const ProjectsStyle = classNames('Projects', {'show': isShow});

    return (
      <div className={ProjectsStyle}>
        {projects.map((project, index) => (
          <ProjectLine project={project} key={index}/>
        ))}
      </div>
    );
  }
}

ProjectList.propTypes = {
  store: React.PropTypes.object
};

export default ProjectList;
