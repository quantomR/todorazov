import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button, Container, Loader, Stack, Text, Title } from '@mantine/core';
import { IconCircleCheck, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getCardOrderStatus } from '@services/orderService';
import { usePageMeta } from '@lib/meta';

function ThankYouPage() {
	const { t } = useTranslation();
	usePageMeta({ title: t('thankYou.title'), noindex: true });
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const session = searchParams.get('session');
	const isCard = brand.features.payments && Boolean(session);
	const orderNumber = searchParams.get('order') || location.state?.orderNumber;
	// null = still checking, otherwise 'paid' | 'pending' | 'failed'
	const [payment, setPayment] = useState(isCard ? null : 'done');

	useEffect(() => {
		if (!isCard) return;
		let cancelled = false;
		let attempts = 0;
		const poll = async () => {
			try {
				const { paymentStatus } = await getCardOrderStatus({ orderNumber, session });
				if (cancelled) return;
				if (paymentStatus === 'paid' || paymentStatus === 'failed' || attempts >= 7) {
					setPayment(paymentStatus);
					return;
				}
			} catch {
				if (attempts >= 7) return setPayment('pending');
			}
			attempts += 1;
			setTimeout(poll, 2500);
		};
		poll();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const processing = isCard && payment === null;
	const paid = payment === 'paid' || payment === 'done';

	return (
		<Container size="sm" py={80}>
			<Stack align="center" gap="md">
				{processing ? (
					<Loader />
				) : paid ? (
					<IconCircleCheck size={64} color="var(--sf-success)" />
				) : (
					<IconClock size={64} color="var(--sf-text-dim)" />
				)}
				<Title order={2} ta="center">
					{processing ? t('thankYou.processing') : t('thankYou.title')}
				</Title>
				{orderNumber && !processing && (
					<Text c="dimmed">
						{t('thankYou.orderNumber')}: <b>{orderNumber}</b>
					</Text>
				)}
				<Text c="dimmed" ta="center">
					{processing
						? t('thankYou.processingText')
						: isCard && !paid
							? t('thankYou.pendingText')
							: t('thankYou.text')}
				</Text>
				{!processing && (
					<Button component={Link} to="/shop" variant="outline" mt="md">
						{t('thankYou.backToShop')}
					</Button>
				)}
			</Stack>
		</Container>
	);
}

export default ThankYouPage;
