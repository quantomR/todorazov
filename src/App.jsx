import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { useSettingsStore } from '@store/settingsStore';
import router from './router';

function App() {
	const checkSession = useAuthStore((state) => state.checkSession);
	const fetchSettings = useSettingsStore((state) => state.fetchSettings);

	useEffect(() => {
		checkSession();
		fetchSettings();
	}, [checkSession, fetchSettings]);

	return <RouterProvider router={router} />;
}

export default App;
