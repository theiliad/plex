/**
 * Often times, we generate a filename by creating an array of each part of the
 * path for the filename and then we need to clean it up using this function.
 *
 * Here, `formatFilename` gets rid of false-y values and normalizes each part
 * of the path before joining them with the '/' separator.
 */
const formatFilename = array =>
  array
    .filter(Boolean)
    .map(string => string.toLowerCase())
    .join('/');

exports.formatFilename = formatFilename;

/**
 * `createFontFace` is used to generate the actual `@font-face` declarations
 * that get written to the appropriate files.
 */
const createFontFace = (family, weight, unicode = {}) => {
  // Allows families to define their own preferred file names (IBMPlexCondensed instead of IBMPlexCond)
  const fontFileRoot = family.preferredName || family.type;

  const fontFileName = [
    `IBMPlex${fontFileRoot.split(' ').join('')}`,
    weight.variant ? weight.type + weight.variant : weight.type,
    unicode.type,
  ]
    .filter(Boolean)
    .join('-');

  // If the family is using truncated types, overried the default weight type
  let weightType = weight.type;
  if (family.truncatedType && weight.properties.truncatedType) {
    weightType = weight.properties.truncatedType;
  }

  const localFileName = [
    `IBM Plex ${family.type}`,
    weightType !== 'Regular' &&
      (weight.variant ? `${weightType} ${weight.variant}` : weightType),
  ]
    .filter(Boolean)
    .join(' ');
  const localPostscriptName = [
    `IBMPlex${family.type.split(' ').join('')}`,
    weightType !== 'Regular' &&
      (weight.variant ? `-${weightType}${weight.variant}` : `-${weightType}`),
  ]
    .filter(Boolean)
    .join('');

  const local = `local('${localFileName}'),
    local('${localPostscriptName}')`;

  // Korean, Japanese and Chinese fonts can be 'unhinted' to save space at the cost of rendering fidelity
  // If we're splitting based on unicode, then we can  use the higher quality, hinted, files
  // If we can't split, we can use the unhinted version for our fallback font
  const urls = {
    woff: `#{$font-prefix}/IBM-Plex-${fontFileRoot
      .split(' ')
      .join('-')}/fonts/complete/woff/${
      family.hinted ? 'hinted/' : ''
    }${fontFileName}.woff`,
    woff2Split: `#{$font-prefix}/IBM-Plex-${fontFileRoot
      .split(' ')
      .join('-')}/fonts/split/woff2/${
      family.hinted ? 'hinted/' : ''
    }${fontFileName}.woff2`,
    woff2Complete: `#{$font-prefix}/IBM-Plex-${fontFileRoot
      .split(' ')
      .join('-')}/fonts/complete/woff2/${
      family.hinted ? 'unhinted/' : '' // use unhinted for fallback (complete) fonts
    }${fontFileName}.woff2`,
  };

  const src = unicode.characters
    ? `src: ${local},
    url('${urls.woff2Split}') format('woff2');
    unicode-range: ${unicode.characters.join(', ')};`
    : `src: ${local},
    url('${urls.woff2Complete}') format('woff2'),
    url('${urls.woff}') format('woff');`;

  return `@font-face {
  font-family: '${family.name}';
  font-style: ${weight.properties.fontStyle};
  font-weight: ${weight.properties.fontWeight};
  ${src}
}
`;
};

exports.createFontFace = createFontFace;
