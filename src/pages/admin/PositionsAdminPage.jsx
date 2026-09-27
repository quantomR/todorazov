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
import {
	getPositions,
	createPosition,
	updatePosition,
	deletePosition,
} from '@services/positionService';
import PositionModal from '@components/admin/PositionModal';

function PositionsAdminPage() {
	const { t } = useTranslation();
	const [positions, setPositions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = async () => {
		try {
			setPositions(await getPositions());
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getPositions()
			.then(setPositions)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (values) => {
		try {
			if (selected) await updatePosition(selected.id, values);
			else await createPosition(values);
			closeModal();
			refresh();
			notifications.show({ message: t('positions.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deletePosition(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('positions.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = positions.map((p) => (
		<Table.Tr key={p.id}>
			<Table.Td>{p.title_bg}</Table.Td>
			<Table.Td>
				<Badge color={p.is_open ? 'green' : 'gray'} variant="light">
					{p.is_open ? t('positions.open') : t('positions.closed')}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setSelected(p);
							openModal();
						}}
					>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(p);
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
				<Title order={2}>{t('positions.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('positions.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={420}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('positions.titleBg')}</Table.Th>
							<Table.Th>{t('positions.statusLabel')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<PositionModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				position={selected}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('positions.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('positions.deleteWarning')}
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

export default PositionsAdminPage;
