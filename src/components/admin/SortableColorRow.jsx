import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	ActionIcon,
	Box,
	ColorInput,
	Grid,
	Group,
	NumberInput,
	Paper,
	TextInput,
} from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ProductImagesManager from './ProductImagesManager';

function SortableColorRow({ color, productId, onChange, onRemove }) {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: color.id,
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
			<Group align="flex-start" wrap="nowrap" gap="xs">
				<ActionIcon
					variant="subtle"
					color="gray"
					mt={26}
					{...attributes}
					{...listeners}
					style={{ cursor: 'grab', touchAction: 'none' }}
				>
					<IconGripVertical size={18} />
				</ActionIcon>
				<Box style={{ flex: 1 }}>
					<Grid gutter="xs">
						<Grid.Col span={{ base: 6, sm: 3 }}>
							<TextInput
								size="xs"
								label={t('productsAdmin.colorNameBg')}
								value={color.name_bg}
								onChange={(e) => onChange(color.id, 'name_bg', e.currentTarget.value)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 6, sm: 3 }}>
							<TextInput
								size="xs"
								label={t('productsAdmin.colorNameEn')}
								value={color.name_en}
								onChange={(e) => onChange(color.id, 'name_en', e.currentTarget.value)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 6, sm: 3 }}>
							<ColorInput
								size="xs"
								label={t('productsAdmin.colorHex')}
								value={color.color_hex}
								onChange={(value) => onChange(color.id, 'color_hex', value)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 6, sm: 3 }}>
							<NumberInput
								size="xs"
								label={t('productsAdmin.priceOverride')}
								min={0}
								decimalScale={2}
								value={color.price_override_eur ?? ''}
								onChange={(value) =>
									onChange(color.id, 'price_override_eur', value === '' ? null : value)
								}
							/>
						</Grid.Col>
					</Grid>
					{productId && (
						<Box mt="xs">
							<ProductImagesManager productId={productId} colorId={color.id} />
						</Box>
					)}
				</Box>
				<ActionIcon variant="light" color="red" mt={26} onClick={() => onRemove(color.id)}>
					<IconTrash size={16} />
				</ActionIcon>
			</Group>
		</Paper>
	);
}

export default SortableColorRow;
