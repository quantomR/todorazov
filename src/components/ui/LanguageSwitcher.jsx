import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';

function LanguageSwitcher() {
	const { t, i18n } = useTranslation();

	if (brand.languages.length < 2) return null;

	return (
		<SegmentedControl
			size="xs"
			value={i18n.language}
			onChange={(lang) => i18n.changeLanguage(lang)}
			data={brand.languages.map((lang) => ({ value: lang, label: t(`language.${lang}`) }))}
		/>
	);
}

export default LanguageSwitcher;
