import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  History, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { IMAGE_BASE_URL } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    maladies: 0,
    sains: 0,
    dernier: 'Aucun'
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [techForm, setTechForm] = useState({ nom_complet: '', email: '', mot_de_passe: '', region: 'Toutes' });
  const [techFormStatus, setTechFormStatus] = useState({ loading: false, error: null, success: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  let user = { nom_complet: 'Utilisateur' };
  try { user = JSON.parse(localStorage.getItem('user')) || { nom_complet: 'Utilisateur' }; } catch (e) { user = { nom_complet: 'Utilisateur' }; }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        if (user.role === 'technicien') {
          const [statsRes, analysesRes] = await Promise.all([
            api.get(`/admin/statistiques`),
            api.get(`/historique/`)
          ]);
          setRecentAnalyses(analysesRes.data.slice(0, 5));
          setStats({
            totalUtilisateurs: statsRes.data.total_utilisateurs,
            totalAnalyses: statsRes.data.total_analyses,
            maladiesDetectees: statsRes.data.maladies_par_region,
          });
        } else {
          const response = await api.get(`/historique/`);

          const data = response.data;
          setRecentAnalyses(data.slice(0, 3));

          // Calcul des statistiques
          const total = data.length;
          const sains = data.filter(a => a.maladie.toLowerCase().includes('sain') || a.maladie.toLowerCase().includes('healthy')).length;
          const incertains = data.filter(a => a.maladie === 'Incertain').length;
          const maladies = total - sains - incertains;
          const dernier = total > 0 ? new Date(data[0].date_analyse).toLocaleDateString('fr-FR') : 'Aucun';

          setStats({ total, maladies, sains, dernier });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        // En cas d'erreur (ex: backend non lancé), on garde les valeurs par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, user.role]);

  const handleCreateTech = async (e) => {
    e.preventDefault();
    setTechFormStatus({ loading: true, error: null, success: null });
    try {
      await api.post('/admin/creer-technicien', techForm);
      setTechFormStatus({ loading: false, error: null, success: 'Technicien créé avec succès !' });
      setTechForm({ nom_complet: '', email: '', mot_de_passe: '', region: 'Toutes' });
    } catch (err) {
      setTechFormStatus({ loading: false, error: err.response?.data?.detail || 'Erreur lors de la création', success: null });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement de vos données...</p>
      </div>
    );
  }

  if (user.role === 'technicien') {
    const allMaladies = [];
    if (stats.maladiesDetectees) {
        Object.values(stats.maladiesDetectees).forEach(regionMaladies => {
           regionMaladies.forEach(m => {
             if (m.maladie.toLowerCase() !== 'sain' && m.maladie.toLowerCase() !== 'incertain' && !m.maladie.toLowerCase().includes('healthy')) {
               allMaladies.push(m);
             }
           });
        });
    }
    const topMaladies = allMaladies.sort((a,b) => b.count - a.count);

    return (
      <div className="dashboard-page">
        <div className="container">
          <header className="dashboard-header">
            <div className="welcome-msg">
              <span className="tech-badge">Administration</span>
              <h1>Espace Technicien, {user.nom_complet || user.nom}</h1>
              <p>Vue globale sur toutes les analyses et utilisateurs.</p>
            </div>
          </header>

          <div className="stats-grid">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="stat-icon total"><Users size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUtilisateurs || 0}</span>
                <span className="stat-label">Utilisateurs</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="stat-icon info"><TrendingUp size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalAnalyses || 0}</span>
                <span className="stat-label">Analyses Globales</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
              <div className="stat-icon danger"><AlertCircle size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{topMaladies.length > 0 ? topMaladies[0].maladie : 'Aucune'}</span>
                <span className="stat-label">Top Maladie #1</span>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
              <div className="stat-icon danger"><AlertCircle size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{topMaladies.length > 1 ? topMaladies[1].maladie : 'Aucune'}</span>
                <span className="stat-label">Top Maladie #2</span>
              </div>
            </motion.div>
          </div>

          <div className="dashboard-content" style={{ gridTemplateColumns: isMobile ? '1fr' : undefined }}>
            <section className="content-section">
              <div className="section-head">
                <h2>Dernières Analyses (Tous Agriculteurs)</h2>
                <Link to="/historique" className="btn-text">Voir tout <ChevronRight size={16} /></Link>
              </div>
              
              <div className="recent-list">
                {recentAnalyses.length > 0 ? (
                  recentAnalyses.map((analysis, index) => (
                    <motion.div 
                      key={analysis.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.1 }}
                      className="analysis-item"
                    >
                      <img 
                        src={analysis.image_url?.startsWith('http') 
                          ? `${import.meta.env.VITE_BASE_URL}/uploads/${analysis.image_url}`
                          : `${IMAGE_BASE_URL}/${analysis.image_url}`
                        } 
                        alt="Analyse" 
                        className="analysis-img" 
                        onError={(e) => e.target.src = '/favicon.svg'}
                      />
                      <div className="analysis-info">
                        <h4>{analysis.maladie}</h4>
                        <p>{new Date(analysis.date_analyse).toLocaleDateString('fr-FR')} à {new Date(analysis.date_analyse).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - <strong>{analysis.nom_agriculteur || 'Inconnu'}</strong></p>
                      </div>
                      <div className="analysis-result">
                        <span className="confiance-badge">{Math.round(analysis.confiance * 100)}% de confiance</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <LayoutDashboard size={48} />
                    <p>Aucune analyse effectuée pour le moment.</p>
                  </div>
                )}
              </div>
            </section>

            <aside className="dashboard-sidebar">
              <section className="content-section">
                <div className="section-head">
                  <h2>Créer un technicien</h2>
                </div>
                <form onSubmit={handleCreateTech} className="tech-form">
                  {techFormStatus.error && <div className="alert alert-danger" style={{ marginBottom: '1rem', color: '#e53935' }}>{techFormStatus.error}</div>}
                  {techFormStatus.success && <div className="alert alert-success" style={{ marginBottom: '1rem', color: '#43a047' }}>{techFormStatus.success}</div>}
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Nom complet</label>
                    <input type="text" value={techForm.nom_complet} onChange={e => setTechForm({...techForm, nom_complet: e.target.value})} required className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email</label>
                    <input type="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} required className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Mot de passe</label>
                    <input type="password" value={techForm.mot_de_passe} onChange={e => setTechForm({...techForm, mot_de_passe: e.target.value})} required className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Région</label>
                    <input type="text" value={techForm.region} onChange={e => setTechForm({...techForm, region: e.target.value})} required className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} disabled={techFormStatus.loading}>
                    {techFormStatus.loading ? 'Création...' : 'Créer le technicien'}
                  </button>
                </form>
              </section>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="welcome-msg">
            <span className="tech-badge">Tableau de bord</span>
            <h1>Bonjour, {user.nom_complet || user.nom} !</h1>
            <p>Voici l'état actuel de vos plantations.</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <Plus size={20} /> Nouvelle Analyse
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="stat-icon total"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Analyses</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="stat-icon danger"><AlertCircle size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.maladies}</span>
              <span className="stat-label">Maladies Détectées</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
            <div className="stat-icon success"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.sains}</span>
              <span className="stat-label">Plantes Saines</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
            <div className="stat-icon info"><Calendar size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.dernier}</span>
              <span className="stat-label">Dernier Diagnostic</span>
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-content">
          {/* Recent Analyses List */}
          <section className="content-section">
            <div className="section-head">
              <h2>Analyses Récentes</h2>
              <Link to="/historique" className="btn-text">Voir tout <ChevronRight size={16} /></Link>
            </div>
            
            <div className="recent-list">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis, index) => (
                  <motion.div 
                    key={analysis.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="analysis-item"
                  >
                    <img 
                      src={analysis.image_url?.startsWith('http') 
                        ? `${import.meta.env.VITE_BASE_URL}/uploads/${analysis.image_url}`
                        : `${IMAGE_BASE_URL}/${analysis.image_url}`
                      } 
                      alt="Analyse" 
                      className="analysis-img" 
                      onError={(e) => e.target.src = '/favicon.svg'}
                    />
                    <div className="analysis-info">
                      <h4>{analysis.maladie}</h4>
                      <p>{new Date(analysis.date_analyse).toLocaleDateString('fr-FR')} à {new Date(analysis.date_analyse).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="analysis-result">
                      <span className="confiance-badge">{Math.round(analysis.confiance * 100)}% de confiance</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="empty-state">
                  <LayoutDashboard size={48} />
                  <p>Aucune analyse effectuée pour le moment.</p>
                  <Link to="/upload" className="btn btn-outline" style={{ marginTop: '1rem' }}>Lancer ma première analyse</Link>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar / Quick Links */}
          <aside className="dashboard-sidebar">
            <section className="content-section">
              <div className="section-head">
                <h2>Accès Rapide</h2>
              </div>
              <div className="quick-links">
                <Link to="/historique" className="quick-link-btn">
                  <div className="link-content">
                    <History size={20} />
                    <span>Historique complet</span>
                  </div>
                  <ChevronRight size={18} />
                </Link>
                <Link to="/maladies" className="quick-link-btn">
                  <div className="link-content">
                    <BookOpen size={20} />
                    <span>Base des maladies</span>
                  </div>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
