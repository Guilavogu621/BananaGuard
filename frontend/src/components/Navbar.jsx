import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleProfileClick = () => {
    // Redirection vers la landing page comme demandé
    navigate('/');
    setShowProfileMenu(false);
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Pathologies', path: '/maladies' },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    navLinks.push({ name: 'Historique', path: '/historique' });
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <Shield size={28} />
          </div>
          <span>Banana<span>Guard</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="profile-wrapper">
              <button 
                className="profile-trigger" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="avatar">
                  <User size={20} />
                </div>
                <span className="user-name">{user.nom || 'Utilisateur'}</span>
                <ChevronDown size={16} className={showProfileMenu ? 'rotate' : ''} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="profile-dropdown"
                  >
                    <button onClick={handleProfileClick} className="dropdown-item">
                      <User size={18} /> Mon Profil
                    </button>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={18} /> Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/signup" className="btn btn-primary">Démarrer</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="nav-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="nav-mobile-menu"
          >
            <div className="mobile-menu-links">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="mobile-auth">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="mobile-link">Connexion</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="btn btn-primary w-full">Démarrer</Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="mobile-profile">
                   <button onClick={handleProfileClick} className="mobile-link">Mon Profil</button>
                   <button onClick={handleLogout} className="mobile-link logout">Déconnexion</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
