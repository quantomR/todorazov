import { useState } from 'react';
import { ActionIcon, Button, Group, Paper, Text, TextInput } from '@mantine/core';
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	DndContext,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SizePill({ size, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: size.key,
	});

	return (
		<Paper
			ref={setNodeRef}
			withBorder
			px="xs"
			py={4}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.6 : 1,
				display: 'inline-flex',
				alignItems: 'center',
				gap: 4,
			}}
		>
			<ActionIcon
				variant="subtle"
				color="gray"
				size="xs"
				{...attributes}
				{...listeners}
				style={{ cursor: 'grab', touchAction: 'none' }}
			>
				<IconGripVertical size={14} />
			</ActionIcon>
			<Text size="sm" fw={500}>
				{size.label}
			</Text>
			<ActionIcon variant="subtle" color="red" size="xs" onClick={() => onRemove(size.key)}>
				<IconX size={14} />
			</ActionIcon>
		</Paper>
	);
}

function SizesEditor({ sizes, setSizes }) {
	const { t } = useTranslation();
	const [draft, setDraft] = useState('');

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
	);

	const handleAdd = () => {
		const label = draft.trim();
		if (!label) return;
		if (sizes.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
			setDraft('');
			return;
		}
		setSizes([...sizes, { key: crypto.randomUUID(), label }]);
		setDraft('');
	};

	const handleDragEnd = ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIndex = sizes.findIndex((s) => s.key === active.id);
		const newIndex = sizes.findIndex((s) => s.key === over.id);
		setSizes(arrayMove(sizes, oldIndex, newIndex));
	};

	return (
		<>
			{sizes.length === 0 && (
				<Text size="sm" c="dimmed">
					{t('productsAdmin.noSizes')}
				</Text>
			)}
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={sizes.map((s) => s.key)} strategy={rectSortingStrategy}>
					<Group gap="xs" mt={sizes.length > 0 ? 'xs' : 0}>
						{sizes.map((size) => (
							<SizePill
								key={size.key}
								size={size}
								onRemove={(key) => setSizes(sizes.filter((s) => s.key !== key))}
							/>
						))}
					</Group>
				</SortableContext>
			</DndContext>
			<Group gap="xs" mt="xs">
				<TextInput
					size="xs"
					placeholder="S, M, L, XL..."
					value={draft}
					onChange={(e) => setDraft(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleAdd();
						}
					}}
				/>
				<Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={handleAdd}>
					{t('productsAdmin.addSize')}
				</Button>
			</Group>
		</>
	);
}

export default SizesEditor;
