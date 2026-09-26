import { useEffect, useState } from 'react';
import { Button, Card, Group, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { useSettingsStore } from '@store/settingsStore';
import { getBusinessHours, saveBusinessHours } from '@services/hoursService';
import { DAYS, DAY_LABEL_KEY } from '@lib/days';

function SettingsPage() {
	const { t } = useTranslation();
	const { settings, isLoaded, updateSettings } = useSettingsStore();
	const [saving, setSaving] = useState(false);
	const [hours, setHours] = useState(() => DAYS.map((day) => ({ day, hours: '', closed: false })));

	const form = useForm({
		initialValues: {
			admin_email: '',
			contact_phone: '',
			contact_email: '',
			contact_address: '',
			show_bgn_price: true,
			pinned_video_url: '',
		},
	});

	useEffect(() => {
		if (isLoaded) {
			form.setValues({
				admin_email: settings.admin_email,
				contact_phone: settings.contact_phone,
				contact_email: settings.contact_email,
				contact_address: settings.contact_address,
				show_bgn_price: settings.show_bgn_price === 'true',
				pinned_video_url: settings.pinned_video_url,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded]);

	useEffect(() => {
		if (!brand.features.hours) return;
		getBusinessHours()
			.then((rows) => {
				const byDay = new Map(rows.map((r) => [r.day, r]));
				setHours(DAYS.map((day) => byDay.get(day) ?? { day, hours: '', closed: false }));
			})
			.catch(() => {});
	}, []);

	const setHoursField = (day, field, value) =>
		setHours((current) => current.map((h) => (h.day === day ? { ...h, [field]: value } : h)));

	const handleSubmit = async (values) => {
		setSaving(true);
		try {
			await updateSettings({
				admin_email: values.admin_email,
				contact_phone: values.contact_phone,
				contact_email: values.contact_email,
				contact_address: values.contact_address,
				show_bgn_price: String(values.show_bgn_price),
				pinned_video_url: values.pinned_video_url,
			});
			if (brand.features.hours) {
				await saveBusinessHours(
					hours.map((h) => ({ day: h.day, hours: h.hours, closed: h.closed }))
				);
			}
			notifications.show({ message: t('settings.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('settings.saveError'), color: 'red' });
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Title order={2} mb="lg">
				{t('admin.settings')}
			</Title>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md" maw={480}>
					<Card withBorder>
						<Stack gap="md">
							<TextInput
								label={t('settings.adminEmail')}
								description={t('settings.adminEmailHint')}
								type="email"
								{...form.getInputProps('admin_email')}
							/>
							<TextInput
								label={t('settings.contactPhone')}
								{...form.getInputProps('contact_phone')}
							/>
							<TextInput
								label={t('settings.contactEmail')}
								type="email"
								{...form.getInputProps('contact_email')}
							/>
							<TextInput
								label={t('settings.contactAddress')}
								{...form.getInputProps('contact_address')}
							/>
							{brand.currency.secondaryBgn && (
								<Switch
									label={t('settings.showBgn')}
									{...form.getInputProps('show_bgn_price', { type: 'checkbox' })}
								/>
							)}
						</Stack>
					</Card>

					{brand.features.youtube && (
						<Card withBorder>
							<TextInput
								label={t('settings.pinnedVideo')}
								description={t('settings.pinnedVideoHint')}
								placeholder="https://youtu.be/…"
								{...form.getInputProps('pinned_video_url')}
							/>
						</Card>
					)}

					{brand.features.hours && (
						<Card withBorder>
							<Title order={4} mb="sm">
								{t('settings.workingHours')}
							</Title>
							<Text size="sm" c="dimmed" mb="md">
								{t('settings.workingHoursHint')}
							</Text>
							<Stack gap="sm">
								{hours.map((h) => (
									<Group key={h.day} wrap="nowrap" align="center">
										<Text w={110} size="sm">
											{t(DAY_LABEL_KEY[h.day])}
										</Text>
										<TextInput
											flex={1}
											placeholder="09:00 – 18:00"
											value={h.hours}
											disabled={h.closed}
											onChange={(e) => setHoursField(h.day, 'hours', e.currentTarget.value)}
										/>
										<Switch
											label={t('contact.closed')}
											checked={h.closed}
											onChange={(e) => setHoursField(h.day, 'closed', e.currentTarget.checked)}
										/>
									</Group>
								))}
							</Stack>
						</Card>
					)}

					<Button type="submit" loading={saving}>
						{t('common.save')}
					</Button>
				</Stack>
			</form>
		</>
	);
}

export default SettingsPage;
