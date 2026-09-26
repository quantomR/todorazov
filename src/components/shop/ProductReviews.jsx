import { useEffect, useState } from 'react';
import {
	Button,
	Divider,
	Group,
	Paper,
	Rating,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { getApprovedReviews, submitReview } from '@services/reviewService';

function ProductReviews({ productId }) {
	const { t } = useTranslation();
	const [reviews, setReviews] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	const form = useForm({
		initialValues: { author_name: '', rating: 0, comment: '' },
		validate: {
			author_name: (v) => (!v.trim() ? t('auth.required') : null),
			rating: (v) => (v < 1 ? t('reviews.ratingRequired') : null),
		},
	});

	useEffect(() => {
		getApprovedReviews(productId)
			.then(setReviews)
			.catch(() => {});
	}, [productId]);

	const handleSubmit = async (values) => {
		setSubmitting(true);
		try {
			await submitReview({ product_id: productId, ...values });
			form.reset();
			notifications.show({ message: t('reviews.submitted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Stack gap="lg" mt="xl">
			<Title order={3}>{t('reviews.title')}</Title>

			{reviews.length === 0 ? (
				<Text c="dimmed" size="sm">
					{t('reviews.empty')}
				</Text>
			) : (
				<Stack gap="sm">
					{reviews.map((review) => (
						<Paper key={review.id} withBorder p="md">
							<Group justify="space-between" mb={4}>
								<Text fw={600}>{review.author_name}</Text>
								<Rating value={review.rating} readOnly size="sm" />
							</Group>
							{review.comment && <Text size="sm">{review.comment}</Text>}
						</Paper>
					))}
				</Stack>
			)}

			<Divider label={t('reviews.writeTitle')} labelPosition="center" />

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="sm" maw={480}>
					<TextInput
						label={t('reviews.yourName')}
						withAsterisk
						{...form.getInputProps('author_name')}
					/>
					<div>
						<Text size="sm" fw={500} mb={4}>
							{t('reviews.yourRating')}
						</Text>
						<Rating {...form.getInputProps('rating')} />
						{form.errors.rating && (
							<Text size="xs" c="red" mt={4}>
								{form.errors.rating}
							</Text>
						)}
					</div>
					<Textarea
						label={t('reviews.yourComment')}
						autosize
						minRows={2}
						{...form.getInputProps('comment')}
					/>
					<Button type="submit" loading={submitting} w="fit-content">
						{t('reviews.submit')}
					</Button>
					<Text size="xs" c="dimmed">
						{t('reviews.moderationNote')}
					</Text>
				</Stack>
			</form>
		</Stack>
	);
}

export default ProductReviews;
