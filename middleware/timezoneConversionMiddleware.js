// middleware/timezoneConversionMiddleware.js
const { formatInTimeZone, fromZonedTime } = require('date-fns-tz');

/**
 * Attaches timezone conversion helpers to res.locals.
 * Default timezone is UTC if none is provided.
 */
function timezoneConversion(req, res, next) {
  // Use user's stored timezone if available; otherwise default to UTC
  const userTimezone =
    res.locals?.currentUser?.timezone ||
    req.body?.timezone ||
    'UTC';

  res.locals.tz = userTimezone;

  /**
   * Format a Date for display in the user's timezone.
   * @param {Date|string} date
   * @param {string} pattern - date-fns format string (e.g., 'MMM d, yyyy')
   */
  res.locals.fmt = (date, pattern = 'MMM d, yyyy') => {
    if (!date) return '';
    return formatInTimeZone(date, userTimezone, pattern);
  };

  /**
   * Convert a local date/time (string or Date) in the user's timezone
   * to a UTC Date object for storage.
   * Accepts 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm' (and Date objects).
   */
  res.locals.localToUtc = (localDateTime) => {
    if (!localDateTime) return null;

    let dateString;

    // If a Date object was passed, represent it as local clock time in the user's timezone
    if (localDateTime instanceof Date) {
      dateString = formatInTimeZone(localDateTime, userTimezone, "yyyy-MM-dd'T'HH:mm");
    } else {
      dateString = String(localDateTime).trim();
    }

    // If only a date was provided, add midnight so it's a valid local datetime
    if (!dateString.includes('T')) {
      dateString = `${dateString}T12:00`; // Was 00:00, changed to 12:00 for testing
    }

    // New API: fromZonedTime converts local time in a zone → UTC Date
    return fromZonedTime(dateString, userTimezone);
  };

  /**
   * Convert a UTC date to 'yyyy-MM-dd' for <input type="date">.
   */
  res.locals.toInputDate = (date) => {
    return date ? formatInTimeZone(date, userTimezone, 'yyyy-MM-dd') : '';
  };

  /**
   * Convert a UTC date to 'yyyy-MM-ddTHH:mm' for <input type="datetime-local">.
   */
  res.locals.toInputDateTime = (date) => {
    return date ? formatInTimeZone(date, userTimezone, "yyyy-MM-dd'T'HH:mm") : '';
  };

  next();
}

module.exports = timezoneConversion;
