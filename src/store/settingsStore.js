import { create } from 'zustand';
import { getSettings, saveSettings } from '@services/settingsService';

const DEFAULT_SETTINGS = {
	admin_email: '',
	contact_phone: '',
	contact_email: '',
	contact_address: '',
	show_bgn_price: 'true',
	pinned_video_url: '',
};

export const useSettingsStore = create((set, get) => ({
	settings: DEFAULT_SETTINGS,
	isLoaded: false,

	fetchSettings: async () => {
		try {
			const settings = await getSettings();
			set({ settings: { ...DEFAULT_SETTINGS, ...settings }, isLoaded: true });
		} catch {
			set({ isLoaded: true });
		}
	},

	updateSettings: async (entries) => {
		await saveSettings(entries);
		set({ settings: { ...get().settings, ...entries } });
	},
}));

/** Convenience selector: is the secondary BGN price enabled right now? */
export const selectShowBgn = (state) => state.settings.show_bgn_price === 'true';
