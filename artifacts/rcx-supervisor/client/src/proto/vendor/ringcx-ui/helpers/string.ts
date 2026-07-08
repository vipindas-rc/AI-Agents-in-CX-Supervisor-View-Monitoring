const regexpForNumberWithCommas = /\B(?=(\d{3})+(?!\d))/g;
export const numberWithCommas = (count: number): string =>
    count.toString().replace(regexpForNumberWithCommas, ',');

export function capitalizeWord(text: string, preserveCase?: boolean): string {
    if (text) {
        if (!preserveCase) {
            text = text.toLowerCase();
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    return '';
}
