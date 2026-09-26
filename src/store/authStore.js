import { create } from 'zustand';
import { supabase } from '@lib/supabase';

const useAuthStore = create((set) => ({
	user: null,
	isLoading: true,

	login: async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw error;
		set({ user: data.user });
	},

	logout: async () => {
		await supabase.auth.signOut();
		set({ user: null });
	},

	checkSession: async () => {
		const { data } = await supabase.auth.getSession();
		set({ user: data.session?.user ?? null, isLoading: false });
	},
}));

export default useAuthStore;
