import { Alert, Container, List, Stack, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@lib/meta';

/**
 * Data-driven legal page. The content lives in i18n as an array of sections:
 *   [{ heading, body?, points?: string[] }]
 * so privacy / terms / refund all share one renderer. The draft notice is a
 * reminder that the shipped copy is a starting point, not legal advice.
 */
function LegalPage({ titleKey, sectionsKey }) {
	const { t } = useTranslation();
	const title = t(titleKey);
	usePageMeta({ title });

	const sections = t(sectionsKey, { returnObjects: true });
	const list = Array.isArray(sections) ? sections : [];

	return (
		<Container size="md" py="xl">
			<Title order={1} c="brand" mb="md">
				{title}
			</Title>
			<Alert icon={<IconInfoCircle size={18} />} color="yellow" mb="xl">
				{t('legal.draftNotice')}
			</Alert>
			<Stack gap="xl">
				{list.map((section, index) => (
					<div key={index}>
						{section.heading && (
							<Title order={3} mb="xs">
								{section.heading}
							</Title>
						)}
						{section.body && <Text style={{ whiteSpace: 'pre-wrap' }}>{section.body}</Text>}
						{Array.isArray(section.points) && section.points.length > 0 && (
							<List mt="xs" spacing="xs">
								{section.points.map((point, i) => (
									<List.Item key={i}>{point}</List.Item>
								))}
							</List>
						)}
					</div>
				))}
			</Stack>
		</Container>
	);
}

export default LegalPage;
