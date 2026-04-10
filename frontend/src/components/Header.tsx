import { NavLink } from "react-router-dom";

function Header() {
    return (
        <header className="app-header">
            <span className="app-header-title">Score Tracker</span>
            <nav className="app-header-nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Fixtures
                </NavLink>
                <NavLink to="/shift" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Shift
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;