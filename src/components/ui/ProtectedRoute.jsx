import { Outlet } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { usePageMeta } from '@lib/meta';
import LoginPage from '@pages/admin/LoginPage';

/**
 * There is no separate login route — the hidden admin URLs render the
 * login form in place until the admin is authenticated.
 * The whole admin tree is noindex.
 */
function ProtectedRoute() {
	const { user, isLoading } = useAuthStore();
	usePageMeta({ noindex: true });
	if (isLoading) return null;
	if (!user) return <LoginPage />;
	return <Outlet />;
}

export default ProtectedRoute;
