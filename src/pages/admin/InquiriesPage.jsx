import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Badge, Box, Container, LoadingOverlay, Table, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getInquiries } from '@services/adminInquiryService';

function InquiriesPage() {
	const { t, i18n } = useTranslation();
	const [inquiries, setInquiries] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getInquiries()
			.then(setInquiries)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const rows = inquiries.map((inquiry) => (
		<Table.Tr key={inquiry.id}>
			<Table.Td>{inquiry.inquiry_number}</Table.Td>
			<Table.Td>
				{new Date(inquiry.created_at).toLocaleDateString(
					i18n.language === 'en' ? 'en-GB' : 'bg-BG'
				)}
			</Table.Td>
			<Table.Td>{inquiry.client_name}</Table.Td>
			<Table.Td>{inquiry.subject || '—'}</Table.Td>
			<Table.Td>
				<Badge color={inquiry.status === 'new' ? 'blue' : 'green'} variant="light">
					{t(`inquiriesAdmin.status.${inquiry.status}`)}
				</Badge>
			</Table.Td>
			<Table.Td>
				<ActionIcon
					variant="light"
					component={Link}
					to={`/${brand.adminSlug}/inquiries/${inquiry.id}`}
				>
					<IconEye size={16} />
				</ActionIcon>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="lg">
			<Title order={2} mb="lg">
				{t('admin.inquiries')}
			</Title>
			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={640}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>№</Table.Th>
							<Table.Th>{t('ordersAdmin.date')}</Table.Th>
							<Table.Th>{t('ordersAdmin.client')}</Table.Th>
							<Table.Th>{t('inquiry.subject')}</Table.Th>
							<Table.Th>{t('ordersAdmin.statusLabel')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>
		</Container>
	);
}

export default InquiriesPage;
