import { useEffect } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

const EMPTY = {
	code: '',
	discount_type: 'percent',
	discount_value: '',
	is_active: true,
	expires_at: '',
	max_uses: '',
	min_order_eur: '',
};

function CouponModal({ opened, onClose, onSubmit, coupon }) {
	const { t } = useTranslation();
	const isEdit = Boolean(coupon);

	const form = useForm({
		initialValues: EMPTY,
		validate: {
			code: (v) => (!v.trim() ? t('auth.required') : null),
			discount_value: (v) => (v === '' || Number(v) <= 0 ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		if (coupon) {
			form.setValues({
				code: coupon.code,
				discount_type: coupon.discount_type,
				discount_value: coupon.discount_value ?? '',
				is_active: coupon.is_active,
				expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
				max_uses: coupon.max_uses ?? '',
				min_order_eur: coupon.min_order_eur ?? '',
			});
		} else {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [coupon, opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('coupons.edit') : t('coupons.add')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<TextInput
						label={t('coupons.code')}
						description={t('coupons.codeHint')}
						withAsterisk
						{...form.getInputProps('code')}
					/>
					<Group grow>
						<Select
							label={t('coupons.type')}
							data={[
								{ value: 'percent', label: t('coupons.percent') },
								{ value: 'flat', label: t('coupons.flat') },
							]}
							allowDeselect={false}
							{...form.getInputProps('discount_type')}
						/>
						<NumberInput
							label={t('coupons.value')}
							min={0}
							decimalScale={2}
							withAsterisk
							{...form.getInputProps('discount_value')}
						/>
					</Group>
					<Group grow>
						<NumberInput
							label={t('coupons.maxUses')}
							description={t('coupons.optional')}
							min={1}
							{...form.getInputProps('max_uses')}
						/>
						<NumberInput
							label={t('coupons.minOrder')}
							description={t('coupons.optional')}
							min={0}
							decimalScale={2}
							{...form.getInputProps('min_order_eur')}
						/>
					</Group>
					<TextInput
						label={t('coupons.expires')}
						description={t('coupons.optional')}
						type="date"
						{...form.getInputProps('expires_at')}
					/>
					<Switch
						label={t('coupons.active')}
						{...form.getInputProps('is_active', { type: 'checkbox' })}
					/>
					<Button type="submit" fullWidth>
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}

export default CouponModal;
