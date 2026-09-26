import { Group, Tooltip, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';

function ColorPicker({ colors, selectedId, onSelect }) {
	const { i18n } = useTranslation();

	return (
		<Group gap="xs">
			{colors.map((color) => {
				const isSelected = color.id === selectedId;
				return (
					<Tooltip key={color.id} label={localized(color, 'name', i18n.language)}>
						<UnstyledButton
							type="button"
							onClick={() => onSelect(color.id)}
							aria-pressed={isSelected}
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								backgroundColor: color.color_hex,
								border: '2px solid var(--sf-border)',
								outline: isSelected ? '2px solid var(--mantine-color-brand-5)' : 'none',
								outlineOffset: 2,
								transform: isSelected ? 'scale(1.12)' : 'none',
								transition: 'transform 0.15s',
							}}
						/>
					</Tooltip>
				);
			})}
		</Group>
	);
}

export default ColorPicker;
