export { memoize } from './memoize';

export function objectToFormData<T extends {}>(obj: T): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    formData.append(k, v as string);
  });
  return formData;
}

export function findProperty(obj: any, targetKey: string): any {
  if (obj === null || typeof obj !== 'object') {
    return undefined;
  }

  if (targetKey in obj) {
    return obj[targetKey];
  }

  for (const key of Object.keys(obj)) {
    const result = findProperty(obj[key], targetKey);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}