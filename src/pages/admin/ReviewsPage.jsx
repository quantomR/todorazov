import { useEffect, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Box,
	Container,
	Group,
	LoadingOverlay,
	Rating,
	Switch,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';
import { getAllReviews, setReviewApproved, deleteReview } from '@services/reviewService';

function ReviewsPage() {
	const { t, i18n } = useTranslation();
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getAllReviews()
			.then(setReviews)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleApproved = async (review) => {
		try {
			await setReviewApproved(review.id, !review.is_approved);
			setReviews((current) =>
				current.map((r) => (r.id === review.id ? { ...r, is_approved: !r.is_approved } : r))
			);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async (review) => {
		try {
			await deleteReview(review.id);
			setReviews((current) => current.filter((r) => r.id !== review.id));
			notifications.show({ message: t('reviews.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = reviews.map((review) => (
		<Table.Tr key={review.id}>
			<Table.Td>{localized(review.products, 'name', i18n.language)}</Table.Td>
			<Table.Td>{review.author_name}</Table.Td>
			<Table.Td>
				<Rating value={review.rating} readOnly size="xs" />
			</Table.Td>
			<Table.Td>
				<Text size="sm" lineClamp={2} maw={280}>
					{review.comment}
				</Text>
			</Table.Td>
			<Table.Td>
				<Group gap="sm" wrap="nowrap">
					<Switch
						checked={review.is_approved}
						onChange={() => toggleApproved(review)}
						label={
							<Badge variant="light" color={review.is_approved ? 'green' : 'gray'}>
								{review.is_approved ? t('reviews.approved') : t('reviews.pending')}
							</Badge>
						}
					/>
					<ActionIcon variant="light" color="red" onClick={() => handleDelete(review)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="lg">
			<Title order={2} mb="lg">
				{t('reviews.adminTitle')}
			</Title>
			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={640}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('reviews.product')}</Table.Th>
							<Table.Th>{t('reviews.author')}</Table.Th>
							<Table.Th>{t('reviews.rating')}</Table.Th>
							<Table.Th>{t('reviews.comment')}</Table.Th>
							<Table.Th>{t('reviews.status')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>
		</Container>
	);
}

export default ReviewsPage;
