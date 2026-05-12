import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Calendar,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { IMAGE_BASE_URL } from '../api';
import './Dashboard.css'; // On réutilise les styles communs

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // On peut soit récupérer tous les historiques et filtrer, 
        // soit avoir une route dédiée. Ici on simule ou on filtre.
        const response = await axios.get(`http://${window.location.hostname}:8000/api/historique/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const item = response.data.find(a => a.id === parseInt(id));
        if (item) {
          setResult(item);
        } else {
          console.error("Analyse non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du résultat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Récupération du diagnostic...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ padding: '150px 0', textAlignment: 'center' }}>
        <h2>Analyse introuvable</h2>
        <Link to="/historique" className="btn btn-primary">Retour à l'historique</Link>
      </div>
    );
  }

  const isSain = result.maladie.toLowerCase().includes('sain');

  return (
    <div className="dashboard-page" style={{ paddingTop: '100px' }}>
      <div className="container">
        <header className="dashboard-header" style={{ alignItems: 'center' }}>
          <div className="welcome-msg">
            <Link to="/historique" className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ArrowLeft size={18} /> Retour à l'historique
            </Link>
            <h1>Rapport de Diagnostic</h1>
            <p>ID Analyse: #{result.id} — Généré par BananaGuard IA</p>
          </div>
          <div className="actions" style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Download size={20} /> Imprimer
            </button>
          </div>
        </header>

        <div className="dashboard-content" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
          {/* Image & Main Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="content-section"
          >
            <div className="result-img-container" style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
              <img 
                src={result.image_url?.startsWith('http') 
                  ? result.image_url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname)
                  : `${IMAGE_BASE_URL}/${result.image_url}`
                } 
                alt="Feuille analysée" 
                style={{ width: '100%', display: 'block' }}
                onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Image+Non+Trouvée'}
              />
            </div>
            
            <div className="stat-card" style={{ background: isSain ? '#f1f8e9' : '#fff3e0', border: 'none' }}>
              <div className={`stat-icon ${isSain ? 'success' : 'danger'}`}>
                {isSain ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
              </div>
              <div className="stat-info">
                <span className="stat-label">Statut Détecté</span>
                <span className="stat-value" style={{ color: isSain ? '#2e7d32' : '#e65100' }}>{result.maladie}</span>
              </div>
            </div>

            <div className="stat-card" style={{ marginTop: '1rem', border: 'none' }}>
              <div className="stat-icon info">
                <ShieldCheck size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Indice de Confiance IA</span>
                <span className="stat-value">{Math.round(result.confiance * 100)}%</span>
              </div>
            </div>
          </motion.div>

          {/* Details & Recommendation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="content-section"
          >
            <div className="section-head">
              <h2>Analyse Détaillée</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Calendar size={16} /> {new Date(result.date_analyse).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="info-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Info size={18} color="var(--primary)" /> Observations
              </h4>
              <p style={{ lineHeight: '1.6', color: '#4a5568' }}>
                L'intelligence artificielle a identifié des caractéristiques visuelles correspondant à <strong>{result.maladie}</strong>. 
                {isSain ? 
                  " Votre plant ne présente aucun signe pathologique majeur. Continuez l'entretien régulier." : 
                  " Il est fortement recommandé d'isoler les zones touchées pour éviter la propagation à l'ensemble de la plantation."
                }
              </p>
            </div>

            <div className="info-box" style={{ border: '2px solid var(--primary-light)', padding: '1.5rem', borderRadius: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <CheckCircle size={18} /> Traitement Recommandé
              </h4>
              <p style={{ lineHeight: '1.6', fontWeight: 500 }}>
                {result.traitement || "Consultez la base des maladies pour plus de détails sur le traitement approprié."}
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/maladies" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                En savoir plus sur cette maladie
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
