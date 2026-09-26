import { Grid, Stack, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';

/**
 * Value inputs for the global attribute template, in template order.
 * Pure local state — the parent owns `values`
 * ({ [definitionId]: {value_bg, value_en} }) and persists everything
 * with one save_product call.
 */
function GlobalAttributeInputs({ definitions, values, onChange }) {
	const { t } = useTranslation();

	return (
		<Stack gap="sm">
			{definitions.map((def) => {
				const value = values[def.id] ?? { value_bg: '', value_en: '' };
				return (
					<Grid key={def.id} gutter="sm" align="center">
						<Grid.Col span={{ base: 12, sm: 3 }}>
							<Text size="sm" fw={500}>
								{def.name_bg}
							</Text>
							<Text size="xs" c="dimmed">
								{def.name_en}
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 6, sm: 4.5 }}>
							<TextInput
								placeholder={t('productsAdmin.valueBg')}
								value={value.value_bg}
								onChange={(e) => onChange(def.id, 'value_bg', e.currentTarget.value)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 6, sm: 4.5 }}>
							<TextInput
								placeholder={t('productsAdmin.valueEn')}
								value={value.value_en}
								onChange={(e) => onChange(def.id, 'value_en', e.currentTarget.value)}
							/>
						</Grid.Col>
					</Grid>
				);
			})}
		</Stack>
	);
}

export default GlobalAttributeInputs;
