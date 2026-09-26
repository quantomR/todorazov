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
import { localized } from '@lib/localized';
import { getFilterGroups, saveFilterGroup, deleteFilterGroup } from '@services/filterService';
import { getCategories } from '@services/categoryService';
import FilterGroupModal from '@components/admin/FilterGroupModal';

function FiltersPage() {
	const { t, i18n } = useTranslation();
	const [groups, setGroups] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = () =>
		getFilterGroups()
			.then(setGroups)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }));

	useEffect(() => {
		Promise.all([getFilterGroups(), getCategories()])
			.then(([grps, cats]) => {
				setGroups(grps);
				setCategories(cats);
			})
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const categoryName = (id) => {
		const cat = categories.find((c) => c.id === id);
		return cat ? localized(cat, 'name', i18n.language) : t('filters.allCategories');
	};

	const handleSubmit = async (payload) => {
		try {
			await saveFilterGroup(payload);
			closeModal();
			refresh();
			notifications.show({ message: t('filters.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteFilterGroup(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('filters.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = groups.map((g) => (
		<Table.Tr key={g.id}>
			<Table.Td>{g.name_bg}</Table.Td>
			<Table.Td>{categoryName(g.category_id)}</Table.Td>
			<Table.Td>
				<Badge variant="light" color={g.type === 'range' ? 'blue' : 'gray'}>
					{g.type === 'range' ? t('filters.typeRange') : t('filters.typeCheckbox')}
				</Badge>
			</Table.Td>
			<Table.Td>{g.type === 'checkbox' ? (g.filter_options?.length ?? 0) : '—'}</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setSelected(g);
							openModal();
						}}
					>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(g);
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
				<Title order={2}>{t('filters.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('filters.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={560}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('filters.nameBg')}</Table.Th>
							<Table.Th>{t('filters.category')}</Table.Th>
							<Table.Th>{t('filters.type')}</Table.Th>
							<Table.Th>{t('filters.options')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<FilterGroupModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				group={selected}
				categories={categories}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('filters.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('filters.deleteWarning')}
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

export default FiltersPage;
