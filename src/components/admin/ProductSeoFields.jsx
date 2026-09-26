import { Box, Group, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';

// Optional per-product SEO override fields. Empty fields fall back to the
// product name / description on the storefront (see usePageMeta wiring in
// ProductDetailPage). Includes a live search-result preview.
function ProductSeoFields({ form }) {
	const { t } = useTranslation();
	const v = form.values;

	const previewTitle = `${v.meta_title_bg || v.name_bg || t('productsAdmin.nameBg')} — ${brand.siteName}`;
	const previewUrl = `${brand.siteUrl ?? ''}/shop/${v.sku || ''}`;
	const previewDesc =
		v.meta_description_bg || v.description_bg || t('productsAdmin.seoFallbackHint');

	return (
		<Paper p="md" withBorder>
			<Stack gap="md">
				<Box>
					<Title order={4}>{t('productsAdmin.seoTitle')}</Title>
					<Text size="sm" c="dimmed">
						{t('productsAdmin.seoHint')}
					</Text>
				</Box>

				<Group grow>
					<TextInput
						label={t('productsAdmin.metaTitleBg')}
						placeholder={v.name_bg}
						description={t('productsAdmin.metaTitleLen')}
						{...form.getInputProps('meta_title_bg')}
					/>
					<TextInput
						label={t('productsAdmin.metaTitleEn')}
						placeholder={v.name_en}
						description={t('productsAdmin.metaTitleLen')}
						{...form.getInputProps('meta_title_en')}
					/>
				</Group>

				<Group grow>
					<Textarea
						label={t('productsAdmin.metaDescBg')}
						placeholder={v.description_bg}
						description={t('productsAdmin.metaDescLen')}
						rows={2}
						{...form.getInputProps('meta_description_bg')}
					/>
					<Textarea
						label={t('productsAdmin.metaDescEn')}
						placeholder={v.description_en}
						description={t('productsAdmin.metaDescLen')}
						rows={2}
						{...form.getInputProps('meta_description_en')}
					/>
				</Group>

				{/* Search-result preview (Bulgarian) */}
				<Box>
					<Text size="xs" c="dimmed" mb={6}>
						{t('productsAdmin.seoPreview')}
					</Text>
					<Box
						style={{
							border: '1px solid var(--sf-border)',
							borderRadius: 8,
							padding: '12px 16px',
							background: 'var(--sf-surface)',
							maxWidth: 600,
						}}
					>
						<Text size="xs" c="dimmed" truncate>
							{previewUrl}
						</Text>
						<Text size="md" c="blue.7" style={{ lineHeight: 1.3 }} truncate>
							{previewTitle}
						</Text>
						<Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }} lineClamp={2}>
							{previewDesc}
						</Text>
					</Box>
				</Box>
			</Stack>
		</Paper>
	);
}

export default ProductSeoFields;
