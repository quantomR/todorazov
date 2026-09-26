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
import { brand } from '@/config/brand';
import SortableColorRow from './SortableColorRow';

/**
 * New color rows get a client-generated uuid so image uploads can
 * reference them and the save_product RPC can upsert by id.
 */
const createColor = () => ({
	id: crypto.randomUUID(),
	name_bg: '',
	name_en: '',
	color_hex: brand.palette.brand[brand.primaryShade],
	price_override_eur: null,
});

function ColorsEditor({ colors, setColors, productId }) {
	const { t } = useTranslation();

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
	);

	const handleDragEnd = ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIndex = colors.findIndex((c) => c.id === active.id);
		const newIndex = colors.findIndex((c) => c.id === over.id);
		setColors(arrayMove(colors, oldIndex, newIndex));
	};

	const handleChange = (id, prop, value) => {
		setColors(colors.map((c) => (c.id === id ? { ...c, [prop]: value } : c)));
	};

	const handleRemove = (id) => {
		setColors(colors.filter((c) => c.id !== id));
	};

	return (
		<Stack gap="xs">
			{colors.length === 0 && (
				<Text size="sm" c="dimmed">
					{t('productsAdmin.noColors')}
				</Text>
			)}
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={colors.map((c) => c.id)} strategy={verticalListSortingStrategy}>
					<Stack gap="xs">
						{colors.map((color) => (
							<SortableColorRow
								key={color.id}
								color={color}
								productId={productId}
								onChange={handleChange}
								onRemove={handleRemove}
							/>
						))}
					</Stack>
				</SortableContext>
			</DndContext>
			<Button
				variant="light"
				size="xs"
				leftSection={<IconPlus size={14} />}
				onClick={() => setColors([...colors, createColor()])}
			>
				{t('productsAdmin.addColor')}
			</Button>
		</Stack>
	);
}

export default ColorsEditor;
