// 获取显示局域相关
export function getBoxLimit(oriWidth, oriHeight) {
  const width = 950;
  const ratio = width / oriWidth;
  const height = oriHeight * ratio;
  return {
    ratio,
    width,
    height
  };
}
