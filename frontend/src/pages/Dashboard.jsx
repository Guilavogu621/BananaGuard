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
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { IMAGE_BASE_URL } from '../api';
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
  let user = { nom_complet: 'Utilisateur' };
  try { user = JSON.parse(localStorage.getItem('user')) || { nom_complet: 'Utilisateur' }; } catch (e) { user = { nom_complet: 'Utilisateur' }; }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://${window.location.hostname}:8000/api/historique/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        setRecentAnalyses(data.slice(0, 3));

        // Calcul des statistiques
        const total = data.length;
        const sains = data.filter(a => a.maladie.toLowerCase().includes('sain') || a.maladie.toLowerCase().includes('healthy')).length;
        const incertains = data.filter(a => a.maladie === 'Incertain').length;
        const maladies = total - sains - incertains;
        const dernier = total > 0 ? new Date(data[0].date_analyse).toLocaleDateString('fr-FR') : 'Aucun';

        setStats({ total, maladies, sains, dernier });
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        // En cas d'erreur (ex: backend non lancé), on garde les valeurs par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement de vos données...</p>
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
                        ? analysis.image_url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname)
                        : `${IMAGE_BASE_URL}/${analysis.image_url}`
                      } 
                      alt="Analyse" 
                      className="analysis-img" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100x100?text=Banana'}
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
