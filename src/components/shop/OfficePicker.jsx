import { useEffect, useState } from 'react';
import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { getCourierOffices } from '@lib/courier';

// Courier office selector (features.courier). Loads offices from the
// configured provider and reports the chosen office object.
function OfficePicker({ value, onChange }) {
	const { t } = useTranslation();
	const [offices, setOffices] = useState([]);

	useEffect(() => {
		getCourierOffices()
			.then(setOffices)
			.catch(() => setOffices([]));
	}, []);

	return (
		<Select
			label={t('checkout.office')}
			placeholder={t('checkout.officePlaceholder')}
			searchable
			withAsterisk
			data={offices.map((o) => ({ value: o.id, label: `${o.name} — ${o.city}` }))}
			value={value?.id ?? null}
			onChange={(id) => onChange(offices.find((o) => o.id === id) ?? null)}
		/>
	);
}

export default OfficePicker;
