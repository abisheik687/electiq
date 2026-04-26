/**
 * @module services.CalendarService
 * @description Service for adding events to Google Calendar.
 */

import { BaseService } from './BaseService';

export class CalendarService extends BaseService {
  /**
   * Generates a URL to add an event to Google Calendar.
   * @param title Event title.
   * @param details Event details.
   * @param location Event location.
   * @param startDate Start date in YYYYMMDD format.
   * @param endDate End date in YYYYMMDD format.
   * @returns The Google Calendar URL.
   */
  public getAddToCalendarUrl(title: string, details: string, location: string, startDate: string, endDate: string): string {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: title,
      details: details,
      location: location,
      dates: `${startDate}/${endDate}`,
    });
    return `${baseUrl}&${params.toString()}`;
  }
}

export const calendarService = new CalendarService();
