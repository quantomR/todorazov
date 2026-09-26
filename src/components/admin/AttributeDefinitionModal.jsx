import { useEffect } from 'react';
import { Modal, TextInput, Button, Stack, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

function AttributeDefinitionModal({ opened, onClose, onSubmit, definition }) {
	const { t } = useTranslation();
	const isEdit = Boolean(definition);

	const form = useForm({
		initialValues: { name_bg: '', name_en: '', collapsed: false },
		validate: {
			name_bg: (v) => (!v.trim() ? t('auth.required') : null),
			name_en: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		if (definition) {
			form.setValues({
				name_bg: definition.name_bg,
				name_en: definition.name_en,
				collapsed: definition.collapsed,
			});
		} else {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [definition, opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('attributes.edit') : t('attributes.add')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<TextInput label={t('attributes.nameBg')} {...form.getInputProps('name_bg')} />
					<TextInput label={t('attributes.nameEn')} {...form.getInputProps('name_en')} />
					<Checkbox
						label={t('attributes.collapsed')}
						description={t('attributes.collapsedHint')}
						{...form.getInputProps('collapsed', { type: 'checkbox' })}
					/>
					<Button type="submit" fullWidth>
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}

export default AttributeDefinitionModal;
