export const numberToString = (num) => {
    const sign = num >= 0 ? '+' : '-';
    return `${sign}${Math.abs(num).toString().padStart(5, '0')}`;
}