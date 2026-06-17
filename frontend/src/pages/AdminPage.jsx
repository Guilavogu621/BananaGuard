import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, UserPlus, Loader2, Filter, Pencil, Trash2, Ban, CheckCircle } from 'lucide-react';
import api from '../api';
import './Dashboard.css';
import './AdminPage.css';

const REGIONS = ['Toutes', 'Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', 'N\'Zérékoré'];

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('utilisateurs');
  const [loading, setLoading] = useState(true);

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const [userRoleFilter, setUserRoleFilter] = useState('Tous');

  const [techForm, setTechForm] = useState({ nom_complet: '', email: '', mot_de_passe: '', region: 'Toutes' });
  const [techFormStatus, setTechFormStatus] = useState({ loading: false, error: null, success: null });

  // Modal édition
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ nom_complet: '', role: '', region: '' });
  const [editStatus, setEditStatus] = useState({ loading: false, error: null });

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });

  // Suspension en cours (par id)
  const [suspendLoading, setSuspendLoading] = useState(null);

  let user = { nom_complet: 'Utilisateur', role: 'agriculteur' };
  try { user = JSON.parse(localStorage.getItem('user')) || { nom_complet: 'Utilisateur', role: 'agriculteur' }; } catch (e) { /* ignore */ }

  const fetchUtilisateurs = async () => {
    const usersRes = await api.get('/admin/utilisateurs');
    setUtilisateurs(usersRes.data);
  };

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
      await fetchUtilisateurs();
    } catch (err) {
      setTechFormStatus({ loading: false, error: err.response?.data?.detail || 'Erreur lors de la création', success: null });
    }
  };

  // ── Édition ────────────────────────────────────────────────────────────────
  const openEditModal = (u) => {
    setEditForm({ nom_complet: u.nom_complet, role: u.role, region: u.region || '' });
    setEditStatus({ loading: false, error: null });
    setEditModal({ open: true, user: u });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditStatus({ loading: true, error: null });
    try {
      await api.put(`/admin/utilisateurs/${editModal.user.id}`, editForm);
      setEditModal({ open: false, user: null });
      await fetchUtilisateurs();
    } catch (err) {
      setEditStatus({ loading: false, error: err.response?.data?.detail || 'Erreur lors de la modification' });
    }
  };

  // ── Suspension ─────────────────────────────────────────────────────────────
  const handleSuspend = async (u) => {
    setSuspendLoading(u.id);
    try {
      await api.patch(`/admin/utilisateurs/${u.id}/suspendre`);
      await fetchUtilisateurs();
    } catch (err) {
      console.error("Erreur suspension:", err);
    } finally {
      setSuspendLoading(null);
    }
  };

  // ── Suppression ────────────────────────────────────────────────────────────
  const openDeleteModal = (u) => {
    setDeleteStatus({ loading: false, error: null });
    setDeleteModal({ open: true, user: u });
  };

  const handleDelete = async () => {
    setDeleteStatus({ loading: true, error: null });
    try {
      await api.delete(`/admin/utilisateurs/${deleteModal.user.id}`);
      setDeleteModal({ open: false, user: null });
      await fetchUtilisateurs();
    } catch (err) {
      setDeleteStatus({ loading: false, error: err.response?.data?.detail || 'Erreur lors de la suppression' });
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
          {/* ── Onglet Utilisateurs ── */}
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
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUtilisateurs.map(u => {
                      const actif = u.is_active !== false;
                      return (
                        <tr key={u.id} className={!actif ? 'row-suspended' : ''}>
                          <td style={{ fontWeight: 500 }}>{u.nom_complet}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                          <td>
                            <span className={`role-badge ${u.role}`}>
                              {u.role === 'technicien' ? 'Technicien' : 'Agriculteur'}
                            </span>
                          </td>
                          <td className="hide-mobile">{u.region}</td>
                          <td>
                            <span className={`status-pill ${actif ? 'actif' : 'suspendu'}`}>
                              {actif ? 'Actif' : 'Suspendu'}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button
                                className="action-btn edit"
                                title="Modifier"
                                onClick={() => openEditModal(u)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className={`action-btn suspend ${!actif ? 'reactivate' : ''}`}
                                title={actif ? 'Suspendre' : 'Réactiver'}
                                onClick={() => handleSuspend(u)}
                                disabled={suspendLoading === u.id}
                              >
                                {suspendLoading === u.id
                                  ? <Loader2 size={15} className="spinner-sm" />
                                  : actif ? <Ban size={15} /> : <CheckCircle size={15} />
                                }
                              </button>
                              <button
                                className="action-btn delete"
                                title="Supprimer"
                                onClick={() => openDeleteModal(u)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUtilisateurs.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun utilisateur trouvé.</p>
                )}
              </div>
            </section>
          )}

          {/* ── Onglet Créer technicien ── */}
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

          {/* ── Onglet Analyses ── */}
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

      {/* ── Modal Édition ── */}
      {editModal.open && (
        <div className="admin-modal-overlay" onClick={() => setEditModal({ open: false, user: null })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier l'utilisateur</h3>
            <p className="modal-subtitle">{editModal.user?.email}</p>
            <form onSubmit={handleEdit} className="admin-form">
              {editStatus.error && <div className="admin-alert admin-alert-error">{editStatus.error}</div>}
              <div className="admin-field">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={editForm.nom_complet}
                  onChange={e => setEditForm({...editForm, nom_complet: e.target.value})}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Rôle</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                  <option value="agriculteur">Agriculteur</option>
                  <option value="technicien">Technicien</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Région</label>
                <select value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditModal({ open: false, user: null })}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={editStatus.loading}>
                  {editStatus.loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Suppression ── */}
      {deleteModal.open && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal({ open: false, user: null })}>
          <div className="admin-modal admin-modal-danger" onClick={e => e.stopPropagation()}>
            <div className="modal-danger-icon">
              <Trash2 size={28} />
            </div>
            <h3>Supprimer l'utilisateur ?</h3>
            <p className="modal-subtitle">
              Cette action est <strong>irréversible</strong>. L'utilisateur <strong>{deleteModal.user?.nom_complet}</strong> et toutes ses données seront supprimés.
            </p>
            {deleteStatus.error && <div className="admin-alert admin-alert-error">{deleteStatus.error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setDeleteModal({ open: false, user: null })}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteStatus.loading}>
                {deleteStatus.loading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
