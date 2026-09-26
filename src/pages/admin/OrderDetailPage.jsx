import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ActionIcon,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Image,
	LoadingOverlay,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getOrderById, updateOrderStatus, deleteOrder } from '@services/adminOrderService';
import { formatEur } from '@lib/currency';

const STATUSES = ['new', 'confirmed', 'shipped', 'completed', 'cancelled'];

function Field({ label, value }) {
	if (!value) return null;
	return (
		<div>
			<Text size="xs" c="dimmed" tt="uppercase">
				{label}
			</Text>
			<Text style={{ whiteSpace: 'pre-wrap' }}>{value}</Text>
		</div>
	);
}

function OrderDetailPage() {
	const { t, i18n } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const lang = i18n.language;

	useEffect(() => {
		getOrderById(id)
			.then(setOrder)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleStatusChange = async (status) => {
		if (!status || status === order.status) return;
		const previous = order.status;
		setOrder((current) => ({ ...current, status }));
		try {
			await updateOrderStatus(id, status);
			notifications.show({ message: t('ordersAdmin.statusUpdated'), color: 'green' });
		} catch {
			setOrder((current) => ({ ...current, status: previous }));
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteOrder(id);
			notifications.show({ message: t('ordersAdmin.deleted'), color: 'green' });
			navigate(`/${brand.adminSlug}/orders`);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const address = order?.delivery_address ?? {};

	return (
		<Container size="md" pos="relative">
			<LoadingOverlay visible={loading} />
			<Group gap="sm" mb="lg">
				<ActionIcon variant="subtle" component={Link} to={`/${brand.adminSlug}/orders`}>
					<IconArrowLeft size={20} />
				</ActionIcon>
				<Title order={2}>
					{t('ordersAdmin.title')} {order?.order_number}
				</Title>
			</Group>

			{order && (
				<Card withBorder>
					<Stack gap="md">
						<Group justify="space-between">
							<Select
								w={180}
								value={order.status}
								allowDeselect={false}
								onChange={handleStatusChange}
								data={STATUSES.map((status) => ({
									value: status,
									label: t(`ordersAdmin.status.${status}`),
								}))}
							/>
							<Text size="sm" c="dimmed">
								{new Date(order.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'bg-BG')}
							</Text>
						</Group>

						<Field label={t('ordersAdmin.client')} value={order.client_name} />
						<Field label={t('checkout.phone')} value={order.client_phone} />
						<Field label={t('checkout.email')} value={order.client_email} />
						<Field
							label={t('ordersAdmin.delivery')}
							value={[address.address, address.city, address.zip].filter(Boolean).join(', ')}
						/>
						<Field label={t('ordersAdmin.note')} value={order.notes} />

						<Divider />
						<Text size="xs" c="dimmed" tt="uppercase">
							{t('ordersAdmin.items')}
						</Text>
						{(order.items ?? []).map((item) => (
							<Group key={item.lineId} wrap="nowrap" gap="sm">
								{item.imageUrl && (
									<Image src={item.imageUrl} w={40} h={40} radius="sm" fit="cover" />
								)}
								<Text size="sm" style={{ flex: 1 }}>
									{lang === 'en' ? item.nameEn : item.nameBg}
									{item.colorNameBg
										? ` · ${lang === 'en' ? item.colorNameEn : item.colorNameBg}`
										: ''}
									{item.sizeLabel ? ` · ${item.sizeLabel}` : ''} × {item.qty}
								</Text>
								<Text size="sm" fw={500}>
									{formatEur(item.priceEur * item.qty)}
								</Text>
							</Group>
						))}
						<Divider />
						<Group justify="space-between">
							<Text fw={700}>{t('ordersAdmin.total')}</Text>
							<Text fw={700}>{formatEur(order.total_eur)}</Text>
						</Group>

						<Group mt="md">
							<Button color="red" variant="light" onClick={handleDelete}>
								{t('common.delete')}
							</Button>
						</Group>
					</Stack>
				</Card>
			)}
		</Container>
	);
}

export default OrderDetailPage;
