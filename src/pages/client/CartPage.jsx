import { Link } from 'react-router-dom';
import {
	Box,
	Button,
	Container,
	Divider,
	Group,
	Image,
	NumberInput,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
	ActionIcon,
} from '@mantine/core';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useCartStore from '@store/cartStore';
import Price from '@components/shop/Price';
import { usePageMeta } from '@lib/meta';

function CartLine({ item, lang, onQty, onRemove }) {
	const name = lang === 'en' ? item.nameEn : item.nameBg;
	const colorName = lang === 'en' ? item.colorNameEn : item.colorNameBg;

	return (
		<Paper withBorder p="sm">
			<Group wrap="nowrap" align="flex-start">
				{item.imageUrl ? (
					<Image src={item.imageUrl} w={72} h={72} radius="sm" fit="cover" />
				) : (
					<Box
						w={72}
						h={72}
						style={{
							background: 'var(--sf-surface-alt)',
							borderRadius: 6,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<IconPhoto size={24} color="var(--sf-text-dim)" />
					</Box>
				)}
				<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
					<Text fw={600} lineClamp={1}>
						{name}
					</Text>
					<Group gap="xs">
						{item.colorHex && (
							<Group gap={4}>
								<Box
									w={12}
									h={12}
									style={{
										borderRadius: '50%',
										backgroundColor: item.colorHex,
										border: '1px solid var(--sf-border)',
									}}
								/>
								<Text size="xs" c="dimmed">
									{colorName}
								</Text>
							</Group>
						)}
						{item.sizeLabel && (
							<Text size="xs" c="dimmed">
								{item.sizeLabel}
							</Text>
						)}
					</Group>
					<Group gap="sm">
						<NumberInput
							w={80}
							size="xs"
							min={1}
							max={99}
							allowDecimal={false}
							value={item.qty}
							onChange={(value) => onQty(item.lineId, Number(value) || 1)}
						/>
						<Price eur={item.priceEur * item.qty} size="sm" />
					</Group>
				</Stack>
				<ActionIcon variant="subtle" color="red" onClick={() => onRemove(item.lineId)}>
					<IconTrash size={18} />
				</ActionIcon>
			</Group>
		</Paper>
	);
}

function CartPage() {
	const { t, i18n } = useTranslation();
	usePageMeta({ title: t('cart.title'), noindex: true });
	const { items, updateQty, removeItem } = useCartStore();
	const totalEur = items.reduce((sum, i) => sum + i.priceEur * i.qty, 0);

	if (items.length === 0) {
		return (
			<Container size="sm" py={80}>
				<Stack align="center" gap="md">
					<Title order={2}>{t('cart.empty')}</Title>
					<Button component={Link} to="/shop" variant="outline">
						{t('cart.emptyCta')}
					</Button>
				</Stack>
			</Container>
		);
	}

	return (
		<Container size="xl" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('cart.title')}
			</Title>
			<SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
				<Stack gap="sm" style={{ gridColumn: 'span 2' }}>
					{items.map((item) => (
						<CartLine
							key={item.lineId}
							item={item}
							lang={i18n.language}
							onQty={updateQty}
							onRemove={removeItem}
						/>
					))}
				</Stack>
				<Paper withBorder p="md" h="fit-content">
					<Title order={4} mb="sm">
						{t('cart.summary')}
					</Title>
					<Divider mb="sm" />
					<Group justify="space-between" mb="md">
						<Text fw={600}>{t('cart.total')}</Text>
						<Price eur={totalEur} />
					</Group>
					<Button component={Link} to="/checkout" fullWidth>
						{t('cart.checkout')}
					</Button>
				</Paper>
			</SimpleGrid>
		</Container>
	);
}

export default CartPage;
