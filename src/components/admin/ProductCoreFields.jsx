import { Checkbox, Grid, NumberInput, Select, Text, Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { localized } from '@lib/localized';
import { formatEurAsBgn } from '@lib/currency';

function ProductCoreFields({ form, categories }) {
	const { t, i18n } = useTranslation();

	const categoryOptions = categories.map((cat) => ({
		value: cat.id,
		label: localized(cat, 'name', i18n.language),
	}));

	return (
		<Grid gutter="md">
			<Grid.Col span={{ base: 12, sm: 4 }}>
				<TextInput label={t('productsAdmin.sku')} withAsterisk {...form.getInputProps('sku')} />
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 4 }}>
				<TextInput
					label={t('productsAdmin.nameBg')}
					withAsterisk
					{...form.getInputProps('name_bg')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 4 }}>
				<TextInput
					label={t('productsAdmin.nameEn')}
					withAsterisk
					{...form.getInputProps('name_en')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6 }}>
				<Textarea
					label={t('productsAdmin.descriptionBg')}
					autosize
					minRows={3}
					{...form.getInputProps('description_bg')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6 }}>
				<Textarea
					label={t('productsAdmin.descriptionEn')}
					autosize
					minRows={3}
					{...form.getInputProps('description_en')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6 }}>
				<Select
					label={t('productsAdmin.category')}
					data={categoryOptions}
					clearable
					{...form.getInputProps('category_id')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6 }}>
				<NumberInput
					label={t('productsAdmin.price')}
					min={0}
					decimalScale={2}
					withAsterisk
					{...form.getInputProps('price_eur')}
				/>
				{brand.currency.secondaryBgn && form.values.price_eur !== '' && (
					<Text size="xs" c="dimmed" mt={4}>
						≈ {formatEurAsBgn(form.values.price_eur)}
					</Text>
				)}
			</Grid.Col>
			{brand.features.sales && (
				<>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<Select
							label={t('productsAdmin.discountType')}
							data={[
								{ value: '', label: t('productsAdmin.discountNone') },
								{ value: 'percent', label: t('productsAdmin.discountPercent') },
								{ value: 'flat', label: t('productsAdmin.discountFlat') },
							]}
							{...form.getInputProps('discount_type')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<NumberInput
							label={t('productsAdmin.discountValue')}
							min={0}
							decimalScale={2}
							disabled={!form.values.discount_type}
							{...form.getInputProps('discount_value')}
						/>
					</Grid.Col>
				</>
			)}
			{brand.features.video && (
				<Grid.Col span={12}>
					<TextInput
						label={t('productsAdmin.videoUrl')}
						placeholder="https://youtube.com/watch?v=..."
						{...form.getInputProps('video_url')}
					/>
				</Grid.Col>
			)}
			<Grid.Col span={{ base: 6 }}>
				<Checkbox
					label={t('productsAdmin.active')}
					description={t('productsAdmin.activeHint')}
					{...form.getInputProps('is_active', { type: 'checkbox' })}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6 }}>
				<Checkbox
					label={t('productsAdmin.featured')}
					description={t('productsAdmin.featuredHint')}
					{...form.getInputProps('featured', { type: 'checkbox' })}
				/>
			</Grid.Col>
		</Grid>
	);
}

export default ProductCoreFields;
