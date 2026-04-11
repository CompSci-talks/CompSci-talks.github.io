export function generateGoogleCalendarLink(seminar: any): string {
    const title = encodeURIComponent(seminar.title);
    const details = encodeURIComponent(seminar.abstract || 'CompSci Talk Seminar');
    const location = encodeURIComponent(seminar.location || 'Online');

    // Convert to ISO string format required by Google Calendar (YYYYMMDDTHHmmssZ)
    const startDate = new Date(seminar.date_time);
    const startObj = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    // Assume 1 hour duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endObj = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startObj}/${endObj}&details=${details}&location=${location}`;
}
