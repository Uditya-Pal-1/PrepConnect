import React from "react";
import { useState } from "react";
import { Link } from "../router";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const welcomeName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');
    const [showMenu, setShowMenu] = useState(false);
  const handleButtonToggle = () => {
    setShowMenu(!showMenu);
  };
    return (
        <header className="navbar-container">
            <Link to="/" className="logo">
                <span className="logo-icon">SB</span>
                <span className="logo-text">SkillBridge</span>
            </Link>
            <nav  className={showMenu ? "menu-mobile" : "menu-web"}>
                <Link to="/" className="nav-item">
                    Home
                </Link>
                <Link to="/opportunities" className="nav-item">
                    Opportunities
                </Link>
                <Link to="/about" className="nav-item">
                    About
                </Link>
                <Link to="/contact" className="nav-item">
                    Contact
                </Link>
                {user && user.role?.toLowerCase() === "ngo" && (
                    <Link to="/ngodash" className="nav-item">
                        NGO Dashboard
                    </Link>
                )}
                <div className="auth-buttons">
                {user ? (
                    <>
                        <span className="nav-item">Welcome, {welcomeName}</span>
                        <Link to='/profile' className="nav-item nav-get-started">
                            Profile
                        </Link>
                        <button onClick={logout} className="nav-item nav-logout">
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-item nav-login">
                            Log In
                        </Link>
                        <Link to="/register" className="nav-item nav-get-started">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
            </nav>
            
    
          <div className="ham-menu">
            <button className="hamburger-btn" onClick={handleButtonToggle}>
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </header>
    );
};

export default Navbar;
