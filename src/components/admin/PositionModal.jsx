import { useEffect } from 'react';
import {
	Button,
	Group,
	Modal,
	NumberInput,
	Stack,
	Switch,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

const EMPTY = {
	title_bg: '',
	title_en: '',
	description_bg: '',
	description_en: '',
	is_open: true,
	sort_order: 0,
};

function PositionModal({ opened, onClose, onSubmit, position }) {
	const { t } = useTranslation();
	const isEdit = Boolean(position);

	const form = useForm({
		initialValues: EMPTY,
		validate: {
			title_bg: (v) => (!v.trim() ? t('auth.required') : null),
			title_en: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	useEffect(() => {
		if (position) {
			form.setValues({
				title_bg: position.title_bg,
				title_en: position.title_en,
				description_bg: position.description_bg ?? '',
				description_en: position.description_en ?? '',
				is_open: position.is_open,
				sort_order: position.sort_order ?? 0,
			});
		} else {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position, opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('positions.edit') : t('positions.add')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<Group grow>
						<TextInput
							label={t('positions.titleBg')}
							withAsterisk
							{...form.getInputProps('title_bg')}
						/>
						<TextInput
							label={t('positions.titleEn')}
							withAsterisk
							{...form.getInputProps('title_en')}
						/>
					</Group>
					<Textarea
						label={t('positions.descBg')}
						autosize
						minRows={2}
						{...form.getInputProps('description_bg')}
					/>
					<Textarea
						label={t('positions.descEn')}
						autosize
						minRows={2}
						{...form.getInputProps('description_en')}
					/>
					<Group justify="space-between">
						<NumberInput
							label={t('positions.sortOrder')}
							w={120}
							{...form.getInputProps('sort_order')}
						/>
						<Switch
							label={t('positions.open')}
							mt="lg"
							{...form.getInputProps('is_open', { type: 'checkbox' })}
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

export default PositionModal;
