import { useEffect, useState } from 'react';
import { Container, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';
import { formatEur } from '@lib/currency';
import { usePageMeta } from '@lib/meta';
import { getPublicServices } from '@services/serviceService';

function ServicesPage() {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;
	usePageMeta({ title: t('services.title') });
	const [services, setServices] = useState([]);

	useEffect(() => {
		getPublicServices()
			.then(setServices)
			.catch(() => setServices([]));
	}, []);

	// Group by localized category, preserving sort_order within each group.
	const groups = services.reduce((acc, s) => {
		const category = localized(s, 'category', lang);
		(acc[category] = acc[category] || []).push(s);
		return acc;
	}, {});

	return (
		<Container size="md" py="xl">
			<Title order={1} c="brand" mb="xs">
				{t('services.title')}
			</Title>
			<Text c="dimmed" mb="xl">
				{t('services.subtitle')}
			</Text>

			{services.length === 0 ? (
				<Text c="dimmed">{t('services.empty')}</Text>
			) : (
				<Stack gap="xl">
					{Object.entries(groups).map(([category, items]) => (
						<div key={category}>
							{category && (
								<Text fw={700} fz="lg" mb="xs" c="brand">
									{category}
								</Text>
							)}
							<Table withTableBorder highlightOnHover>
								<Table.Tbody>
									{items.map((s) => (
										<Table.Tr key={s.id}>
											<Table.Td>{localized(s, 'name', lang)}</Table.Td>
											<Table.Td ta="right" fw={600} w={140}>
												{s.price_eur != null ? formatEur(s.price_eur) : t('services.onRequest')}
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					))}
				</Stack>
			)}
		</Container>
	);
}

export default ServicesPage;
