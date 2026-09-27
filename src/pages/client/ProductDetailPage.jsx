import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
	Anchor,
	Button,
	Center,
	Container,
	Grid,
	Group,
	Loader,
	Modal,
	NumberInput,
	Rating,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconBook, IconShoppingCartPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import {
	getPublicProductById,
	imagesForColor,
	sortedOptions,
	resolvePriceEur,
} from '@services/publicProductService';
import { getDefinitions } from '@services/attributeDefinitionService';
import { localized, mergeAttributes } from '@lib/localized';
import { getSale } from '@lib/pricing';
import { cartLineId } from '@lib/cart';
import { usePageMeta } from '@lib/meta';
import useCartStore from '@store/cartStore';
import ProductGallery from '@components/shop/ProductGallery';
import ProductVideo from '@components/shop/ProductVideo';
import ProductReviews from '@components/shop/ProductReviews';
import ColorPicker from '@components/shop/ColorPicker';
import SizePicker from '@components/shop/SizePicker';
import SpecList from '@components/shop/SpecList';
import Price from '@components/shop/Price';

// Flipbook viewer is heavy (pdfjs + react-pageflip) — load it only on demand.
const BookFlip = lazy(() => import('@components/shop/BookFlip'));

function ProductDetailPage() {
	const { t, i18n } = useTranslation();
	const { id } = useParams();
	const addItem = useCartStore((state) => state.addItem);
	const [product, setProduct] = useState(null);
	const [definitions, setDefinitions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [colorId, setColorId] = useState(null);
	const [sizeId, setSizeId] = useState(null);
	const [qty, setQty] = useState(1);
	const [previewOpen, setPreviewOpen] = useState(false);
	const lang = i18n.language;

	useEffect(() => {
		const definitionsPromise = brand.features.attributes ? getDefinitions() : Promise.resolve([]);
		Promise.all([getPublicProductById(id), definitionsPromise])
			.then(([productData, defs]) => {
				setProduct(productData);
				setDefinitions(defs);
				const colors = sortedOptions(productData.product_colors);
				if (productData.has_colors && colors.length > 0) setColorId(colors[0].id);
			})
			.catch(() => setProduct(null))
			.finally(() => setLoading(false));
	}, [id]);

	const colors = useMemo(() => sortedOptions(product?.product_colors), [product]);
	const sizes = useMemo(() => sortedOptions(product?.product_sizes), [product]);
	const images = useMemo(
		() => imagesForColor(product?.product_images, product?.has_colors ? colorId : null),
		[product, colorId]
	);

	const jsonLd = useMemo(
		() =>
			product
				? {
						'@context': 'https://schema.org',
						'@type': 'Product',
						name: localized(product, 'name', lang),
						sku: product.sku,
						description: localized(product, 'description', lang) || undefined,
						image: (product.product_images ?? []).slice(0, 3).map((img) => img.image_url),
						offers: {
							'@type': 'Offer',
							price: (brand.features.sales
								? getSale(product).price
								: Number(product.price_eur)
							).toFixed(2),
							priceCurrency: 'EUR',
							availability: 'https://schema.org/InStock',
						},
					}
				: null,
		[product, lang]
	);
	const metaTitle = product
		? localized(product, 'meta_title', lang) || localized(product, 'name', lang)
		: null;
	const metaDescription = product
		? localized(product, 'meta_description', lang) ||
			localized(product, 'description', lang) ||
			null
		: null;
	usePageMeta({
		title: metaTitle,
		description: metaDescription,
		image: images[0]?.image_url ?? null,
		jsonLd,
		ogType: 'product',
	});

	if (loading) {
		return (
			<Center py={80}>
				<Loader />
			</Center>
		);
	}

	if (!product) {
		return (
			<Container size="xl" py="xl">
				<Text c="dimmed">{t('common.notFoundText')}</Text>
				<Anchor component={Link} to="/shop" mt="md" display="inline-block">
					{t('product.backToShop')}
				</Anchor>
			</Container>
		);
	}

	const selectedColor = colors.find((c) => c.id === colorId) ?? null;
	const selectedSize = sizes.find((s) => s.id === sizeId) ?? null;
	const priceEur = resolvePriceEur(product, selectedColor);
	const sale = brand.features.sales ? getSale(product, priceEur) : null;
	const effectivePrice = sale?.onSale ? sale.price : priceEur;
	const optionsMissing =
		(product.has_colors && !selectedColor) || (product.has_sizes && !selectedSize);
	const attributes = mergeAttributes(definitions, product.product_attributes, lang);

	const handleAddToCart = () => {
		addItem({
			lineId: cartLineId({ productId: product.id, colorId, sizeId }),
			productId: product.id,
			sku: product.sku,
			nameBg: product.name_bg,
			nameEn: product.name_en,
			colorId,
			colorNameBg: selectedColor?.name_bg ?? null,
			colorNameEn: selectedColor?.name_en ?? null,
			colorHex: selectedColor?.color_hex ?? null,
			sizeId,
			sizeLabel: selectedSize?.label ?? null,
			imageUrl: images[0]?.image_url ?? null,
			priceEur: effectivePrice,
			qty,
		});
		notifications.show({ message: t('product.addedToCart'), color: 'green' });
	};

	return (
		<Container size="xl" py="xl">
			<Anchor component={Link} to="/shop" size="sm" c="dimmed" mb="md" display="inline-block">
				<Group gap={4}>
					<IconArrowLeft size={16} />
					{t('product.backToShop')}
				</Group>
			</Anchor>
			<Grid gutter="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ProductGallery
						key={colorId ?? 'default'}
						images={images}
						title={localized(product, 'name', lang)}
					/>
					{brand.features.video && <ProductVideo url={product.video_url} />}
					{brand.features.bookPreview && product.preview_pdf_path && (
						<Button
							variant="light"
							fullWidth
							mt="md"
							leftSection={<IconBook size={18} />}
							onClick={() => setPreviewOpen(true)}
						>
							{t('bookPreview.read')}
						</Button>
					)}
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Title order={1} fz={{ base: 26, md: 32 }}>
						{localized(product, 'name', lang)}
					</Title>
					{brand.features.reviews && product.review_count > 0 && (
						<Group gap="xs" mb={4}>
							<Rating value={Number(product.rating)} readOnly fractions={2} size="sm" />
							<Text size="sm" c="dimmed">
								({product.review_count})
							</Text>
						</Group>
					)}
					<Price
						eur={effectivePrice}
						original={sale?.onSale ? sale.original : undefined}
						size="xl"
					/>
					{localized(product, 'description', lang) && (
						<Text c="dimmed" mt="md" style={{ whiteSpace: 'pre-wrap' }}>
							{localized(product, 'description', lang)}
						</Text>
					)}

					<Stack gap="md" mt="lg">
						{product.has_colors && colors.length > 0 && (
							<Stack gap={6}>
								<Text size="sm" fw={500}>
									{t('product.selectColor')}
								</Text>
								<ColorPicker colors={colors} selectedId={colorId} onSelect={setColorId} />
							</Stack>
						)}
						{product.has_sizes && sizes.length > 0 && (
							<Stack gap={6}>
								<Text size="sm" fw={500}>
									{t('product.selectSize')}
								</Text>
								<SizePicker sizes={sizes} selectedId={sizeId} onSelect={setSizeId} />
							</Stack>
						)}

						{brand.features.cart && (
							<Group gap="sm" mt="xs">
								<NumberInput
									w={90}
									min={1}
									max={99}
									allowDecimal={false}
									value={qty}
									onChange={(value) => setQty(Number(value) || 1)}
								/>
								<Button
									leftSection={<IconShoppingCartPlus size={18} />}
									disabled={optionsMissing}
									onClick={handleAddToCart}
								>
									{optionsMissing ? t('product.chooseOptions') : t('product.addToCart')}
								</Button>
							</Group>
						)}
					</Stack>

					{brand.features.attributes && attributes.length > 0 && (
						<Stack gap={6} mt="xl">
							<SpecList attributes={attributes} />
						</Stack>
					)}
				</Grid.Col>
			</Grid>

			{brand.features.reviews && <ProductReviews productId={product.id} />}

			{brand.features.bookPreview && product.preview_pdf_path && (
				<Modal
					opened={previewOpen}
					onClose={() => setPreviewOpen(false)}
					title={t('bookPreview.title')}
					fullScreen
				>
					<Suspense
						fallback={
							<Center py="xl">
								<Loader />
							</Center>
						}
					>
						{previewOpen && (
							<BookFlip path={product.preview_pdf_path} pages={product.preview_pdf_pages} />
						)}
					</Suspense>
				</Modal>
			)}
		</Container>
	);
}

export default ProductDetailPage;
