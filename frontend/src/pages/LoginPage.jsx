import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.access_token);
      
      // Récupérer les infos de l'utilisateur
      const userRes = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(userRes.data));
      
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <h2>Connexion</h2>
          <p>Heureux de vous revoir sur BananaGuard</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="votre@email.com" 
              required 
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Votre mot de passe" 
              required 
              onChange={handleChange}
            />
          </div>


          <button type="submit" className="btn btn-primary auth-btn">
            Se connecter <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
