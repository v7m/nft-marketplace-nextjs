export default function truncateStrq(fullStr, strLength) {
    if (fullStr.length <= strLength) return fullStr;

    const separator = "...";
    const seperatorLength = separator.length;
    const charsToShow = strLength - seperatorLength;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    const truncateStrBegin = fullStr.substring(0, frontChars);
    const truncateStrEnd = fullStr.substring(fullStr.length - backChars);

    return (
        truncateStrBegin + separator + truncateStrEnd
    );
}
