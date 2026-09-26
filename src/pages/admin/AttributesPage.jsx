import { useState, useEffect } from 'react';
import {
	Container,
	Title,
	Button,
	Group,
	Text,
	Modal,
	Stack,
	LoadingOverlay,
	Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	DndContext,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
	getDefinitions,
	createDefinition,
	updateDefinition,
	deleteDefinition,
	reorderDefinitions,
} from '@services/attributeDefinitionService';
import AttributeDefinitionModal from '@components/admin/AttributeDefinitionModal';
import SortableDefinitionRow from '@components/admin/SortableDefinitionRow';

function AttributesPage() {
	const { t } = useTranslation();
	const [definitions, setDefinitions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
	);

	const refresh = async () => {
		try {
			const data = await getDefinitions();
			setDefinitions(data);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getDefinitions()
			.then(setDefinitions)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDragEnd = async ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIndex = definitions.findIndex((d) => d.id === active.id);
		const newIndex = definitions.findIndex((d) => d.id === over.id);
		const reordered = arrayMove(definitions, oldIndex, newIndex);
		setDefinitions(reordered);
		try {
			await reorderDefinitions(reordered);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
			refresh();
		}
	};

	const handleToggleCollapsed = async (definition, collapsed) => {
		setDefinitions((defs) => defs.map((d) => (d.id === definition.id ? { ...d, collapsed } : d)));
		try {
			await updateDefinition(definition.id, { ...definition, collapsed });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
			refresh();
		}
	};

	const handleSubmit = async (values) => {
		try {
			if (selected) {
				await updateDefinition(selected.id, values);
			} else {
				await createDefinition({ ...values, sort_order: definitions.length });
			}
			closeModal();
			refresh();
			notifications.show({ message: t('attributes.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteDefinition(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('attributes.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	return (
		<Container size="md">
			<Group justify="space-between" mb="xs">
				<Title order={2}>{t('attributes.title')}</Title>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						setSelected(null);
						openModal();
					}}
				>
					{t('attributes.add')}
				</Button>
			</Group>
			<Text size="sm" c="dimmed" mb="lg">
				{t('attributes.hint')}
			</Text>

			<Box pos="relative">
				<LoadingOverlay visible={loading} />
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext
						items={definitions.map((d) => d.id)}
						strategy={verticalListSortingStrategy}
					>
						<Stack gap="xs">
							{definitions.map((definition) => (
								<SortableDefinitionRow
									key={definition.id}
									definition={definition}
									onEdit={(def) => {
										setSelected(def);
										openModal();
									}}
									onDelete={(def) => {
										setDeleteTarget(def);
										openDelete();
									}}
									onToggleCollapsed={handleToggleCollapsed}
								/>
							))}
						</Stack>
					</SortableContext>
				</DndContext>
			</Box>

			<AttributeDefinitionModal
				opened={modalOpened}
				onClose={closeModal}
				onSubmit={handleSubmit}
				definition={selected}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('attributes.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('attributes.deleteWarning')}
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

export default AttributesPage;
