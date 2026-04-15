import { NavLink } from "react-router-dom";
import { useShiftCart } from '../context/ShiftCartContext'


function Header() {
    const { cartFixtures } = useShiftCart();
    const cartCount = cartFixtures.length;
    // console.log('cartFixtures in Header:', cartFixtures, 'cartCount:', cartCount)


    return (
        <header className="app-header">
            <NavLink to="/" className="app-header-title">Score Tracker</NavLink>
            <nav className="app-header-nav">
                <NavLink to="/shift-builder" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Build Shift
                </NavLink>
                <NavLink to="/fixtures"  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Fixtures
                </NavLink>
                {/* <NavLink to="/shift" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Shift
                </NavLink> */}
                <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    History
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Settings⚙️
                </NavLink>
                <NavLink to="/shift" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    🛒 { cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </NavLink>

            </nav>
        </header>
    );
}

export default Header;