import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Badge, Box, Container, LoadingOverlay, Table, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getOrders } from '@services/adminOrderService';
import { formatEur } from '@lib/currency';

const STATUS_COLORS = {
	new: 'blue',
	confirmed: 'teal',
	shipped: 'yellow',
	completed: 'green',
	cancelled: 'red',
};

function OrdersPage() {
	const { t, i18n } = useTranslation();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getOrders()
			.then(setOrders)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const rows = orders.map((order) => (
		<Table.Tr key={order.id}>
			<Table.Td>{order.order_number}</Table.Td>
			<Table.Td>
				{new Date(order.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'bg-BG')}
			</Table.Td>
			<Table.Td>{order.client_name}</Table.Td>
			<Table.Td>{formatEur(order.total_eur)}</Table.Td>
			<Table.Td>
				<Badge color={STATUS_COLORS[order.status]} variant="light">
					{t(`ordersAdmin.status.${order.status}`)}
				</Badge>
			</Table.Td>
			<Table.Td>
				<ActionIcon variant="light" component={Link} to={`/${brand.adminSlug}/orders/${order.id}`}>
					<IconEye size={16} />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="lg">
			<Title order={2} mb="lg">
				{t('admin.orders')}
			</Title>
			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={640}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>№</Table.Th>
							<Table.Th>{t('ordersAdmin.date')}</Table.Th>
							<Table.Th>{t('ordersAdmin.client')}</Table.Th>
							<Table.Th>{t('ordersAdmin.total')}</Table.Th>
							<Table.Th>{t('ordersAdmin.statusLabel')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>
		</Container>
	);
}

export default OrdersPage;
