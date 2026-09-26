import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Checkbox, Group, Paper, Text } from '@mantine/core';
import { IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function SortableDefinitionRow({ definition, onEdit, onDelete, onToggleCollapsed }) {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: definition.id,
	});

	return (
		<Paper
			ref={setNodeRef}
			withBorder
			p="sm"
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.6 : 1,
			}}
		>
			<Group justify="space-between" wrap="nowrap">
				<Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
					<ActionIcon
						variant="subtle"
						color="gray"
						{...attributes}
						{...listeners}
						style={{ cursor: 'grab', touchAction: 'none' }}
					>
						<IconGripVertical size={18} />
					</ActionIcon>
					<div style={{ minWidth: 0 }}>
						<Text size="sm" fw={500} truncate>
							{definition.name_bg}
						</Text>
						<Text size="xs" c="dimmed" truncate>
							{definition.name_en}
						</Text>
					</div>
				</Group>
				<Group gap="sm" wrap="nowrap">
					<Checkbox
						size="xs"
						label={t('attributes.collapsed')}
						checked={definition.collapsed}
						onChange={(e) => onToggleCollapsed(definition, e.currentTarget.checked)}
					/>
					<ActionIcon variant="light" onClick={() => onEdit(definition)}>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon variant="light" color="red" onClick={() => onDelete(definition)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Group>
		</Paper>
	);
}

export default SortableDefinitionRow;
