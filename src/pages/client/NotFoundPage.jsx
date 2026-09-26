import { Link } from 'react-router-dom';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@lib/meta';

function NotFoundPage() {
	const { t } = useTranslation();
	usePageMeta({ title: t('common.notFoundTitle'), noindex: true });

	return (
		<Container size="sm" py={80}>
			<Stack align="center" gap="md">
				<Title order={1} c="brand">
					404
				</Title>
				<Title order={3}>{t('common.notFoundTitle')}</Title>
				<Text c="dimmed" ta="center">
					{t('common.notFoundText')}
				</Text>
				<Button component={Link} to="/" variant="outline" mt="md">
					{t('common.backHome')}
				</Button>
			</Stack>
		</Container>
	);
}

export default NotFoundPage;
