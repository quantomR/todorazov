import { brand } from '@/config/brand';

// Courier office source (features.courier). SCAFFOLD — no tested integration
// from an existing project. 'manual' returns the configured list and works
// immediately; 'econt' is a reference adapter against Econt's public office
// nomenclature — verify the endpoint/shape and add error handling before
// relying on it in production. Swap in Speedy/other by adding an adapter here.

const ECONT_OFFICES_URL =
	'https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json';

async function econtOffices() {
	const res = await fetch(ECONT_OFFICES_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ countryCode: 'BGR' }),
	});
	if (!res.ok) throw new Error(`Econt offices ${res.status}`);
	const data = await res.json();
	return (data.offices ?? []).map((o) => ({
		id: String(o.code ?? o.id),
		name: o.name,
		city: o.address?.city?.name ?? '',
	}));
}

/** Returns [{ id, name, city }] for the configured provider. */
export async function getCourierOffices() {
	if (brand.courier?.provider === 'econt') return econtOffices();
	return brand.courier?.offices ?? [];
}
