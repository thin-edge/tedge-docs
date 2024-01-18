/*
  Helper functions to parse meta data associated to a node
*/

// Process the meta key
function processKey(value, start) {
  let c = '';
  let index = start;

  while (index < value.length) {
    c = value.at(index);
    if (c == '=') {
      break;
    }

    if (c == ' ') {
      start = index + 1;
    }
    index++;
  }
  return { value: value.substring(start, index), index: index + 1 };
}

// Process the meta value
function processValue(value, start) {
  let c = '';
  let index = start;
  let inQuote = false;

  while (index < value.length) {
    c = value.at(index);
    if (c == '"') {
      inQuote = !inQuote;
    }
    if (c == ' ' && !inQuote) {
      break;
    }
    index++;
  }
  let propValue = value.substring(start, index);

  // Strip surrounding quotes
  if (propValue.startsWith('"') && propValue.endsWith('"')) {
    propValue = propValue.substring(1, propValue.length - 1);
  }
  return { value: propValue, index: index + 1 };
}

/*
  Convert meta data in string format to an object (for easier parsing)
*/
function fromString(raw, defaultValues = {}) {
  let index = 0;
  let current = raw;
  let meta = defaultValues;

  while (index < current.length) {
    const metaKey = processKey(current, index);
    index = metaKey.index;

    const metaValue = processValue(current, index);
    index = metaValue.index;

    if (metaKey.value) {
      try {
        meta[metaKey.value] = JSON.parse(metaValue.value);
      } catch (e) {
        // ignore error and use value as is
        meta[metaKey.value] = metaValue.value;
      }
    }
  }
  return meta;
}

/*
  Convert meta data object to a string
*/
function toString(meta, ignore = []) {
  let props = [];
  for (const [key, value] of Object.entries(meta)) {
    if (!ignore.includes(key)) {
      props.push(`${key}=${JSON.stringify(value)}`);
    }
  }
  return props.join(' ');
}

export default {
  toString,
  fromString,
};
