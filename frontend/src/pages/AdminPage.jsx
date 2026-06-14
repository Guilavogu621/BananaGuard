import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, UserPlus, Loader2, Filter } from 'lucide-react';
import api from '../api';
import './Dashboard.css';

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

        <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button 
            className={`btn ${activeTab === 'utilisateurs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('utilisateurs')}
          >
            <Users size={18} /> Utilisateurs
          </button>
          <button 
            className={`btn ${activeTab === 'creer-tech' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('creer-tech')}
          >
            <UserPlus size={18} /> Créer un technicien
          </button>
          <button 
            className={`btn ${activeTab === 'analyses' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('analyses')}
          >
            <History size={18} /> Toutes les analyses
          </button>
        </div>

        <div className="dashboard-content" style={{ gridTemplateColumns: '1fr' }}>
          {activeTab === 'utilisateurs' && (
            <section className="content-section">
              <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Liste des utilisateurs</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    value={userRoleFilter} 
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
                  >
                    <option value="Tous">Tous</option>
                    <option value="Agriculteurs">Agriculteurs</option>
                    <option value="Techniciens">Techniciens</option>
                  </select>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Nom</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Rôle</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Région</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUtilisateurs.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{u.nom_complet}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            background: u.role === 'technicien' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                            color: u.role === 'technicien' ? '#2196f3' : '#4caf50'
                          }}>
                            {u.role === 'technicien' ? 'Technicien' : 'Agriculteur'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>{u.region}</td>
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
            <section className="content-section" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div className="section-head">
                <h2>Nouveau Technicien</h2>
              </div>
              <form onSubmit={handleCreateTech}>
                {techFormStatus.error && <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(229, 57, 53, 0.1)', color: '#e53935' }}>{techFormStatus.error}</div>}
                {techFormStatus.success && <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(67, 160, 71, 0.1)', color: '#43a047' }}>{techFormStatus.success}</div>}
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom complet</label>
                  <input type="text" value={techForm.nom_complet} onChange={e => setTechForm({...techForm, nom_complet: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                  <input type="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mot de passe</label>
                  <input type="password" value={techForm.mot_de_passe} onChange={e => setTechForm({...techForm, mot_de_passe: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Région</label>
                  <input type="text" value={techForm.region} onChange={e => setTechForm({...techForm, region: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
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
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Maladie</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Agriculteur</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Confiance</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            background: a.maladie === 'Incertain' ? 'rgba(255, 152, 0, 0.1)' : (a.maladie.toLowerCase().includes('sain') || a.maladie.toLowerCase().includes('healthy') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'),
                            color: a.maladie === 'Incertain' ? '#ff9800' : (a.maladie.toLowerCase().includes('sain') || a.maladie.toLowerCase().includes('healthy') ? '#4caf50' : '#f44336')
                          }}>
                            {a.maladie}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>{a.nom_agriculteur || 'Inconnu'}</td>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>{Math.round(a.confiance * 100)}%</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {new Date(a.date_analyse).toLocaleDateString('fr-FR')} à {new Date(a.date_analyse).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                      </tr>
                    ))}
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
