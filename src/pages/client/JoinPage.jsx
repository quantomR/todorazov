import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Button,
	Card,
	Container,
	FileInput,
	Paper,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCircleCheck, IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getOpenPositions } from '@services/positionService';
import { createApplication, uploadCv } from '@services/applicationService';
import { usePageMeta } from '@lib/meta';

const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword';

function JoinPage() {
	const { t, i18n } = useTranslation();
	usePageMeta({ title: t('careers.title') });
	const [positions, setPositions] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		getOpenPositions()
			.then(setPositions)
			.catch(() => {});
	}, []);

	const positionOptions = useMemo(
		() => [
			{ value: '', label: t('careers.generalIdea') },
			...positions.map((p) => ({ value: p.id, label: p[`title_${i18n.language}`] ?? p.title_bg })),
		],
		[positions, i18n.language, t]
	);

	const form = useForm({
		initialValues: { position_id: '', name: '', email: '', phone: '', message: '', cv: null },
		validate: {
			name: (v) => (!v.trim() ? t('auth.required') : null),
			email: (v) => (!/\S+@\S+\.\S+/.test(v) ? t('common.invalidEmail') : null),
			message: (v) => (!v.trim() ? t('auth.required') : null),
			cv: (v) => (v && v.size > MAX_CV_BYTES ? t('careers.cvTooLarge') : null),
		},
	});

	const handleSubmit = async (values) => {
		setSubmitting(true);
		try {
			let cvPath = null;
			if (values.cv) cvPath = await uploadCv(values.cv);
			await createApplication({
				position_id: values.position_id,
				name: values.name,
				email: values.email,
				phone: values.phone,
				message: values.message,
				cv_path: cvPath,
				cv_name: values.cv?.name ?? null,
			});
			setSubmitted(true);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<Container size="sm" py={80}>
				<Stack align="center" gap="md">
					<IconCircleCheck size={64} color="var(--sf-success)" />
					<Title order={2} ta="center">
						{t('careers.successTitle')}
					</Title>
					<Text c="dimmed" ta="center">
						{t('careers.successText')}
					</Text>
					<Button component={Link} to="/" variant="outline" mt="md">
						{t('common.backHome')}
					</Button>
				</Stack>
			</Container>
		);
	}

	return (
		<Container size="sm" py="xl">
			<Title order={1} c="brand" mb={4}>
				{t('careers.title')}
			</Title>
			<Text c="dimmed" mb="xl">
				{t('careers.subtitle')}
			</Text>

			{positions.length > 0 && (
				<Stack gap="sm" mb="xl">
					<Title order={4}>{t('careers.openPositions')}</Title>
					{positions.map((p) => (
						<Card key={p.id} withBorder padding="md">
							<Text fw={600}>{p[`title_${i18n.language}`] ?? p.title_bg}</Text>
							{(p[`description_${i18n.language}`] ?? p.description_bg) && (
								<Text size="sm" c="dimmed" mt={4}>
									{p[`description_${i18n.language}`] ?? p.description_bg}
								</Text>
							)}
						</Card>
					))}
				</Stack>
			)}

			<Paper withBorder p="lg">
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap="md">
						<Select
							label={t('careers.position')}
							data={positionOptions}
							{...form.getInputProps('position_id')}
						/>
						<TextInput label={t('careers.name')} withAsterisk {...form.getInputProps('name')} />
						<TextInput label={t('careers.email')} withAsterisk {...form.getInputProps('email')} />
						<TextInput label={t('careers.phone')} {...form.getInputProps('phone')} />
						<Textarea
							label={t('careers.message')}
							placeholder={t('careers.messagePlaceholder')}
							withAsterisk
							autosize
							minRows={4}
							{...form.getInputProps('message')}
						/>
						<FileInput
							label={t('careers.cv')}
							description={t('careers.cvHint')}
							accept={CV_ACCEPT}
							clearable
							leftSection={<IconPaperclip size={16} />}
							{...form.getInputProps('cv')}
						/>
						<Button type="submit" loading={submitting}>
							{t('careers.submit')}
						</Button>
					</Stack>
				</form>
			</Paper>
		</Container>
	);
}

export default JoinPage;
