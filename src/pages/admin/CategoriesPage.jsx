import { useState, useEffect } from 'react';
import {
	Container,
	Title,
	Button,
	Table,
	Group,
	ActionIcon,
	Text,
	Modal,
	Stack,
	LoadingOverlay,
	Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from '@services/categoryService';
import CategoryModal from '@components/admin/CategoryModal';

function CategoriesPage() {
	const { t } = useTranslation();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = async () => {
		try {
			const data = await getCategories();
			setCategories(data);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getCategories()
			.then(setCategories)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (values) => {
		try {
			if (selected) {
				await updateCategory(selected.id, values);
			} else {
				await createCategory(values);
			}
			closeModal();
			refresh();
			notifications.show({ message: t('categories.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteCategory(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('categories.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = categories.map((cat) => (
		<Table.Tr key={cat.id}>
			<Table.Td>{cat.name_bg}</Table.Td>
			<Table.Td>{cat.name_en}</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setSelected(cat);
							openModal();
						}}
					>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(cat);
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
				<Title order={2}>{t('categories.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('categories.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={400}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('categories.nameBg')}</Table.Th>
							<Table.Th>{t('categories.nameEn')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<CategoryModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				category={selected}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('categories.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('categories.deleteWarning')}
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

export default CategoriesPage;
