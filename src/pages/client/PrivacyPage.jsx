import { Container, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@lib/meta';

function PrivacyPage() {
	const { t } = useTranslation();
	usePageMeta({ title: t('privacy.title') });

	return (
		<Container size="md" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('privacy.title')}
			</Title>
			<Text style={{ whiteSpace: 'pre-wrap' }}>{t('privacy.text')}</Text>
		</Container>
	);
}

export default PrivacyPage;
