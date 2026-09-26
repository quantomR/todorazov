import { useEffect, useMemo, useState } from 'react';
import { Anchor, Container, Group, Stack, Text, Title } from '@mantine/core';
import {
	IconBrandFacebook,
	IconBrandInstagram,
	IconClock,
	IconMail,
	IconMapPin,
	IconPhone,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { useSettingsStore } from '@store/settingsStore';
import { usePageMeta } from '@lib/meta';
import { googleMapsUrl, wazeUrl } from '@lib/maps';
import { DAYS, DAY_LABEL_KEY } from '@lib/days';
import { getBusinessHours } from '@services/hoursService';

function ContactLine({ icon: Icon, href, label }) {
	if (!label) return null;
	return (
		<Group gap="sm">
			<Icon size={20} color="var(--sf-text-dim)" />
			<Anchor href={href} size="lg">
				{label}
			</Anchor>
		</Group>
	);
}

function ContactPage() {
	const { t } = useTranslation();
	const settings = useSettingsStore((state) => state.settings);
	const email = settings.contact_email || settings.admin_email;
	const address = settings.contact_address;
	const [hours, setHours] = useState([]);

	useEffect(() => {
		if (!brand.features.hours) return;
		getBusinessHours()
			.then(setHours)
			.catch(() => {});
	}, []);

	const hoursByDay = useMemo(() => new Map(hours.map((h) => [h.day, h])), [hours]);
	const hasHours = brand.features.hours && hours.some((h) => h.closed || h.hours);

	const jsonLd = useMemo(() => {
		if (!brand.siteUrl || !address) return null;
		return {
			'@context': 'https://schema.org',
			'@type': 'LocalBusiness',
			name: brand.siteName,
			url: brand.siteUrl,
			image: `${brand.siteUrl}${brand.logo.og}`,
			...(settings.contact_phone && { telephone: settings.contact_phone }),
			...(email && { email }),
			address: { '@type': 'PostalAddress', streetAddress: address },
		};
	}, [address, email, settings.contact_phone]);

	usePageMeta({ title: t('contact.title'), jsonLd });

	return (
		<Container size="md" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('contact.title')}
			</Title>
			<Stack gap="md">
				<ContactLine
					icon={IconPhone}
					href={`tel:${settings.contact_phone?.replace(/\s/g, '')}`}
					label={settings.contact_phone}
				/>
				<ContactLine icon={IconMail} href={`mailto:${email}`} label={email} />

				{address && (
					<Group gap="sm" align="flex-start" wrap="nowrap">
						<IconMapPin size={20} color="var(--sf-text-dim)" style={{ marginTop: 4 }} />
						<div>
							<Anchor href={googleMapsUrl(address)} target="_blank" rel="noreferrer" size="lg">
								{address}
							</Anchor>
							<Anchor
								href={wazeUrl(address)}
								target="_blank"
								rel="noreferrer"
								size="sm"
								c="dimmed"
								display="block"
							>
								Waze
							</Anchor>
						</div>
					</Group>
				)}

				{hasHours && (
					<Group gap="sm" align="flex-start" wrap="nowrap">
						<IconClock size={20} color="var(--sf-text-dim)" style={{ marginTop: 4 }} />
						<Stack gap={4}>
							<Text fw={600}>{t('contact.workingHours')}</Text>
							{DAYS.map((day) => {
								const h = hoursByDay.get(day);
								return (
									<Group key={day} justify="space-between" gap="xl" wrap="nowrap" maw={280}>
										<Text>{t(DAY_LABEL_KEY[day])}</Text>
										<Text c={h?.closed || !h?.hours ? 'dimmed' : undefined}>
											{h?.closed || !h?.hours ? t('contact.closed') : h.hours}
										</Text>
									</Group>
								);
							})}
						</Stack>
					</Group>
				)}

				<ContactLine
					icon={IconBrandInstagram}
					href={brand.contact.instagram}
					label={brand.contact.instagram ? 'Instagram' : null}
				/>
				<ContactLine
					icon={IconBrandFacebook}
					href={brand.contact.facebook}
					label={brand.contact.facebook ? 'Facebook' : null}
				/>
			</Stack>
		</Container>
	);
}

export default ContactPage;
