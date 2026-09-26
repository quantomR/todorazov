import { useEffect } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

const EMPTY = {
	category_bg: '',
	category_en: '',
	name_bg: '',
	name_en: '',
	price_eur: '',
	is_active: true,
	sort_order: 0,
};

function ServiceModal({ opened, onClose, onSubmit, service }) {
	const { t } = useTranslation();
	const isEdit = Boolean(service);

	const form = useForm({
		initialValues: EMPTY,
		validate: {
			name_bg: (v) => (!v.trim() ? t('auth.required') : null),
			name_en: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		if (service) {
			form.setValues({
				category_bg: service.category_bg ?? '',
				category_en: service.category_en ?? '',
				name_bg: service.name_bg,
				name_en: service.name_en,
				price_eur: service.price_eur ?? '',
				is_active: service.is_active,
				sort_order: service.sort_order ?? 0,
			});
		} else {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [service, opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('services.edit') : t('services.add')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<Group grow>
						<TextInput label={t('services.categoryBg')} {...form.getInputProps('category_bg')} />
						<TextInput label={t('services.categoryEn')} {...form.getInputProps('category_en')} />
					</Group>
					<Group grow>
						<TextInput
							label={t('services.nameBg')}
							withAsterisk
							{...form.getInputProps('name_bg')}
						/>
						<TextInput
							label={t('services.nameEn')}
							withAsterisk
							{...form.getInputProps('name_en')}
						/>
					</Group>
					<NumberInput
						label={t('services.price')}
						description={t('services.priceHint')}
						min={0}
						decimalScale={2}
						{...form.getInputProps('price_eur')}
					/>
					<Group justify="space-between">
						<NumberInput
							label={t('services.sortOrder')}
							w={120}
							{...form.getInputProps('sort_order')}
						/>
						<Switch
							label={t('services.active')}
							mt="lg"
							{...form.getInputProps('is_active', { type: 'checkbox' })}
						/>
					</Group>
					<Button type="submit" fullWidth>
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}

export default ServiceModal;
