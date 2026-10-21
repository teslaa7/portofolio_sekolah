/**
 * Format string tanggal ISO menjadi format tanggal lokal Indonesia
 * @param {string|Date} dateString 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Format ringkas: "12 Okt 2024"
 */
export function formatShortDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return dateString;
  }
}
