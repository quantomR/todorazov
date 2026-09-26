import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Checkbox, Grid, Group, Paper, TextInput } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function SortableCustomFieldRow({ field, onChange, onRemove }) {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: field.key,
	});

	const input = (prop, placeholderKey) => (
		<TextInput
			size="xs"
			placeholder={t(placeholderKey)}
			value={field[prop]}
			onChange={(e) => onChange(field.key, prop, e.currentTarget.value)}
		/>
	);

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
			<Group align="flex-start" wrap="nowrap" gap="xs">
				<ActionIcon
					variant="subtle"
					color="gray"
					mt={4}
					{...attributes}
					{...listeners}
					style={{ cursor: 'grab', touchAction: 'none' }}
				>
					<IconGripVertical size={18} />
				</ActionIcon>
				<Grid gutter="xs" style={{ flex: 1 }}>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						{input('name_bg', 'productsAdmin.fieldNameBg')}
					</Grid.Col>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						{input('name_en', 'productsAdmin.fieldNameEn')}
					</Grid.Col>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						{input('value_bg', 'productsAdmin.valueBg')}
					</Grid.Col>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						{input('value_en', 'productsAdmin.valueEn')}
					</Grid.Col>
					<Grid.Col span={12}>
						<Checkbox
							size="xs"
							label={t('attributes.collapsed')}
							checked={field.collapsed}
							onChange={(e) => onChange(field.key, 'collapsed', e.currentTarget.checked)}
						/>
					</Grid.Col>
				</Grid>
				<ActionIcon variant="light" color="red" mt={4} onClick={() => onRemove(field.key)}>
					<IconTrash size={16} />
				</ActionIcon>
			</Group>
		</Paper>
	);
}

export default SortableCustomFieldRow;
