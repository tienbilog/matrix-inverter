import { useState } from 'react';
import '../styles/Navbar.css';

interface NavbarProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
    const [isMenuOpen, setIsMenuOpen] =useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon"> <img src="icon.png" alt="Icon" /> </span>
                    <span className="brand-name">Matrix Solver</span>
                </div>

                <button 
                    className="navbar-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <button
                        className={`nav-item ${currentTab === 'solver' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('solver');
                            setIsMenuOpen(false);
                        }}
                    >
                        Solver
                    </button>
                    {/* ----- UNCOMMENT IF WE'LL KEEP THE EXPLANATION TAB -----
                    <button
                        className={`nav-item ${currentTab === 'explanation' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('explanation');
                            setIsMenuOpen(false);
                        }}
                    >
                        Explanation
                    </button> */}
                    <button
                        className={`nav-item ${currentTab === 'about' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('about');
                            setIsMenuOpen(false);
                        }}
                    >
                        About
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;