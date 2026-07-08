export const formatPhoneNumber = (number: string): string => {
    if (/^(\+1)\d{10}$/g.test(number)) {
        const countryId = number.slice(0, 2);
        const areaCode = number.slice(2, 5);
        const prefix = number.slice(5, 8);
        const subscriber = number.slice(8, 12);
        return `${countryId} (${areaCode}) ${prefix}-${subscriber}`;
    } else {
        return number;
    }
};
