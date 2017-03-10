import {
  getInnerSheetSize,
  getInnerPageSize,
  getCoverSheetSize,
  getFrontCoverSize,
  getBackCoverSize,
  getSpineWidth
} from './sizeCalculator';

import { guid } from '../../../common/utils/math';
import { formatDateTime } from '../../../common/utils/dateFormat';
import { elementTypes, cameoDirectionTypes } from '../contants/strings.js';
import {
  checkIsSupportHalfImageInCover,
  checkIsSupportImageInCover
} from '../utils/cover';

const DEFAULT_BG_COLOR = '#FFFFFF';

function generateContainer(
  type, width, height, bleed, bgColor = DEFAULT_BG_COLOR, isPrint = false) {
  return {
    id: guid(),
    bgColor,
    width,
    height,
    bleed,
    type,
    elements: [],
    template: {},
    backend: {
      isPrint,
      slice: false
    }
  };
}

function generateCover(
  cover,
  parameterMap,
  variableMap,
  bgColor = DEFAULT_BG_COLOR,
  addedSheetNumber = 0) {
  if (!parameterMap) return {};

  const {
    bookBaseSize,
    coverPageBleed,
    coverExpandingSize,
    spineWidth,
    spineExpanding
  } = parameterMap;

  const coverSheetSize = getCoverSheetSize(
    bookBaseSize, coverPageBleed, coverExpandingSize, spineWidth
  );

  const coverAsset = variableMap.coverAsset;

  const realSpineWidth = getSpineWidth(spineWidth, addedSheetNumber) +
    coverPageBleed.left + coverPageBleed.right;

  const isSupportHalfImageInCover = checkIsSupportHalfImageInCover(cover);
  const isSupportImageInCover = checkIsSupportImageInCover(cover);

  const containers = [];

  if (isSupportHalfImageInCover) {
    const frontCoverSize = getFrontCoverSize(
      bookBaseSize, coverPageBleed, coverExpandingSize, spineExpanding
    );
    const backCoverSize = getBackCoverSize(
      bookBaseSize, coverPageBleed, coverExpandingSize, spineExpanding
    );

    const frontContainer = generateContainer(
      'Front', frontCoverSize.width, frontCoverSize.height, coverPageBleed,
      bgColor, true
    );

    const backContainer = generateContainer(
      'Back', backCoverSize.width, backCoverSize.height, coverPageBleed,
      bgColor
    );

    containers.push(frontContainer);
    containers.push(backContainer);
  } else {
    const fullContainer = generateContainer(
      'Full',
      coverSheetSize.width,
      coverSheetSize.height,
      coverPageBleed,
      bgColor,
      isSupportImageInCover
    );

    containers.push(fullContainer);
  }

  const spineContainer = generateContainer(
    'Spine', realSpineWidth, coverSheetSize.height, coverPageBleed, bgColor
  );

  containers.push(spineContainer);

  return {
    id: guid(),
    ...coverSheetSize,
    bleed: { ...coverPageBleed },
    bgColor: DEFAULT_BG_COLOR,
    bgImageUrl: coverAsset ? coverAsset.coverimage : '',
    containers
  };
}


function generatePage(product, parameterMap, index, bgColor = DEFAULT_BG_COLOR) {
  const {
    bookBaseSize,
    innerPageBleed
  } = parameterMap;

  const isLeftPage = (index % 2 === 0);
  const innerPageSize = getInnerPageSize(
    bookBaseSize, innerPageBleed
  );

  return {
    id: guid(),
    ...innerPageSize,
    surfaceNumber: index + 1,
    type: 'Page',
    bgColor,
    pageAlign: isLeftPage ? 'Left' : 'Right',
    bleed: { ...innerPageBleed },
    elements: [],
    template: {},
    backend: {
      isPrint: true,
      slice: false
    }
  };
}

function generateSheet(parameterMap, index, bgColor = DEFAULT_BG_COLOR) {
  const {
    bookBaseSize,
    innerPageBleed
  } = parameterMap;

  const innerSheetSize = getInnerSheetSize(
    bookBaseSize, innerPageBleed
  );

  return {
    id: guid(),
    ...innerSheetSize,
    surfaceNumber: index + 1,
    type: 'Sheet',
    bgColor,
    bleed: { ...innerPageBleed },
    elements: [],
    template: {},
    backend: {
      isPrint: true,
      slice: false
    }
  };
}


