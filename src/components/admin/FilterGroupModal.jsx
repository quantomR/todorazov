import { useEffect, useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Modal,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';

const emptyOption = () => ({ id: crypto.randomUUID(), value_bg: '', value_en: '' });

function FilterGroupModal({ opened, onClose, onSubmit, group, categories }) {
	const { t, i18n } = useTranslation();
	const isEdit = Boolean(group);
	const [options, setOptions] = useState([]);

	const form = useForm({
		initialValues: {
			name_bg: '',
			name_en: '',
			category_id: null,
			type: 'checkbox',
			unit: '',
			sort_order: 0,
		},
		validate: {
			name_bg: (v) => (!v.trim() ? t('auth.required') : null),
			name_en: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	// Sync local state to the edited group whenever the modal opens.
	useEffect(() => {
		/* eslint-disable react-hooks/set-state-in-effect */
		if (group) {
			form.setValues({
				name_bg: group.name_bg,
				name_en: group.name_en,
				category_id: group.category_id,
				type: group.type,
				unit: group.unit ?? '',
				sort_order: group.sort_order ?? 0,
			});
			setOptions(
				(group.filter_options ?? [])
					.slice()
					.sort((a, b) => a.sort_order - b.sort_order)
					.map((o) => ({ id: o.id, value_bg: o.value_bg, value_en: o.value_en }))
			);
		} else {
			form.reset();
			setOptions([]);
		}
		/* eslint-enable react-hooks/set-state-in-effect */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group, opened]);

	const setOptionField = (id, field, value) =>
		setOptions((current) => current.map((o) => (o.id === id ? { ...o, [field]: value } : o)));

	const handleSubmit = (values) => {
		onSubmit({
			...values,
			id: group?.id ?? null,
			category_id: values.category_id ?? null,
			options:
				values.type === 'checkbox'
					? options
							.filter((o) => o.value_bg.trim() || o.value_en.trim())
							.map((o, index) => ({ ...o, sort_order: index }))
					: [],
		});
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEdit ? t('filters.edit') : t('filters.add')}
			centered
			size="lg"
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<Group grow>
						<TextInput
							label={t('filters.nameBg')}
							withAsterisk
							{...form.getInputProps('name_bg')}
						/>
						<TextInput
							label={t('filters.nameEn')}
							withAsterisk
							{...form.getInputProps('name_en')}
						/>
					</Group>
					<Group grow>
						<Select
							label={t('filters.category')}
							placeholder={t('filters.allCategories')}
							clearable
							data={categories.map((c) => ({
								value: c.id,
								label: localized(c, 'name', i18n.language),
							}))}
							{...form.getInputProps('category_id')}
						/>
						<TextInput
							label={t('filters.unit')}
							placeholder={t('filters.unitPlaceholder')}
							{...form.getInputProps('unit')}
						/>
					</Group>
					<Group justify="space-between" align="flex-end">
						<div>
							<Text size="sm" fw={500} mb={4}>
								{t('filters.type')}
							</Text>
							<SegmentedControl
								data={[
									{ value: 'checkbox', label: t('filters.typeCheckbox') },
									{ value: 'range', label: t('filters.typeRange') },
								]}
								{...form.getInputProps('type')}
							/>
						</div>
						<NumberInput
							label={t('filters.sortOrder')}
							w={110}
							{...form.getInputProps('sort_order')}
						/>
					</Group>

					{form.values.type === 'checkbox' && (
						<Stack gap="xs">
							<Text size="sm" fw={500}>
								{t('filters.options')}
							</Text>
							{options.length === 0 && (
								<Text size="sm" c="dimmed">
									{t('filters.noOptions')}
								</Text>
							)}
							{options.map((option) => (
								<Group key={option.id} gap="xs" wrap="nowrap">
									<TextInput
										flex={1}
										placeholder={t('filters.valueBg')}
										value={option.value_bg}
										onChange={(e) => setOptionField(option.id, 'value_bg', e.currentTarget.value)}
									/>
									<TextInput
										flex={1}
										placeholder={t('filters.valueEn')}
										value={option.value_en}
										onChange={(e) => setOptionField(option.id, 'value_en', e.currentTarget.value)}
									/>
									<ActionIcon
										variant="light"
										color="red"
										onClick={() => setOptions((c) => c.filter((o) => o.id !== option.id))}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Group>
							))}
							<Button
								variant="light"
								size="xs"
								leftSection={<IconPlus size={14} />}
								onClick={() => setOptions((c) => [...c, emptyOption()])}
								w="fit-content"
							>
								{t('filters.addOption')}
							</Button>
						</Stack>
					)}

					<Button type="submit" fullWidth mt="sm">
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}

export default FilterGroupModal;
