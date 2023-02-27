interface getObjectDiffOptions {
  ignore?: string[]; // keys to ignore
}

const defaultOptions: getObjectDiffOptions = {
  ignore: ["metadata", "declaration"],
};

/**
 * Array comparison. Returns a boolean if the array('s values) are unchanged.
 */
export function arrayHasChanges(beforeArray: any[] = [], afterArray: any[] = []) {
  if (beforeArray.length !== afterArray.length) {
    return true;
  }

  if (beforeArray.length === 0) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  beforeArray.sort();
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  afterArray.sort();

  return afterArray.reduce((hasChanges, curr, index) => {
    if (hasChanges) {
      return true;
    }
    return beforeArray[index] !== curr;
  }, false);
}

/**
 * Recursive object comparison, returns the key/value pairs which have changed from beforeObject to afterObject.
 * Missing key/value pairs will be detected as `null` (to be deleted).
 */
export function getObjectDiff<T extends Record<string, unknown>>(
  beforeObject: T,
  afterObject: T,
  options = defaultOptions
): Partial<T> {
  const allKeys = Object.keys({ ...beforeObject, ...afterObject }).filter((key) => !options.ignore?.includes?.(key));

  return allKeys.reduce((prev, key) => {
    const beforeValue = beforeObject?.[key];
    const isArray = Array.isArray(beforeValue);
    const newValue = afterObject?.[key];
    const isObject = beforeValue && typeof beforeValue === "object" && !isArray;
    let nestedDiff;

    if (isObject) {
      nestedDiff = getObjectDiff(beforeValue, newValue);
    }

    const valueDidChange = !isArray ? beforeValue !== newValue : arrayHasChanges(beforeValue, newValue);

    if (isArray && valueDidChange) {
      nestedDiff = newValue;
    }

    return {
      ...prev,
      ...(valueDidChange && { [key]: nestedDiff ?? newValue ?? null }),
    };
  }, {});
}