function generatePageArray(product, parameterMap, bgColor = DEFAULT_BG_COLOR) {
  if (!parameterMap) return [];

  const pageArray = [];

  const {
    sheetNumberRange
  } = parameterMap;
  const minSheetNumber = sheetNumberRange.min;
  const minPageNumber = minSheetNumber * 2;

  const isPressBook = (product === 'PS');

  if (isPressBook) {
    for (let i = 0; i < minPageNumber; i += 1) {
      const page = generatePage(product, parameterMap, i, bgColor);
      // pressBook的第一页和最后一页不进行打印
      if (i === 0 || i === (minPageNumber - 1)) {
        page.backend.isPrint = false;
      }
      pageArray.push(page);
    }
  } else {
    for (let i = 0; i < minPageNumber; i += 1) {
      const sheet = generateSheet(parameterMap, i, bgColor);
      i += 1;
      const page = generatePage(product, parameterMap, i, bgColor);
      page.backend.isPrint = false;
      pageArray.push(sheet);
      pageArray.push(page);
    }
  }

  return pageArray;
}

function convertPageArray(pageArray, elementArray) {
  let newPageArray = pageArray;
  pageArray.forEach((page, index) => {
    const elementIds = page.get('elements');
    if (elementIds.size) {
      const realElements = elementArray.filter((element) => {
        return elementIds.indexOf(element.get('id')) !== -1;
      });
      newPageArray = newPageArray.setIn(
        [String(index), 'elements'],
        realElements
      );
    }
  });
  return newPageArray;
}

function convertCover(cover, elementArray) {
  let newCover = cover;
  const containers = cover.get('containers');
  containers.forEach((container, index) => {
    const elementIds = container.get('elements');
    if (elementIds.size) {
      const realElements = elementArray.filter((element) => {
        return elementIds.indexOf(element.get('id')) !== -1;
      });
      newCover = newCover.setIn(
        ['containers', String(index), 'elements'],
        realElements
      );
    }
  });
  return newCover;
}

function generateSku(projectObj) {
  const { project } = projectObj;
  const { summary } = project;

  const skuObj = {
    project: {
      version: project.version,
      clientId: project.clientId,
      createAuthor: project.createAuthor,
      userId: project.userId,
      artisan: project.artisan,
      pageCount: summary.pageCount,
      pageAdded: summary.pageAdded,
      pageBase: summary.pageBase,
      useCameo: summary.useCameo,
      cameoDirection: summary.cameoDirection,
      useGilding: summary.useGilding,
      useTextPrinting: summary.useTextPrinting,
      ...project.spec
    }
  };

  if (!summary.useCameo) {
    skuObj.project.cameo = 'none';
    skuObj.project.cameoShape = 'none';
  }

  return skuObj;
}

function getCameoDirection(cameoSize) {
  if (cameoSize.get('width') === cameoSize.get('height')) {
    return cameoDirectionTypes.S;
  } else if (cameoSize.get('width') > cameoSize.get('height')) {
    return cameoDirectionTypes.H;
  } else {
    return cameoDirectionTypes.V;
  }
}


function generateProject(project, userInfo, specVersion) {
  const projectId = project.get('projectId');
  const now = new Date();

  const minPageNumber = project
    .getIn(['parameterMap', 'sheetNumberRange', 'min']) * 2;

  const pageArray = project.get('pageArray');
  const cover = project.get('cover');
  const elementArray = project.get('elementArray');
  const imageArray = project.get('imageArray');
  const cameoSize = project.getIn(['parameterMap', 'cameoSize']);

  const cameoDirection = getCameoDirection(cameoSize);

  const cameoElements = elementArray.filter((element) => {
    return element.get('type') === elementTypes.cameo;
  });

  let createdDate = new Date(project.get('createdDate'));
  if (isNaN(createdDate.getTime())) {
    createdDate = new Date();
  }

  const projectObj = {
    project: {
      version: specVersion,
      clientId: 'web-h5',
      createAuthor: 'web-h5|1.1|1',
      userId: userInfo.get('id'),
      artisan: userInfo.get('firstName'),
      createdDate: formatDateTime(createdDate),
      updatedDate: formatDateTime(now),
      summary: {
        pageCount: pageArray.size,
        pageAdded: pageArray.size - minPageNumber,
        pageBase: minPageNumber,
        useCameo: Boolean(cameoElements.size),
        cameoDirection,
        freeLogo: true,
        useGilding: false,
        useTextPrinting: false,
        editorSetting: project.get('bookSetting').toJS(),
      },
      spec: project.get('setting').toJS(),
      cover: convertCover(cover, elementArray).toJS(),
      pages: convertPageArray(pageArray, elementArray).toJS(),
      images: imageArray.toJS(),
      decorations: []
    }
  };

  if (projectId !== -1) {
    projectObj.project.guid = projectId;
  }

  return projectObj;
}


export {
  generateCover,
  generatePage,
  generateSheet,
  generatePageArray,
  generateContainer,
  generateProject,
  generateSku
};
