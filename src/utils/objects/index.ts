export { memoize } from './memoize';

export function objectToFormData<T extends {}>(obj: T): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    formData.append(k, v as string);
  });
  return formData;
}
