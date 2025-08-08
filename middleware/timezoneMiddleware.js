const { formatInTimeZone, zonedTimeToUtc } = require('date-fns-tz');
const DEFAULT_TZ = 'UTC';

function timezoneMiddleware(req, res, next) {
    // Grab user's stored timezone if possible, otehrwise default to UTC
    const userTimezone =
        res.locals?.currentUser?.timezone ||
        req.body?.timezone ||
        DEFAULT_TZ;
    
    res.locals.tz = userTimezone;

    /**
     *  Format the Date for display in user's timezone
     *  @param {Date|string} date
     * @param {string} pattern - date-fns format string
     */
     res.locals.fmt = (date, pattern = 'MMM d, yyyy') => {
        if (!date) return '';
        return formatInTimeZone(date, userTimezone, pattern);
     };

     /**
      * Convert YYYY-MM-DD and time (if provided) from local time to UTC for storage
      * @param {string} localDateTime - 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm'
      */
     res.locals.localToUtc = (localDateTime) => {
        if (!localDateTime) return null;
        // Append ":00" if only hours and minutes are provided
        const dateString = localDateTime.includes('T') ? localDateTime : `${localDateTime}T00:00`;
        return zonedTimeToUtc(dateString, userTimezone);
     };

     // Convert UTC date to YYYY-MM-DD for <input type="date">
     res.locals.toInputDate = (date) => {
        if (!date) return '';
        return formatInTimeZone(date, userTimezone, 'yyyy-MM-dd');
     };

     // Convert UTC date to YYYY-MM-DDTHH:mm for <input type="datetime-local">
     res.locals.toInputDateTime = (date) => {
        if (!date) return '';
        return formatInTimeZone(date, userTimezone, "yyyy-MM-dd'T'HH:mm");
     };

     next();
}

module.exports = timezoneMiddleware;