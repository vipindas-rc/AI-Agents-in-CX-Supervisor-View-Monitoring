import { DateTime } from '@ringcx/shared';

export const hhMmSsFilter = (seconds: number | string) => {
    const s = Number(seconds) || 0;
    return DateTime.Duration.fromObject({
        seconds: s,
    }).toFormat(DateTime.DURATION_FORMAT.TIME_WITH_SECONDS);
};

export const formatPassDate = (date: string) => {
    const formattedDate = DateTime.fromSQLToDateTime(date);
    if (formattedDate.isValid)
        return DateTime.localizedDateTimeFromObject({
            dateTime: formattedDate,
        });
    return date;
};

export const hhMmSsFilterFromMs = (milSeconds: number | string) => {
    const ms = Number(milSeconds) || 0;
    return DateTime.Duration.fromMillis(ms).toFormat(
        DateTime.DURATION_FORMAT.TIME_WITH_SECONDS
    );
};

export const getStandardOffset = (timezone: string) => {
    const offset = (DateTime.now().setZone(timezone).offset / 60) * 100;
    const prefix = offset > 0 ? '+' : '-';
    return prefix + offset;
};

// AgentLibrary has handled timezone incorrectly, It is using browser's timezone for date conversion, Please see AgentLibrarySDK/src/chat/newChat.notification.js
// @TODO: will be removing this after we remove JS Date instances in AgentLibrary
export const rezonedJSDateToServerDateTime = (dt: Date) => {
    const day = dt.getDate();
    const month = dt.getMonth() + 1; // js date's month starts from 0
    const year = dt.getFullYear();
    const hour = dt.getHours();
    const minute = dt.getMinutes();
    const second = dt.getSeconds();

    const zone = DateTime.getServerTimezone();

    return DateTime.fromObjectToDateTime(
        {
            day,
            year,
            month,
            hour,
            minute,
            second,
        },
        {
            zone,
        }
    );
};

export const getLocaleTimeFormat = (locale?: string): string => {
    const {
        DATETIME_FORMAT: { TIME_12_SIMPLE, TIME_24_SIMPLE },
    } = DateTime;

    // @ts-ignore
    return DateTime.isLocale12Hour(locale || DateTime.getUserLocale())
        ? TIME_12_SIMPLE
        : TIME_24_SIMPLE;
};
