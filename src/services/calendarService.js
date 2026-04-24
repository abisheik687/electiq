/**
 * @fileoverview Service for adding events to Google Calendar.
 */

/**
 * Generates a URL to add an event to Google Calendar.
 * @param {string} title - Event title.
 * @param {string} details - Event details.
 * @param {string} location - Event location.
 * @param {string} startDate - Start date in YYYYMMDD format.
 * @param {string} endDate - End date in YYYYMMDD format.
 * @returns {string} The Google Calendar URL.
 */
export const getAddToCalendarUrl = (title, details, location, startDate, endDate) => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: title,
    details: details,
    location: location,
    dates: `${startDate}/${endDate}`,
  });
  return `${baseUrl}&${params.toString()}`;
};
