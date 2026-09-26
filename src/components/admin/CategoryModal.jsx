import { useEffect } from 'react';
import { Modal, TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

function CategoryModal({ opened, onClose, onSubmit, category }) {
	const { t } = useTranslation();
	const isEdit = Boolean(category);

	const form = useForm({
		initialValues: { name_bg: '', name_en: '' },
		validate: {
			name_bg: (v) => (!v.trim() ? t('auth.required') : null),
			name_en: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		if (category) {
			form.setValues({ name_bg: category.name_bg, name_en: category.name_en });
		} else {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [category, opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('categories.edit') : t('categories.add')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<TextInput label={t('categories.nameBg')} {...form.getInputProps('name_bg')} />
					<TextInput label={t('categories.nameEn')} {...form.getInputProps('name_en')} />
					<Button type="submit" fullWidth>
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}

export default CategoryModal;
