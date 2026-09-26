import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { createInquiry } from '@services/inquiryService';
import { notifyInquiry } from '@lib/emailClient';
import { usePageMeta } from '@lib/meta';

function InquiryPage() {
	const { t } = useTranslation();
	usePageMeta({ title: t('inquiry.title') });
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const form = useForm({
		initialValues: { name: '', email: '', phone: '', subject: '', message: '' },
		validate: {
			name: (v) => (!v.trim() ? t('auth.required') : null),
			email: (v) => (!/\S+@\S+\.\S+/.test(v) ? t('common.invalidEmail') : null),
			subject: (v) => (!v.trim() ? t('auth.required') : null),
		},
	});

	const handleSubmit = async (values) => {
		setSubmitting(true);
		try {
			await createInquiry(values);
			notifyInquiry(values).catch(() => {});
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
						{t('inquiry.successTitle')}
					</Title>
					<Text c="dimmed" ta="center">
						{t('inquiry.successText')}
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
				{t('inquiry.title')}
			</Title>
			<Text c="dimmed" mb="xl">
				{t('inquiry.subtitle')}
			</Text>
			<Paper withBorder p="lg">
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap="md">
						<TextInput label={t('inquiry.name')} withAsterisk {...form.getInputProps('name')} />
						<TextInput label={t('inquiry.email')} withAsterisk {...form.getInputProps('email')} />
						<TextInput label={t('inquiry.phone')} {...form.getInputProps('phone')} />
						<TextInput
							label={t('inquiry.subject')}
							withAsterisk
							{...form.getInputProps('subject')}
						/>
						<Textarea
							label={t('inquiry.message')}
							autosize
							minRows={4}
							{...form.getInputProps('message')}
						/>
						<Button type="submit" loading={submitting}>
							{t('inquiry.submit')}
						</Button>
					</Stack>
				</form>
			</Paper>
		</Container>
	);
}

export default InquiryPage;
