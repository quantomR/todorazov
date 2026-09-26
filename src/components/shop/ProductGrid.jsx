import { SimpleGrid, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';

function ProductGrid({ products }) {
	const { t } = useTranslation();

	if (products.length === 0) {
		return (
			<Text c="dimmed" ta="center" py="xl">
				{t('shop.empty')}
			</Text>
		);
	}

	return (
		<SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</SimpleGrid>
	);
}

export default ProductGrid;
