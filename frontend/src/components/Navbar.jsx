import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, role } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          MenuCraft
        </NavLink>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/venue/register">Venue</NavLink>
              <NavLink to="/venue/templates">Templates</NavLink>
              <NavLink to="/menu/generate">Menu</NavLink>
              <NavLink to="/facebook">Facebook</NavLink>
              {isAdmin && <NavLink to="/admin/template">Admin</NavLink>}
              <span className="text-secondary" style={{ fontSize: '0.8rem', padding: '0 0.5rem' }}>
                {role}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/auth/login">Login</NavLink>
              <NavLink to="/auth/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
