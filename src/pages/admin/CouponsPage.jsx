import { useEffect, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Container,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { formatEur } from '@lib/currency';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@services/couponService';
import CouponModal from '@components/admin/CouponModal';

function CouponsPage() {
	const { t } = useTranslation();
	const [coupons, setCoupons] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = () =>
		getCoupons()
			.then(setCoupons)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));

	useEffect(() => {
		refresh();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (values) => {
		const payload = {
			code: values.code.trim(),
			discount_type: values.discount_type,
			discount_value: Number(values.discount_value),
			is_active: values.is_active,
			expires_at: values.expires_at || null,
			max_uses: values.max_uses === '' ? null : Number(values.max_uses),
			min_order_eur: values.min_order_eur === '' ? null : Number(values.min_order_eur),
		};
		try {
			if (selected) await updateCoupon(selected.id, payload);
			else await createCoupon(payload);
			closeModal();
			refresh();
			notifications.show({ message: t('coupons.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('coupons.saveError'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteCoupon(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('coupons.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const discountLabel = (c) =>
		c.discount_type === 'percent' ? `${c.discount_value}%` : formatEur(c.discount_value);

	const rows = coupons.map((c) => (
		<Table.Tr key={c.id}>
			<Table.Td>
				<Text ff="monospace" fw={600}>
					{c.code}
				</Text>
			</Table.Td>
			<Table.Td>{discountLabel(c)}</Table.Td>
			<Table.Td>
				{c.used_count}
				{c.max_uses ? ` / ${c.max_uses}` : ''}
			</Table.Td>
			<Table.Td>{c.expires_at ? c.expires_at.slice(0, 10) : '—'}</Table.Td>
			<Table.Td>
				{!c.is_active && (
					<Badge color="gray" variant="light">
						{t('coupons.inactive')}
					</Badge>
				)}
			</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setSelected(c);
							openModal();
						}}
					>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(c);
							openDelete();
						}}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="lg">
			<Group justify="space-between" mb="lg">
				<Title order={2}>{t('coupons.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('coupons.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={560}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('coupons.code')}</Table.Th>
							<Table.Th>{t('coupons.discount')}</Table.Th>
							<Table.Th>{t('coupons.uses')}</Table.Th>
							<Table.Th>{t('coupons.expires')}</Table.Th>
							<Table.Th />
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<CouponModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				coupon={selected}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('coupons.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('coupons.deleteWarning')}
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={closeDelete}>
							{t('common.cancel')}
						</Button>
						<Button color="red" onClick={handleDelete}>
							{t('common.delete')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}

export default CouponsPage;
