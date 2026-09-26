import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	ActionIcon,
	Box,
	Button,
	Container,
	Group,
	Image,
	LoadingOverlay,
	Modal,
	Stack,
	Switch,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getProducts, updateProductFlags, deleteProduct } from '@services/productService';
import { localized } from '@lib/localized';
import { formatEur } from '@lib/currency';

const slug = brand.adminSlug;

function ProductsPage() {
	const { t, i18n } = useTranslation();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	useEffect(() => {
		getProducts()
			.then(setProducts)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const thumbnail = (product) => {
		const sorted = (product.product_images ?? [])
			.slice()
			.sort((a, b) => a.sort_order - b.sort_order);
		return sorted[0]?.image_url ?? null;
	};

	const handleFlagToggle = async (product, flag, value) => {
		setProducts((current) =>
			current.map((p) => (p.id === product.id ? { ...p, [flag]: value } : p))
		);
		try {
			await updateProductFlags(product.id, { [flag]: value });
		} catch {
			setProducts((current) =>
				current.map((p) => (p.id === product.id ? { ...p, [flag]: product[flag] } : p))
			);
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteProduct(deleteTarget);
			setProducts((current) => current.filter((p) => p.id !== deleteTarget.id));
			closeDelete();
			notifications.show({ message: t('productsAdmin.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = products.map((product) => (
		<Table.Tr key={product.id}>
			<Table.Td>
				{thumbnail(product) ? (
					<Image src={thumbnail(product)} w={56} h={40} radius="sm" fit="cover" />
				) : (
					<Box w={56} h={40} style={{ background: 'var(--sf-surface-alt)', borderRadius: 4 }} />
				)}
			</Table.Td>
			<Table.Td>{product.sku}</Table.Td>
			<Table.Td>{localized(product, 'name', i18n.language)}</Table.Td>
			<Table.Td>{localized(product.categories, 'name', i18n.language) || '—'}</Table.Td>
			<Table.Td>{formatEur(product.price_eur)}</Table.Td>
			<Table.Td>
				<Switch
					size="xs"
					checked={product.is_active}
					onChange={(e) => handleFlagToggle(product, 'is_active', e.currentTarget.checked)}
				/>
			</Table.Td>
			<Table.Td>
				<Switch
					size="xs"
					checked={product.featured}
					onChange={(e) => handleFlagToggle(product, 'featured', e.currentTarget.checked)}
				/>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<ActionIcon variant="light" component={Link} to={`/${slug}/products/${product.id}`}>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(product);
							openDelete();
						}}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="xl">
			<Group justify="space-between" mb="lg">
				<Title order={2}>{t('admin.products')}</Title>
				<Button leftSection={<IconPlus size={16} />} component={Link} to={`/${slug}/products/new`}>
					{t('productsAdmin.add')}
				</Button>
			</Group>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={760}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th />
							<Table.Th>{t('productsAdmin.sku')}</Table.Th>
							<Table.Th>{t('productsAdmin.nameBg')}</Table.Th>
							<Table.Th>{t('productsAdmin.category')}</Table.Th>
							<Table.Th>{t('productsAdmin.price')}</Table.Th>
							<Table.Th>{t('productsAdmin.active')}</Table.Th>
							<Table.Th>{t('productsAdmin.featured')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('productsAdmin.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('productsAdmin.deleteWarning')}
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={closeDelete}>
							{t('common.cancel')}
						</Button>
						<Button color="red" onClick={handleDelete}>
							{t('common.delete')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}

export default ProductsPage;
