import { Box, Button, Checkbox, Group, RangeSlider, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';

/**
 * Faceted filter sidebar (features.filters). Checkbox groups are OR within a
 * group; range groups filter a numeric product value. Filtering itself lives
 * in the shop component; this only renders controls and reports changes.
 *
 * value: { options: string[] (selected option ids), ranges: { [groupId]: [min, max] } }
 * bounds: { [groupId]: { min, max } } — precomputed range extents per range group.
 */
function ProductFilters({ groups, bounds, value, onChange, onClear }) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;

	const setGroupOptions = (group, selectedForGroup) => {
		const otherGroupIds = new Set((group.filter_options ?? []).map((o) => o.id));
		const kept = value.options.filter((id) => !otherGroupIds.has(id));
		onChange({ ...value, options: [...kept, ...selectedForGroup] });
	};

	const setGroupRange = (groupId, range) => {
		onChange({ ...value, ranges: { ...value.ranges, [groupId]: range } });
	};

	const hasActive = value.options.length > 0 || Object.keys(value.ranges).length > 0;

	return (
		<Stack gap="lg">
			<Group justify="space-between">
				<Text fw={700} tt="uppercase" fz="sm" c="brand">
					{t('shop.filters')}
				</Text>
				{hasActive && (
					<Button variant="subtle" size="compact-xs" onClick={onClear}>
						{t('shop.clearFilters')}
					</Button>
				)}
			</Group>

			{groups.map((group) => {
				if (group.type === 'range') {
					const b = bounds[group.id];
					if (!b || b.min === b.max) return null;
					const current = value.ranges[group.id] ?? [b.min, b.max];
					return (
						<Box key={group.id}>
							<Text fw={600} size="sm" mb="xs">
								{localized(group, 'name', lang)}
								{group.unit ? ` (${group.unit})` : ''}
							</Text>
							<RangeSlider
								min={b.min}
								max={b.max}
								value={current}
								onChange={(range) => setGroupRange(group.id, range)}
								label={(v) => `${v}${group.unit ? ` ${group.unit}` : ''}`}
								mt="md"
								mb="xs"
							/>
							<Group justify="space-between">
								<Text size="xs" c="dimmed">
									{current[0]}
									{group.unit ? ` ${group.unit}` : ''}
								</Text>
								<Text size="xs" c="dimmed">
									{current[1]}
									{group.unit ? ` ${group.unit}` : ''}
								</Text>
							</Group>
						</Box>
					);
				}

				const options = (group.filter_options ?? [])
					.slice()
					.sort((a, b) => a.sort_order - b.sort_order);
				if (options.length === 0) return null;
				const selectedForGroup = value.options.filter((id) => options.some((o) => o.id === id));
				return (
					<Box key={group.id}>
						<Text fw={600} size="sm" mb="xs">
							{localized(group, 'name', lang)}
						</Text>
						<Checkbox.Group
							value={selectedForGroup}
							onChange={(next) => setGroupOptions(group, next)}
						>
							<Stack gap={6}>
								{options.map((option) => (
									<Checkbox
										key={option.id}
										value={option.id}
										label={`${localized(option, 'value', lang)}${group.unit ? ` ${group.unit}` : ''}`}
									/>
								))}
							</Stack>
						</Checkbox.Group>
					</Box>
				);
			})}
		</Stack>
	);
}

export default ProductFilters;
