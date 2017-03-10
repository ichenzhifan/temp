import { merge, forEach } from 'lodash';
import X2JS from 'x2js';

import { guid } from '../../../common/utils/math';
import { formatDateTime } from '../../../common/utils/dateFormat';

const needRemoveElementKeyArray = ['src', 'encImgId'];

const generateSpread = (type, parameterMap, pageNumber) => {
  let outObj = {
    id: guid(),
    w: parameterMap.width,
    h: parameterMap.height,
    bleedTop: parameterMap.bleedSize,
    bleedBottom: parameterMap.bleedSize,
    bleedLeft: parameterMap.bleedSize,
    bleedRight: parameterMap.bleedSize,
    spineThicknessWidth: parameterMap.spineThickness,
    wrapSize: parameterMap.wrapSize,
    elements: [],
    type,
    pageNumber
  };

  if (type === 'innerPage') {
    outObj = merge({}, outObj, {
      w: parameterMap.innerWidth,
      h: parameterMap.innerHeight,
      wrapSize: parameterMap.innerWrapSize
    });
  }

  return outObj;
};

const generateSpreadArray = (imageBoxType, parameterMap) => {
  const spreadArray = [];
  switch (imageBoxType) {
    case 'BL':
      spreadArray.push(generateSpread('coverPage', parameterMap, 0));
      break;
    case 'IW': {
      const coverPage = generateSpread('coverPage', parameterMap, 0);
      const innerPage = generateSpread('innerPage', parameterMap, 1);

      spreadArray.push(coverPage);
      spreadArray.push(innerPage);

      break;
    }
    default:
  }

  return spreadArray;
};

const convertProjectSetting = (setting) => {
  const outArray = [];
  forEach(setting, (v, k) => {
    if (k !== 'title') {
      outArray.push({
        _id: (k === 'spineThickness' ? 'thickness' : k),
        _value: v
      });
    }
  });
  return outArray;
};

const convertElementArray = (elementArray, filterKeyArray) => {
  const xmlTextKey = '__text';
  const outArray = [];
  elementArray.forEach((element) => {
    const outObj = {};
    forEach(element, (value, key) => {
      if (key === 'text') {
        outObj[xmlTextKey] = value;
      } else if (filterKeyArray.indexOf(key) === -1) {
        outObj[`_${key}`] = value;
      }
    });
    outArray.push(outObj);
  });
  return outArray;
};

const convertSpreadArray = (spreadArray, filterElementKeyArray) => {
  const outArray = [];
  spreadArray.forEach((spread) => {
    const outObj = {};
    forEach(spread, (value, key) => {
      if (key === 'elements') {
        const elementArray = convertElementArray(value, filterElementKeyArray);
        if (elementArray.length) {
          outObj.elements = {
            element: elementArray
          };
        }
      } else {
        outObj[`_${key}`] = value;
      }
    });
    outArray.push(outObj);
  });
  return outArray;
};

const convertImageArray = (imageArray) => {
  return convertElementArray(imageArray, []);
};

const generateProject = (
  projectId,
  userId,
  setting,
  spreadArray,
  imageArray,
  createdDate
) => {
  const now = new Date();
  const projectObj = {
    project: {
      _clientId: 'web-h5',
      _createAuthor: 'web-h5|1.0|1',
      guid: projectId,
      userId: userId,
      artisan: {},
      title: setting.title,
      description: {},
      createdDate: formatDateTime(createdDate),
      updatedDate: formatDateTime(now),
      imageBox: {
        spec: {
          _version: '1.0',
          option: convertProjectSetting(setting)
        },
        spreads: {
          spread: convertSpreadArray(spreadArray, needRemoveElementKeyArray)
        }
      },
      images: {}
    }
  };

  const outImageArray = convertImageArray(imageArray);
  if (outImageArray.length) {
    projectObj.project.images.image = outImageArray;
  }

  const x2jsInstance = new X2JS({
    escapeMode: false
  });

  return `<?xml version="1.0" encoding="UTF-8"?>${x2jsInstance.js2xml(projectObj)}`;
};


export {
  generateSpreadArray,
  generateProject,
  generateSpread
};
