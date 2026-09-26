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
import { getServices, createService, updateService, deleteService } from '@services/serviceService';
import ServiceModal from '@components/admin/ServiceModal';

function ServicesAdminPage() {
	const { t } = useTranslation();
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = async () => {
		try {
			setServices(await getServices());
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getServices()
			.then(setServices)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (values) => {
		const payload = { ...values, price_eur: values.price_eur === '' ? null : values.price_eur };
		try {
			if (selected) await updateService(selected.id, payload);
			else await createService(payload);
			closeModal();
			refresh();
			notifications.show({ message: t('services.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteService(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('services.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = services.map((s) => (
		<Table.Tr key={s.id}>
			<Table.Td>{s.category_bg}</Table.Td>
			<Table.Td>{s.name_bg}</Table.Td>
			<Table.Td>{s.price_eur != null ? formatEur(s.price_eur) : t('services.onRequest')}</Table.Td>
			<Table.Td>
				{!s.is_active && (
					<Badge color="gray" variant="light">
						{t('services.inactive')}
					</Badge>
				)}
			</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setSelected(s);
							openModal();
						}}
					>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(s);
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
				<Title order={2}>{t('services.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('services.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={520}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('services.categoryBg')}</Table.Th>
							<Table.Th>{t('services.nameBg')}</Table.Th>
							<Table.Th>{t('services.price')}</Table.Th>
							<Table.Th />
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<ServiceModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				service={selected}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('services.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('services.deleteWarning')}
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

export default ServicesAdminPage;
