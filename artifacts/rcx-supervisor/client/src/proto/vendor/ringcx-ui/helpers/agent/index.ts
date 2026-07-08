export const extractNumber = (str: string) =>
    (str.match(/\d+/g) || []).join('').slice(0, str.length);
