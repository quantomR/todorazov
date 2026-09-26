import { useRef, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
	Anchor,
	Button,
	Checkbox,
	Container,
	Divider,
	Grid,
	Group,
	Paper,
	SegmentedControl,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import useCartStore from '@store/cartStore';
import { createOrder, startCardCheckout } from '@services/orderService';
import { notifyOrder } from '@lib/emailClient';
import { usePageMeta } from '@lib/meta';
import Price from '@components/shop/Price';
import OfficePicker from '@components/shop/OfficePicker';

function CheckoutPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { items, clearCart } = useCartStore();
	const [submitting, setSubmitting] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState('cod');
	const [deliveryMethod, setDeliveryMethod] = useState('address');
	const [office, setOffice] = useState(null);
	// Read in the (static) form validators so they react to the current choice.
	const deliveryRef = useRef('address');
	const totalEur = items.reduce((sum, i) => sum + i.priceEur * i.qty, 0);
	usePageMeta({ title: t('checkout.title'), noindex: true });

	const setDelivery = (value) => {
		deliveryRef.current = value;
		setDeliveryMethod(value);
	};
	const officeMode = brand.features.courier && deliveryMethod === 'office';

	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			phone: '',
			email: '',
			address: '',
			city: '',
			zip: '',
			note: '',
			consent: false,
		},
		validate: {
			firstName: (v) => (!v.trim() ? t('auth.required') : null),
			lastName: (v) => (!v.trim() ? t('auth.required') : null),
			phone: (v) => (!v.trim() ? t('auth.required') : null),
			email: (v) => (v && !/\S+@\S+\.\S+/.test(v) ? t('common.invalidEmail') : null),
			address: (v) => (deliveryRef.current === 'address' && !v.trim() ? t('auth.required') : null),
			city: (v) => (deliveryRef.current === 'address' && !v.trim() ? t('auth.required') : null),
			consent: (v) => (!v ? t('checkout.consentRequired') : null),
		},
	});

	if (items.length === 0) {
		return <Navigate to="/cart" replace />;
	}

	const handleSubmit = async (values) => {
		if (officeMode && !office) {
			notifications.show({ message: t('checkout.officeRequired'), color: 'red' });
			return;
		}
		const deliveryAddress = officeMode
			? { method: 'office', office: `${office.name} — ${office.city}`, officeId: office.id }
			: { method: 'address', address: values.address, city: values.city, zip: values.zip };
		// Card path builds delivery from form fields — carry the office there too.
		const cardForm = officeMode
			? { ...values, address: deliveryAddress.office, city: office.city }
			: values;
		setSubmitting(true);
		try {
			if (brand.features.payments && paymentMethod === 'card') {
				const { url } = await startCardCheckout({ form: cardForm, items, lang: i18n.language });
				clearCart();
				window.location.assign(url);
				return;
			}
			const { orderNumber } = await createOrder({ form: values, items, totalEur, deliveryAddress });
			notifyOrder({ orderNumber, form: values, items, totalEur }).catch(() => {});
			clearCart();
			navigate('/thank-you', { state: { orderNumber } });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
			setSubmitting(false);
		}
	};

	return (
		<Container size="lg" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('checkout.title')}
			</Title>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Grid gutter="lg">
					<Grid.Col span={{ base: 12, md: 8 }}>
						<Paper withBorder p="lg" mb="md">
							<Title order={4} mb="sm">
								{t('checkout.contactTitle')}
							</Title>
							<Grid gutter="md">
								<Grid.Col span={{ base: 12, sm: 6 }}>
									<TextInput
										label={t('checkout.firstName')}
										withAsterisk
										{...form.getInputProps('firstName')}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6 }}>
									<TextInput
										label={t('checkout.lastName')}
										withAsterisk
										{...form.getInputProps('lastName')}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6 }}>
									<TextInput
										label={t('checkout.phone')}
										withAsterisk
										{...form.getInputProps('phone')}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6 }}>
									<TextInput label={t('checkout.email')} {...form.getInputProps('email')} />
								</Grid.Col>
							</Grid>
						</Paper>
						<Paper withBorder p="lg">
							<Title order={4} mb="sm">
								{t('checkout.deliveryTitle')}
							</Title>
							{brand.features.courier && (
								<SegmentedControl
									fullWidth
									mb="md"
									value={deliveryMethod}
									onChange={setDelivery}
									data={[
										{ value: 'address', label: t('checkout.deliveryAddress') },
										{ value: 'office', label: t('checkout.deliveryOffice') },
									]}
								/>
							)}
							{officeMode ? (
								<OfficePicker value={office} onChange={setOffice} />
							) : (
								<Grid gutter="md">
									<Grid.Col span={12}>
										<TextInput
											label={t('checkout.address')}
											withAsterisk
											{...form.getInputProps('address')}
										/>
									</Grid.Col>
									<Grid.Col span={{ base: 8 }}>
										<TextInput
											label={t('checkout.city')}
											withAsterisk
											{...form.getInputProps('city')}
										/>
									</Grid.Col>
									<Grid.Col span={{ base: 4 }}>
										<TextInput label={t('checkout.zip')} {...form.getInputProps('zip')} />
									</Grid.Col>
								</Grid>
							)}
							<Textarea
								label={t('checkout.note')}
								autosize
								minRows={2}
								mt="md"
								{...form.getInputProps('note')}
							/>
						</Paper>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper withBorder p="md">
							<Title order={4} mb="sm">
								{t('cart.summary')}
							</Title>
							{items.map((item) => (
								<Group key={item.lineId} justify="space-between" gap="xs" py={4}>
									<Text size="sm" style={{ flex: 1 }} lineClamp={1}>
										{i18n.language === 'en' ? item.nameEn : item.nameBg}
										{item.sizeLabel ? ` · ${item.sizeLabel}` : ''} × {item.qty}
									</Text>
									<Price eur={item.priceEur * item.qty} size="sm" fw={500} />
								</Group>
							))}
							<Divider my="sm" />
							<Group justify="space-between" mb="md">
								<Text fw={600}>{t('cart.total')}</Text>
								<Price eur={totalEur} />
							</Group>
							{brand.features.payments && (
								<SegmentedControl
									fullWidth
									size="xs"
									mb="sm"
									value={paymentMethod}
									onChange={setPaymentMethod}
									data={[
										{ value: 'cod', label: t('checkout.payCod') },
										{ value: 'card', label: t('checkout.payCard') },
									]}
								/>
							)}
							{paymentMethod === 'cod' && (
								<Text size="xs" c="dimmed" mb="md">
									{t('checkout.codNote')}
								</Text>
							)}
							<Checkbox
								size="xs"
								mb="md"
								label={
									<Text size="xs">
										{t('checkout.consent')}{' '}
										<Anchor component={Link} to="/privacy" size="xs" target="_blank">
											{t('privacy.title')}
										</Anchor>
									</Text>
								}
								{...form.getInputProps('consent', { type: 'checkbox' })}
							/>
							<Button type="submit" fullWidth loading={submitting}>
								{brand.features.payments && paymentMethod === 'card'
									? t('checkout.payCardSubmit')
									: t('checkout.submit')}
							</Button>
						</Paper>
					</Grid.Col>
				</Grid>
			</form>
		</Container>
	);
}

export default CheckoutPage;
