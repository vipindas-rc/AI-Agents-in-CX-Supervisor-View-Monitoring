export function announceToScreenReader(
    message: string,
    doc: Document = document
): void {
    const region = doc.getElementById('react-sr-announcer');
    if (!region) return;
    if (region.textContent === message) {
        region.textContent = message + '\u00A0';
    } else {
        region.textContent = message;
    }
}
