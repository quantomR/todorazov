import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ActionIcon,
	Box,
	Button,
	Card,
	Checkbox,
	Collapse,
	Container,
	Group,
	LoadingOverlay,
	SegmentedControl,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getProductById, saveProduct } from '@services/productService';
import { getCategories } from '@services/categoryService';
import { getDefinitions } from '@services/attributeDefinitionService';
import { sortedOptions, sortedImages } from '@services/publicProductService';
import { createCustomField } from '@lib/localized';
import CardImageFocusPicker from '@components/admin/CardImageFocusPicker';
import ProductCoreFields from '@components/admin/ProductCoreFields';
import ProductImagesManager from '@components/admin/ProductImagesManager';
import BookPreviewManager from '@components/admin/BookPreviewManager';
import ColorsEditor from '@components/admin/ColorsEditor';
import SizesEditor from '@components/admin/SizesEditor';
import GlobalAttributeInputs from '@components/admin/GlobalAttributeInputs';
import CustomFieldsEditor from '@components/admin/CustomFieldsEditor';
import ProductSeoFields from '@components/admin/ProductSeoFields';
import FilterInputs from '@components/admin/FilterInputs';

const slug = brand.adminSlug;

function ProductFormPage() {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [definitions, setDefinitions] = useState([]);
	const [colors, setColors] = useState([]);
	const [sizes, setSizes] = useState([]);
	const [globalValues, setGlobalValues] = useState({});
	const [customFields, setCustomFields] = useState([]);
	const [mainImageUrl, setMainImageUrl] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const form = useForm({
		initialValues: {
			sku: '',
			name_bg: '',
			name_en: '',
			description_bg: '',
			description_en: '',
			category_id: null,
			price_eur: '',
			discount_type: '',
			discount_value: '',
			video_url: '',
			has_colors: false,
			has_sizes: false,
			is_active: true,
			featured: false,
			meta_title_bg: '',
			meta_title_en: '',
			meta_description_bg: '',
			meta_description_en: '',
			card_image_fit: 'cover',
			card_image_focus: '50% 50%',
			filter_options: [],
			filter_values: {},
		},
		validate: {
			sku: (v) => (!v.trim() ? t('auth.required') : null),
			name_bg: (v) => (!v.trim() ? t('auth.required') : null),
			name_en: (v) => (!v.trim() ? t('auth.required') : null),
			price_eur: (v) => (v === '' ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		const definitionsPromise = brand.features.attributes ? getDefinitions() : Promise.resolve([]);
		const productPromise = isEdit ? getProductById(id) : Promise.resolve(null);
		Promise.all([getCategories(), definitionsPromise, productPromise])
			.then(([cats, defs, product]) => {
				setCategories(cats);
				setDefinitions(defs);
				if (product) {
					form.setValues({
						sku: product.sku,
						name_bg: product.name_bg,
						name_en: product.name_en,
						description_bg: product.description_bg ?? '',
						description_en: product.description_en ?? '',
						category_id: product.category_id,
						price_eur: product.price_eur ?? '',
						discount_type: product.discount_type ?? '',
						discount_value: product.discount_value ?? '',
						video_url: product.video_url ?? '',
						has_colors: product.has_colors,
						has_sizes: product.has_sizes,
						is_active: product.is_active,
						featured: product.featured,
						meta_title_bg: product.meta_title_bg ?? '',
						meta_title_en: product.meta_title_en ?? '',
						meta_description_bg: product.meta_description_bg ?? '',
						meta_description_en: product.meta_description_en ?? '',
						card_image_fit: product.card_image_fit ?? 'cover',
						card_image_focus: product.card_image_focus ?? '50% 50%',
						filter_options: (product.product_filter_options ?? []).map((o) => o.option_id),
						filter_values: Object.fromEntries(
							(product.product_filter_values ?? []).map((v) => [v.group_id, Number(v.value)])
						),
					});
					setMainImageUrl(sortedImages(product.product_images)[0]?.image_url ?? null);
					setColors(sortedOptions(product.product_colors));
					setSizes(
						sortedOptions(product.product_sizes).map((s) => ({ key: s.id, label: s.label }))
					);
					const globals = {};
					const customs = [];
					for (const attr of product.product_attributes ?? []) {
						if (attr.definition_id) {
							globals[attr.definition_id] = {
								value_bg: attr.value_bg ?? '',
								value_en: attr.value_en ?? '',
							};
						} else {
							customs.push({ ...createCustomField(), ...attr, key: attr.id });
						}
					}
					customs.sort((a, b) => a.sort_order - b.sort_order);
					setGlobalValues(globals);
					setCustomFields(customs);
				}
			})
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const buildPayload = (values) => ({
		...values,
		id: id ?? null,
		filter_options: values.filter_options,
		filter_values: Object.entries(values.filter_values)
			.filter(([, value]) => value !== '' && value != null)
			.map(([group_id, value]) => ({ group_id, value })),
		colors: colors.map((c, index) => ({
			id: c.id,
			name_bg: c.name_bg,
			name_en: c.name_en,
			color_hex: c.color_hex,
			price_override_eur: c.price_override_eur,
			sort_order: index,
		})),
		sizes: sizes.map((s, index) => ({ label: s.label, sort_order: index })),
		attributes: [
			...definitions
				.filter((def) => {
					const v = globalValues[def.id];
					return v && (v.value_bg.trim() || v.value_en.trim());
				})
				.map((def) => ({ definition_id: def.id, ...globalValues[def.id] })),
			...customFields
				.filter((f) => f.name_bg.trim() || f.name_en.trim())
				.map((f, index) => ({
					name_bg: f.name_bg,
					name_en: f.name_en,
					value_bg: f.value_bg,
					value_en: f.value_en,
					sort_order: index,
					collapsed: f.collapsed,
				})),
		],
	});

	const handleSubmit = async (values) => {
		setSaving(true);
		try {
			const productId = await saveProduct(buildPayload(values));
			notifications.show({ message: t('productsAdmin.saved'), color: 'green' });
			if (!isEdit) navigate(`/${slug}/products/${productId}`, { replace: true });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setSaving(false);
		}
	};

	const handleGlobalChange = (defId, prop, value) => {
		setGlobalValues((current) => ({
			...current,
			[defId]: { value_bg: '', value_en: '', ...current[defId], [prop]: value },
		}));
	};

	return (
		<Container size="lg">
			<Box pos="relative">
				<LoadingOverlay visible={loading} />
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Group justify="space-between" mb="lg">
						<Group gap="sm">
							<ActionIcon variant="subtle" component={Link} to={`/${slug}/products`}>
								<IconArrowLeft size={20} />
							</ActionIcon>
							<Title order={2}>{isEdit ? t('productsAdmin.edit') : t('productsAdmin.add')}</Title>
						</Group>
						<Button type="submit" loading={saving}>
							{t('common.save')}
						</Button>
					</Group>

					<Card withBorder mb="md">
						<ProductCoreFields form={form} categories={categories} />
					</Card>

					<Card withBorder mb="md">
						<Checkbox
							label={t('productsAdmin.hasColors')}
							{...form.getInputProps('has_colors', { type: 'checkbox' })}
						/>
						<Collapse expanded={form.values.has_colors}>
							<Box mt="md">
								<ColorsEditor colors={colors} setColors={setColors} productId={id ?? null} />
							</Box>
						</Collapse>
					</Card>

					<Card withBorder mb="md">
						<Checkbox
							label={t('productsAdmin.hasSizes')}
							{...form.getInputProps('has_sizes', { type: 'checkbox' })}
						/>
						<Collapse expanded={form.values.has_sizes}>
							<Box mt="md">
								<SizesEditor sizes={sizes} setSizes={setSizes} />
							</Box>
						</Collapse>
					</Card>

					{!form.values.has_colors && (
						<Card withBorder mb="md">
							<Title order={4} mb="sm">
								{t('productsAdmin.images')}
							</Title>
							{isEdit ? (
								<ProductImagesManager productId={id} colorId={null} />
							) : (
								<Text size="sm" c="dimmed">
									{t('productsAdmin.saveFirstForImages')}
								</Text>
							)}
						</Card>
					)}

					{brand.features.bookPreview && (
						<Card withBorder mb="md">
							<Title order={4} mb="sm">
								{t('bookPreview.title')}
							</Title>
							{isEdit ? (
								<BookPreviewManager productId={id} />
							) : (
								<Text size="sm" c="dimmed">
									{t('productsAdmin.saveFirstForImages')}
								</Text>
							)}
						</Card>
					)}

					{brand.features.attributes && (
						<>
							<Card withBorder mb="md">
								<Title order={4} mb="sm">
									{t('productsAdmin.specs')}
								</Title>
								<GlobalAttributeInputs
									definitions={definitions}
									values={globalValues}
									onChange={handleGlobalChange}
								/>
							</Card>
							<Card withBorder mb="md">
								<Title order={4} mb="sm">
									{t('productsAdmin.customFields')}
								</Title>
								<CustomFieldsEditor fields={customFields} setFields={setCustomFields} />
							</Card>
						</>
					)}

					{brand.features.filters && <FilterInputs form={form} />}

					{isEdit && mainImageUrl && (
						<Card withBorder mb="md">
							<Title order={4} mb="sm">
								{t('productsAdmin.cardImageTitle')}
							</Title>
							<Stack gap="md">
								<SegmentedControl
									w="fit-content"
									data={[
										{ value: 'cover', label: t('productsAdmin.cardFitCover') },
										{ value: 'contain', label: t('productsAdmin.cardFitContain') },
									]}
									{...form.getInputProps('card_image_fit')}
								/>
								{form.values.card_image_fit === 'cover' && (
									<CardImageFocusPicker
										imageUrl={mainImageUrl}
										value={form.values.card_image_focus}
										onChange={(value) => form.setFieldValue('card_image_focus', value)}
									/>
								)}
							</Stack>
						</Card>
					)}

					<Box mb="md">
						<ProductSeoFields form={form} />
					</Box>

					<Group justify="flex-end" mb="xl">
						<Button type="submit" loading={saving}>
							{t('common.save')}
						</Button>
					</Group>
				</form>
			</Box>
		</Container>
	);
}

export default ProductFormPage;
