import X2JS from 'x2js';
import { isArray, forEach } from 'lodash';

const convertElementArray = (elementArray, filterKeyArray) => {
  const xmlTextKey = '__text';
  const outArray = [];
  elementArray.element.forEach((element) => {
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
        const elementArray = convertElementArray(value, []);
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

const generateTemplate = ( spread ) => {
  const templateObj = {
      templateView: {
        spread: convertSpreadArray(isArray(spread)?[...spread]:[spread])
      }
  };
  const x2jsInstance = new X2JS({
    escapeMode: false
  });

  return `${x2jsInstance.js2xml(templateObj)}`;
};


export {
  generateTemplate
};
