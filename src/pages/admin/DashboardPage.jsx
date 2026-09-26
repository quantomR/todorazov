import { useEffect, useState } from 'react';
import { Card, Group, SimpleGrid, Text, Title } from '@mantine/core';
import {
	IconPackage,
	IconCircleCheck,
	IconShoppingBag,
	IconMessageCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getDashboardStats } from '@services/statsService';

const CARDS = [
	{ key: 'totalProducts', icon: IconPackage },
	{ key: 'activeProducts', icon: IconCircleCheck },
	{ key: 'newOrders', icon: IconShoppingBag },
	{ key: 'newInquiries', icon: IconMessageCircle },
];

function DashboardPage() {
	const { t } = useTranslation();
	const [stats, setStats] = useState({});

	useEffect(() => {
		getDashboardStats()
			.then(setStats)
			.catch(() => {});
	}, []);

	const cards = CARDS.filter((card) => card.key in stats);

	return (
		<>
			<Title order={2} mb="lg">
				{t('admin.dashboard')}
			</Title>
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
				{cards.map((card) => (
					<Card key={card.key} withBorder>
						<Group justify="space-between">
							<div>
								<Text size="sm" c="dimmed">
									{t(`admin.${card.key}`)}
								</Text>
								<Text size="xl" fw={700}>
									{stats[card.key]}
								</Text>
							</div>
							<card.icon size={32} color="var(--sf-text-dim)" />
						</Group>
					</Card>
				))}
			</SimpleGrid>
		</>
	);
}

export default DashboardPage;
