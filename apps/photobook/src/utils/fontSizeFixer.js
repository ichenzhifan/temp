import { getPxByPt } from '../../../common/utils/math';

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 120;

export function fixTemplateFontSize(textElementWidth, pageHeight) {
  const fontRatio = 12;

  let fontSizeInPx = textElementWidth / fontRatio;
  const maxFontSizeInPx = getPxByPt(MAX_FONT_SIZE);
  const minFontSizeInPx = getPxByPt(MIN_FONT_SIZE);

  if (fontSizeInPx > maxFontSizeInPx) {
    fontSizeInPx = maxFontSizeInPx;
  } else if (fontSizeInPx < minFontSizeInPx) {
    fontSizeInPx = minFontSizeInPx;
  }

  const fontSizePercent = fontSizeInPx / pageHeight;

  return fontSizePercent;
}
