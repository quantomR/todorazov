import { Button, Stack, Text } from '@mantine/core';
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
import { createCustomField } from '@lib/localized';
import SortableCustomFieldRow from './SortableCustomFieldRow';

/**
 * Per-product custom fields — pure local state, persisted by the
 * parent in the single save_product request.
 */
function CustomFieldsEditor({ fields, setFields }) {
	const { t } = useTranslation();

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
	);

	const handleDragEnd = ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIndex = fields.findIndex((f) => f.key === active.id);
		const newIndex = fields.findIndex((f) => f.key === over.id);
		setFields(arrayMove(fields, oldIndex, newIndex));
	};

	const handleChange = (key, prop, value) => {
		setFields(fields.map((f) => (f.key === key ? { ...f, [prop]: value } : f)));
	};

	return (
		<Stack gap="xs">
			{fields.length === 0 && (
				<Text size="sm" c="dimmed">
					{t('productsAdmin.noCustomFields')}
				</Text>
			)}
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={fields.map((f) => f.key)} strategy={verticalListSortingStrategy}>
					<Stack gap="xs">
						{fields.map((field) => (
							<SortableCustomFieldRow
								key={field.key}
								field={field}
								onChange={handleChange}
								onRemove={(key) => setFields(fields.filter((f) => f.key !== key))}
							/>
						))}
					</Stack>
				</SortableContext>
			</DndContext>
			<Button
				variant="light"
				size="xs"
				leftSection={<IconPlus size={14} />}
				onClick={() => setFields([...fields, createCustomField()])}
			>
				{t('productsAdmin.addCustomField')}
			</Button>
		</Stack>
	);
}

export default CustomFieldsEditor;
