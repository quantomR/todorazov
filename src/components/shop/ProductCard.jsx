import { Link } from 'react-router-dom';
import { AspectRatio, Badge, Box, Card, Group, Image, Text } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { localized } from '@lib/localized';
import { getSale } from '@lib/pricing';
import { sortedImages, sortedOptions } from '@services/publicProductService';
import Price from './Price';

function ProductCard({ product }) {
	const { i18n } = useTranslation();
	const lang = i18n.language;

	const mainImage = sortedImages(product.product_images)[0];
	const colors = sortedOptions(product.product_colors);
	const sale = brand.features.sales ? getSale(product) : null;

	return (
		<Card
			component={Link}
			to={`/shop/${product.id}`}
			withBorder
			padding="md"
			style={{ color: 'inherit', textDecoration: 'none' }}
		>
			<Card.Section pos="relative">
				{sale?.onSale && (
					<Badge color="red" pos="absolute" top={8} left={8} style={{ zIndex: 1 }}>
						-{sale.percentOff}%
					</Badge>
				)}
				<AspectRatio ratio={1}>
					{mainImage ? (
						<Image
							src={mainImage.image_url}
							alt={localized(product, 'name', lang)}
							fit={product.card_image_fit ?? 'cover'}
							style={{ objectPosition: product.card_image_focus ?? '50% 50%' }}
							loading="lazy"
						/>
					) : (
						<Box
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'var(--sf-surface-alt)',
							}}
						>
							<IconPhoto size={40} color="var(--sf-text-dim)" />
						</Box>
					)}
				</AspectRatio>
			</Card.Section>

			<Text fw={600} mt="sm" lineClamp={1}>
				{localized(product, 'name', lang)}
			</Text>
			<Group justify="space-between" align="center" mt={4}>
				<Price
					eur={sale?.onSale ? sale.price : product.price_eur}
					original={sale?.onSale ? sale.original : undefined}
					size="md"
				/>
				{product.has_colors && colors.length > 0 && (
					<Group gap={4}>
						{colors.slice(0, 5).map((color) => (
							<Box
								key={color.id}
								w={14}
								h={14}
								style={{
									borderRadius: '50%',
									backgroundColor: color.color_hex,
									border: '1px solid var(--sf-border)',
								}}
							/>
						))}
					</Group>
				)}
			</Group>
		</Card>
	);
}

export default ProductCard;
