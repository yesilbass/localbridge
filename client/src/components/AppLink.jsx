import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { appUrl, shouldNavigateToApp } from '../utils/appUrl';
import { resolveAuthEntryPath } from '../utils/authNav';

export default function AppLink({ to, children, ...rest }) {
  const { user } = useAuth();
  const target = resolveAuthEntryPath(to, user) ?? to;

  if (shouldNavigateToApp(target)) {
    return (
      <a href={appUrl(target)} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={target} {...rest}>
      {children}
    </Link>
  );
}
