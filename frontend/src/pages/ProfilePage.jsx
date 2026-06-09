import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, UserCheck, Loader2, ArrowLeft, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom_complet: '',
    email: '',
    role: 'agriculteur',
    region: 'Conakry'
  });

  const prefectures = [
    'Conakry', 'Kindia', 'Forécariah', 'Coyah', 'Boffa', 'Dubréka', 
    'Boké', 'Fria', 'Gaoual', 'Koundara', 'Télimélé',
    'Mamou', 'Dalaba', 'Pita', 
    'Labé', 'Mali', 'Tougué', 'Koubia', 'Lélouma',
    'Kankan', 'Kouroussa', 'Siguiri', 'Mandiana', 'Kerouané',
    'Faranah', 'Kissidougou', 'Dabola', 'Dinguiraye',
    'Nzérékoré', 'Macenta', 'Guéckédou', 'Beyla', 'Lola', 'Yomou'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Charger d'abord depuis le localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setFormData({
            nom_complet: parsed.nom_complet || parsed.nom || '',
            email: parsed.email || '',
            role: parsed.role || 'agriculteur',
            region: parsed.region || 'Conakry'
          });
        }

        // Rafraîchir depuis le serveur
        const response = await authAPI.getMe();
        const serverUser = response.data;
        
        setFormData({
          nom_complet: serverUser.nom_complet || '',
          email: serverUser.email || '',
          role: serverUser.role || 'agriculteur',
          region: serverUser.region || 'Conakry'
        });
        
        // Mettre à jour le localStorage
        localStorage.setItem('user', JSON.stringify(serverUser));
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Impossible de charger les informations de profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    if (!formData.nom_complet.trim()) {
      setError('Le nom complet est obligatoire.');
      setSaving(false);
      return;
    }

    try {
      const response = await authAPI.updateProfile({
        nom_complet: formData.nom_complet,
        role: formData.role.toLowerCase(),
        region: formData.region
      });

      // Mettre à jour le localStorage avec le profil modifié
      localStorage.setItem('user', JSON.stringify(response.data));
      setSuccess('Profil mis à jour avec succès !');
      
      // Auto-dismiss de l'alerte après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container profile-wrapper-box">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <ArrowLeft size={18} /> Retour au Tableau de bord
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="profile-card glass-card"
        >
          <div className="profile-header-section">
            <div className="profile-avatar-large">
              <User size={48} />
            </div>
            <h2>Mon Profil</h2>
            <p>Gérez vos informations personnelles de BananaGuard</p>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="success-alert"
              >
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="error-alert"
              >
                <AlertTriangle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>
                <User size={16} /> Nom Complet
              </label>
              <input 
                type="text" 
                name="nom_complet" 
                value={formData.nom_complet}
                onChange={handleChange}
                placeholder="Ex: Mamadou Diallo"
                required
              />
            </div>

            <div className="form-group disabled-field">
              <label>
                <Mail size={16} /> Adresse Email (non modifiable)
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                disabled
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <UserCheck size={16} /> Type de compte
                </label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                >
                  <option value="agriculteur">Agriculteur</option>
                  <option value="technicien">Technicien</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={16} /> Région (Guinée)
                </label>
                <select 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange}
                >
                  {prefectures.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner" size={20} /> Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={20} /> Sauvegarder les modifications
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
