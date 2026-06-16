import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, UserPlus, Loader2, Filter } from 'lucide-react';
import api from '../api';
import './Dashboard.css';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('utilisateurs');
  const [loading, setLoading] = useState(true);

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const [userRoleFilter, setUserRoleFilter] = useState('Tous');

  const [techForm, setTechForm] = useState({ nom_complet: '', email: '', mot_de_passe: '', region: 'Toutes' });
  const [techFormStatus, setTechFormStatus] = useState({ loading: false, error: null, success: null });

  let user = { nom_complet: 'Utilisateur', role: 'agriculteur' };
  try { user = JSON.parse(localStorage.getItem('user')) || { nom_complet: 'Utilisateur', role: 'agriculteur' }; } catch (e) { /* ignore */ }

  useEffect(() => {
    if (user.role !== 'technicien') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, analysesRes] = await Promise.all([
          api.get('/admin/utilisateurs'),
          api.get('/admin/analyses')
        ]);
        setUtilisateurs(usersRes.data);
        setAnalyses(analysesRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, user.role]);

  const handleCreateTech = async (e) => {
    e.preventDefault();
    setTechFormStatus({ loading: true, error: null, success: null });
    try {
      await api.post('/admin/creer-technicien', techForm);
      setTechFormStatus({ loading: false, error: null, success: 'Technicien créé avec succès !' });
      setTechForm({ nom_complet: '', email: '', mot_de_passe: '', region: 'Toutes' });
      const usersRes = await api.get('/admin/utilisateurs');
      setUtilisateurs(usersRes.data);
    } catch (err) {
      setTechFormStatus({ loading: false, error: err.response?.data?.detail || 'Erreur lors de la création', success: null });
    }
  };

  const filteredUtilisateurs = utilisateurs.filter(u => {
    if (userRoleFilter === 'Tous') return true;
    if (userRoleFilter === 'Agriculteurs') return u.role === 'agriculteur';
    if (userRoleFilter === 'Techniciens') return u.role === 'technicien';
    return true;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement des données d'administration...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <header className="dashboard-header">
          <div className="welcome-msg">
            <span className="tech-badge">Espace Admin</span>
            <h1>Administration</h1>
            <p>Gestion des utilisateurs et vue d'ensemble des analyses.</p>
          </div>
        </header>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'utilisateurs' ? 'active' : ''}`}
            onClick={() => setActiveTab('utilisateurs')}
          >
            <Users size={16} /> <span>Utilisateurs</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'creer-tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('creer-tech')}
          >
            <UserPlus size={16} /> <span>Créer technicien</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'analyses' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyses')}
          >
            <History size={16} /> <span>Toutes les analyses</span>
          </button>
        </div>

        <div className="dashboard-content" style={{ gridTemplateColumns: '1fr' }}>
          {activeTab === 'utilisateurs' && (
            <section className="content-section">
              <div className="section-head">
                <h2>Liste des utilisateurs</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                  <select
                    className="filter-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="Tous">Tous</option>
                    <option value="Agriculteurs">Agriculteurs</option>
                    <option value="Techniciens">Techniciens</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th className="hide-mobile">Région</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUtilisateurs.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.nom_complet}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === 'technicien' ? 'Technicien' : 'Agriculteur'}
                          </span>
                        </td>
                        <td className="hide-mobile">{u.region}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUtilisateurs.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun utilisateur trouvé.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'creer-tech' && (
            <section className="content-section admin-form-section">
              <div className="section-head">
                <h2>Nouveau Technicien</h2>
              </div>
              <form onSubmit={handleCreateTech} className="admin-form">
                {techFormStatus.error && <div className="admin-alert admin-alert-error">{techFormStatus.error}</div>}
                {techFormStatus.success && <div className="admin-alert admin-alert-success">{techFormStatus.success}</div>}

                <div className="admin-field">
                  <label>Nom complet</label>
                  <input type="text" value={techForm.nom_complet} onChange={e => setTechForm({...techForm, nom_complet: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Email</label>
                  <input type="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Mot de passe</label>
                  <input type="password" value={techForm.mot_de_passe} onChange={e => setTechForm({...techForm, mot_de_passe: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Région</label>
                  <input type="text" value={techForm.region} onChange={e => setTechForm({...techForm, region: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={techFormStatus.loading}>
                  {techFormStatus.loading ? 'Création en cours...' : 'Créer le technicien'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'analyses' && (
            <section className="content-section">
              <div className="section-head">
                <h2>Historique Global</h2>
              </div>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Maladie</th>
                      <th>Agriculteur</th>
                      <th className="hide-mobile">Confiance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map(a => {
                      const isSain = a.maladie.toLowerCase().includes('sain') || a.maladie.toLowerCase().includes('healthy');
                      const isIncertain = a.maladie === 'Incertain';
                      return (
                        <tr key={a.id}>
                          <td>
                            <span className={`status-badge ${isIncertain ? 'incertain' : isSain ? 'sain' : 'malade'}`}>
                              {a.maladie}
                            </span>
                          </td>
                          <td>{a.nom_agriculteur || 'Inconnu'}</td>
                          <td className="hide-mobile" style={{ fontWeight: 600, color: 'var(--primary)' }}>{Math.round(a.confiance * 100)}%</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {new Date(a.date_analyse).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {analyses.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune analyse disponible.</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
