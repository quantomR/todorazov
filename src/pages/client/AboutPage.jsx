import { Container, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@lib/meta';

function AboutPage() {
	const { t } = useTranslation();
	usePageMeta({ title: t('about.title') });

	return (
		<Container size="md" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('about.title')}
			</Title>
			<Text style={{ whiteSpace: 'pre-wrap' }}>{t('about.text')}</Text>
		</Container>
	);
}

export default AboutPage;
