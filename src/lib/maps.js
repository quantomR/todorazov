// Navigation deep links. On mobile these open the Google Maps / Waze apps.

export const googleMapsUrl = (query) =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const wazeUrl = (query) => `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
