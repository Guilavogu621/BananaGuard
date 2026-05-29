import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import './Auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    typeCompte: 'Agriculteur',
    region: 'Conakry'
  });
  const [error, setError] = useState('');

  const prefectures = [
    'Conakry', 'Kindia', 'Forécariah', 'Coyah', 'Boffa', 'Dubréka', 
    'Boké', 'Fria', 'Gaoual', 'Koundara', 'Télimélé',
    'Mamou', 'Dalaba', 'Pita', 
    'Labé', 'Mali', 'Tougué', 'Koubia', 'Lélouma',
    'Kankan', 'Kouroussa', 'Siguiri', 'Mandiana', 'Kerouané',
    'Faranah', 'Kissidougou', 'Dabola', 'Dinguiraye',
    'Nzérékoré', 'Macenta', 'Guéckédou', 'Beyla', 'Lola', 'Yomou'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    try {
      const response = await authAPI.signup({
        nom_complet: formData.nom,
        email: formData.email,
        mot_de_passe: formData.password,
        role: formData.typeCompte.toLowerCase(),
        region: formData.region
      });
      
      console.log('Inscription réussie:', response.data);
      
      // Auto-login après inscription
      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', loginResponse.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de l\'inscription.');
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
          <h2>Créer un compte</h2>
          <p>Rejoignez BananaGuard pour protéger vos récoltes</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom Complet</label>
            <input 
              type="text" 
              name="nom" 
              placeholder="Ex: Mamadou Diallo" 
              required 
              onChange={handleChange}
            />
          </div>

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
              placeholder="8 caractères minimum" 
              required 
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type de compte</label>
              <select name="typeCompte" onChange={handleChange}>
                <option value="Agriculteur">Agriculteur</option>
                <option value="Technicien">Technicien</option>
              </select>
            </div>

            <div className="form-group">
              <label>Région (Guinée)</label>
              <select name="region" onChange={handleChange}>
                {prefectures.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn">
            S'inscrire <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
