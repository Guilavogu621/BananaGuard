import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { IMAGE_BASE_URL } from '../api';
import './Historique.css';

const Historique = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://${window.location.hostname}:8000/api/historique/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAnalyses(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorique();
  }, [navigate]);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://${window.location.hostname}:8000/api/historique/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historique_bananaguard.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
    }
  };

  // Filtrage des données
  const filteredAnalyses = analyses.filter(item => {
    const matchesSearch = item.maladie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Tous' || 
                         (filterType === 'Sain' && (item.maladie.toLowerCase().includes('sain') || item.maladie.toLowerCase().includes('healthy'))) ||
                         (filterType === 'Malade' && !(item.maladie.toLowerCase().includes('sain') || item.maladie.toLowerCase().includes('healthy')));
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette analyse ?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://${window.location.hostname}:8000/api/historique/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour la liste localement
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnalyses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="historique-page">
      <div className="container">
        <header className="historique-header">
          <div>
            <h1>Historique des Analyses</h1>
            <p>Retrouvez tous vos diagnostics passés et exportez vos données.</p>
          </div>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={20} /> Exporter en CSV
          </button>
        </header>

        <div className="filters-bar">
          <div className="search-input">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une maladie..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Tous">Tous les états</option>
              <option value="Sain">Sain uniquement</option>
              <option value="Malade">Maladies uniquement</option>
            </select>
          </div>
        </div>

        <div className="analyses-table-container">
          {currentItems.length > 0 ? (
            <>
              <table className="analyses-table">
                <thead>
                  <tr>
                    <th>Aperçu</th>
                    <th>Date</th>
                    <th>Résultat</th>
                    <th>Confiance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ width: '50px', height: '50px', minWidth: '50px', overflow: 'hidden', borderRadius: '8px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={item.image_url?.startsWith('http') 
                              ? item.image_url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname)
                              : `${IMAGE_BASE_URL}/${item.image_url}`
                            } 
                            alt="Analyse" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50?text=Error';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(item.date_analyse).toLocaleDateString('fr-FR')}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(item.date_analyse).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${(item.maladie.toLowerCase().includes('sain') || item.maladie.toLowerCase().includes('healthy')) ? 'sain' : 'malade'}`}>
                          {item.maladie}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {Math.round(item.confiance * 100)}%
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon" title="Voir les détails" onClick={() => navigate(`/resultat/${item.id}`)}>
                            <Eye size={18} />
                          </button>
                          <button className="btn-icon" title="Supprimer" onClick={() => handleDelete(item.id)} style={{ color: '#e53935' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="btn-icon" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="page-info">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button 
                    className="btn-icon" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ padding: '5rem' }}>
              <AlertCircle size={48} />
              <h3>Aucun résultat trouvé</h3>
              <p>Essayez de modifier vos filtres ou lancez une nouvelle analyse.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historique;
