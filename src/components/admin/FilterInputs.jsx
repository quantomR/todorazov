import { useEffect, useState } from 'react';
import { Card, Checkbox, Group, NumberInput, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { localized } from '@lib/localized';
import { getFilterGroupsForCategory } from '@services/filterService';

/**
 * Product-form section for the faceted filters (features.filters). Loads the
 * filter groups that apply to the product's current category and edits the
 * product's option selections (checkbox groups) and numeric values (range
 * groups). Bound to form.values.filter_options (string[]) and
 * form.values.filter_values ({ [groupId]: number }).
 */
function FilterInputs({ form }) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;
	const categoryId = form.values.category_id;
	const [groups, setGroups] = useState([]);

	useEffect(() => {
		getFilterGroupsForCategory(categoryId)
			.then(setGroups)
			.catch(() => setGroups([]));
	}, [categoryId]);

	if (groups.length === 0) return null;

	const setGroupOptions = (group, selected) => {
		const groupOptionIds = new Set((group.filter_options ?? []).map((o) => o.id));
		const kept = form.values.filter_options.filter((id) => !groupOptionIds.has(id));
		form.setFieldValue('filter_options', [...kept, ...selected]);
	};

	return (
		<Card withBorder mb="md">
			<Title order={4} mb="sm">
				{t('filters.productTitle')}
			</Title>
			<Stack gap="md">
				{groups.map((group) => {
					if (group.type === 'range') {
						return (
							<NumberInput
								key={group.id}
								label={`${localized(group, 'name', lang)}${group.unit ? ` (${group.unit})` : ''}`}
								value={form.values.filter_values[group.id] ?? ''}
								onChange={(value) =>
									form.setFieldValue('filter_values', {
										...form.values.filter_values,
										[group.id]: value,
									})
								}
							/>
						);
					}
					const options = (group.filter_options ?? [])
						.slice()
						.sort((a, b) => a.sort_order - b.sort_order);
					const selected = form.values.filter_options.filter((id) =>
						options.some((o) => o.id === id)
					);
					return (
						<div key={group.id}>
							<Text size="sm" fw={500} mb={4}>
								{localized(group, 'name', lang)}
							</Text>
							<Checkbox.Group value={selected} onChange={(next) => setGroupOptions(group, next)}>
								<Group gap="md">
									{options.map((option) => (
										<Checkbox
											key={option.id}
											value={option.id}
											label={localized(option, 'value', lang)}
										/>
									))}
								</Group>
							</Checkbox.Group>
						</div>
					);
				})}
			</Stack>
		</Card>
	);
}

export default FilterInputs;
