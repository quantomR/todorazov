import { Group, Text } from '@mantine/core';
import { brand } from '@/config/brand';
import { formatEur, formatEurAsBgn } from '@lib/currency';
import { useSettingsStore, selectShowBgn } from '@store/settingsStore';

/**
 * EUR price with the optional secondary BGN value. When `original` is passed
 * and higher than `eur`, it renders struck-through next to the sale price.
 */
function Price({ eur, original, size = 'lg', fw = 700 }) {
	const showBgn = useSettingsStore(selectShowBgn);
	const onSale = original != null && Number(original) > Number(eur);

	return (
		<Group gap={8} align="baseline" wrap="nowrap">
			<Text size={size} fw={fw} c={onSale ? 'red' : 'brand'}>
				{formatEur(eur)}
			</Text>
			{onSale && (
				<Text size="sm" c="dimmed" td="line-through">
					{formatEur(original)}
				</Text>
			)}
			{brand.currency.secondaryBgn && showBgn && (
				<Text size="sm" c="dimmed">
					{formatEurAsBgn(eur)}
				</Text>
			)}
		</Group>
	);
}

export default Price;
