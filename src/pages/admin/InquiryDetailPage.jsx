import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Container,
	Group,
	LoadingOverlay,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getInquiryById, updateInquiryStatus, deleteInquiry } from '@services/adminInquiryService';

function Field({ label, value }) {
	if (!value) return null;
	return (
		<div>
			<Text size="xs" c="dimmed" tt="uppercase">
				{label}
			</Text>
			<Text style={{ whiteSpace: 'pre-wrap' }}>{value}</Text>
		</div>
	);
}

function InquiryDetailPage() {
	const { t, i18n } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [inquiry, setInquiry] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getInquiryById(id)
			.then(setInquiry)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleMarkProcessed = async () => {
		try {
			await updateInquiryStatus(id, 'processed');
			setInquiry((current) => ({ ...current, status: 'processed' }));
			notifications.show({ message: t('inquiriesAdmin.processed'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteInquiry(id);
			notifications.show({ message: t('inquiriesAdmin.deleted'), color: 'green' });
			navigate(`/${brand.adminSlug}/inquiries`);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	return (
		<Container size="sm" pos="relative">
			<LoadingOverlay visible={loading} />
			<Group gap="sm" mb="lg">
				<ActionIcon variant="subtle" component={Link} to={`/${brand.adminSlug}/inquiries`}>
					<IconArrowLeft size={20} />
				</ActionIcon>
				<Title order={2}>
					{t('inquiriesAdmin.title')} {inquiry?.inquiry_number}
				</Title>
			</Group>

			{inquiry && (
				<Card withBorder>
					<Stack gap="md">
						<Group justify="space-between">
							<Badge color={inquiry.status === 'new' ? 'blue' : 'green'} variant="light">
								{t(`inquiriesAdmin.status.${inquiry.status}`)}
							</Badge>
							<Text size="sm" c="dimmed">
								{new Date(inquiry.created_at).toLocaleString(
									i18n.language === 'en' ? 'en-GB' : 'bg-BG'
								)}
							</Text>
						</Group>
						<Field label={t('inquiry.name')} value={inquiry.client_name} />
						<Field label={t('inquiry.email')} value={inquiry.client_email} />
						<Field label={t('inquiry.phone')} value={inquiry.client_phone} />
						<Field label={t('inquiry.subject')} value={inquiry.subject} />
						<Field label={t('inquiry.message')} value={inquiry.message} />
						<Group mt="md">
							{inquiry.status === 'new' && (
								<Button onClick={handleMarkProcessed}>{t('inquiriesAdmin.markProcessed')}</Button>
							)}
							<Button color="red" variant="light" onClick={handleDelete}>
								{t('common.delete')}
							</Button>
						</Group>
					</Stack>
				</Card>
			)}
		</Container>
	);
}

export default InquiryDetailPage;
