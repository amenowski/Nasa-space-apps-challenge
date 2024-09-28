export function UnixToJulianDate(d: Date) {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var a = Math.floor((14 - month) / 12);
    var y = Math.floor(year + 4800 - a);
    var m = month + 12 * a - 3;
    var JDN =
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045;
    return JDN;
}

export function getMonthShortName(month: number): string {
    const shortNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return shortNames[month];
}
