import { Link } from 'react-router-dom';
import { appUrl, shouldNavigateToApp } from '../utils/appUrl';

export default function AppLink({ to, children, ...rest }) {
  if (shouldNavigateToApp(to)) {
    return (
      <a href={appUrl(to)} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}
