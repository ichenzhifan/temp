import React from 'react';
import {observer} from 'mobx-react';
import classNames from 'classnames';

import './style.scss';
import ImageGrid from '../../components/ImageGrid';

@observer
class TimeLine extends React.Component {
  render() {
    const {store, isShow} = this.props;

    const timeLineStyle = classNames('TimeLines', {'show': isShow});

    return (
      <div className={timeLineStyle}>
        {store.timeLines.map((timeLine, tIndex) => (
          <div className='TimeLine' key={tIndex}>
            <h1 className='TimeLine__header'>{timeLine.title}</h1>
            {timeLine.photos.map((photo, pIndex) => (
              <p key={pIndex}>{JSON.stringify(photo)}</p>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

TimeLine.propTypes = {
  store: React.PropTypes.object.isRequired
};

export default TimeLine;
