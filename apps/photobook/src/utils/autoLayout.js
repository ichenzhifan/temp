import { elementTypes } from '../contants/strings';

/**
 * 计算水平方向(高大于宽)和垂直方向(高小于宽)上的元素的数量.
 * @param  {Array} elements 带计算的所有元素的集合,这里是个Immutable对象.
 * @return {Object} 计算的结果. 结构为: {numberOfElements, numberOfHElements, numberOfVElements}
 */
const computedNumberOfHVElements = elements => {
  let numberOfElements = 0;
  let numberOfHElements = 0;
  let numberOfVElements = 0;

  // 循环每一个元素.
  // 计算水平方向(高大于宽)和垂直方向(高小于宽)上的Photo元素的数量
  elements.forEach(element => {
    if (element.get('type') === elementTypes.photo) {
      if (element.get('width') > element.get('height')) {
        numberOfHElements++;
      } else {
        numberOfVElements++;
      }
    }
  });

  numberOfElements = numberOfHElements + numberOfVElements;

  return {
    numberOfElements,
    numberOfHElements,
    numberOfVElements
  };
};

/**
 * 计算水平方向(高大于宽)和垂直方向(高小于宽)上的图片的数量.
 * @param  {Array} images 带计算的所有元素的集合,这里是个Immutable对象.
 * @return {Object} 计算的结果. 结构为: {numberOfImages, numberOfHImages, numberOfVImages}
 */
const computedNumberOfHVImages = images => {
  let numberOfImages = 0;
  let numberOfHImages = 0;
  let numberOfVImages = 0;

  // 循环每一个元素.
  // 计算水平方向(高大于宽)和垂直方向(高小于宽)上的Photo元素的数量
  images.forEach(image => {
    if (image.get('width') > image.get('height')) {
      numberOfHImages++;
    } else {
      numberOfVImages++;
    }
  });

  numberOfImages = numberOfHImages + numberOfVImages;

  return {
    numberOfImages,
    numberOfHImages,
    numberOfVImages
  };
};

/**
 * 根据水平方向和垂直方向上的元素数量, 在给定的所有模板中, 选择一个符合要求的模板.
 * @param  {Array} templates 给定的所有模板集合
 * @param  {Number} numberOfH 水平方向(高大于宽)上元素的个数
 * @param  {Number} numberOfV 垂直方向(高小于宽)上元素的个数
 * @return {Object} 筛选出来的模板对象.
 */
const filterTemplate = (templates, numberOfH, numberOfV) => {
  // 存放选择好的符合要求的模板.
  let template;

  // 存放水平方向或垂直方向上的元素数量等于指定的水平和垂直数量的所有模板的集合.
  const fitTemplates = [];

  // 存放总的元素数量等于指定的水平和垂直数量的和的所有模板的集合.
  const optionalTemplates = [];

  // 总的元素数量大于指定的水平和垂直数量的和的所有模板的集合.
  const greatThanTotalTemplates = [];
  const lessThanTotalTemplates = [];

  // 图片元素的总数量.
  const total = numberOfH + numberOfV;

  // 查找是否有符合要求的默认模板.
  template = templates.find(t => t.imageNum === total && total === 1 && t.isCoverDefault);

  // 查找是否有精确匹配切默认的模板.
  if(!template){
    template = templates.find(t => t.imageNum === total && t.horizontalNum === numberOfH && t.verticalNum === numberOfV);
  }

  // 如果没有找到符合要求的默认模板. 就继续查找水平方向或垂直方向元素个数相同和总个数相同的模板集合.
  if (!template) {
    templates.forEach(t => {
      if (t.imageNum === total) {
        if (t.horizontalNum === numberOfH ||
          t.verticalNum === numberOfV) {
          fitTemplates.push(t);
        } else {
          optionalTemplates.push(t);
        }
      }else if(t.imageNum > total){
        // greatThanTotalTemplates.push(t);
      }else{
        // lessThanTotalTemplates.push(t);
      }
    });

    // 筛选合适的模板.
    if(fitTemplates.length){
      // 总数相同, 切至少横竖有一个方向的数量相同.
      const rindex = Math.floor(Math.random()*fitTemplates.length);
      template = fitTemplates[rindex];

    }else if(optionalTemplates.length){
      // 总数相同
      const rindex = Math.floor(Math.random()*optionalTemplates.length);
      template = optionalTemplates[rindex];

    }else if(lessThanTotalTemplates.length){
      // 照片数小于模板的元素总数
      const rindex = Math.floor(Math.random()*lessThanTotalTemplates.length);
      template = lessThanTotalTemplates[rindex];

    }else if(greatThanTotalTemplates.length){
      // 照片数大于模板的元素总数
      const rindex = Math.floor(Math.random()*greatThanTotalTemplates.length);
      template = greatThanTotalTemplates[rindex];
    }
  }

  return template;
};

/**
 * 根据页面上的元素, 和当前产品可用的所有模板, 自动的选择一个模板为到当前的页面.
 * @param  {Array} pageElements 页面上的所有元素的集合, 这里是个Immutable对象.
 * @param  {Array} templates   当前产品可用的所有模板的集合.
 * @return {Object}  自动的选择到的一个模板信息.
 */
export const autoLayoutByElements = (pageElements, templates) => {
  // 计算水平方向(高大于宽)和垂直方向(高小于宽)上的元素的数量, 以及总个数.
  const countObjectOfElements = computedNumberOfHVElements(pageElements);

  // 根据水平方向和垂直方向上的元素数量, 在给定的所有模板中, 选择一个符合要求的模板.
  const template = filterTemplate(templates,
    countObjectOfElements.numberOfHElements,
    countObjectOfElements.numberOfVElements);

  return template;
};

/**
 * 根据待渲染的图片集合, 和当前产品可用的所有模板, 自动的选择一个模板为到当前的页面.
 * @param  {Array} images 待渲染的图片集合, 这里是个Immutable对象.
 * @param  {Array} templates   当前产品可用的所有模板的集合.
 * @return {Object}  自动的选择到的一个模板信息.
 */
export const autoLayoutByImages = (images, templates) => {
  // 计算水平方向(高大于宽)和垂直方向(高小于宽)上的元素的数量, 以及总个数.
  const countObjectOfImages = computedNumberOfHVImages(images);

  // 根据水平方向和垂直方向上的元素数量, 在给定的所有模板中, 选择一个符合要求的模板.
  const template = filterTemplate(templates,
    countObjectOfImages.numberOfHImages,
    countObjectOfImages.numberOfVImages);

  return template;
};
