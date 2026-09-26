import { Link } from 'react-router-dom';
import { Anchor, Box, Container, Group, Image, Stack, Text } from '@mantine/core';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { useSettingsStore } from '@store/settingsStore';

function Footer() {
	const { t } = useTranslation();
	const settings = useSettingsStore((state) => state.settings);

	const phone = settings.contact_phone;
	const email = settings.contact_email || settings.admin_email;

	return (
		<Box component="footer" mt="auto" style={{ borderTop: '1px solid var(--sf-border)' }}>
			<Container size="xl" py="xl">
				<Group justify="space-between" align="flex-start" gap="xl">
					<Image src={brand.logo.header} alt={brand.siteName} h={38} w="auto" fit="contain" />
					<Stack gap="xs">
						<Text size="sm" fw={600} tt="uppercase" c="brand">
							{t('nav.contact')}
						</Text>
						{phone && (
							<Group gap={6}>
								<IconPhone size={16} color="var(--sf-text-dim)" />
								<Anchor href={`tel:${phone.replace(/\s/g, '')}`} size="sm" c="dimmed">
									{phone}
								</Anchor>
							</Group>
						)}
						{email && (
							<Group gap={6}>
								<IconMail size={16} color="var(--sf-text-dim)" />
								<Anchor href={`mailto:${email}`} size="sm" c="dimmed">
									{email}
								</Anchor>
							</Group>
						)}
					</Stack>
				</Group>
				<Group justify="center" gap="md" mt="xl">
					<Text size="xs" c="dimmed">
						© {new Date().getFullYear()} {brand.siteName}. {t('common.rights')}
					</Text>
					<Anchor component={Link} to="/privacy" size="xs" c="dimmed">
						{t('privacy.title')}
					</Anchor>
					{brand.features.legal && (
						<>
							<Anchor component={Link} to="/terms" size="xs" c="dimmed">
								{t('terms.title')}
							</Anchor>
							<Anchor component={Link} to="/refund" size="xs" c="dimmed">
								{t('refund.title')}
							</Anchor>
						</>
					)}
				</Group>
			</Container>
		</Box>
	);
}

export default Footer;
