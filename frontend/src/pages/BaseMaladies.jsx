import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import './BaseMaladies.css';

const extraInfo = {
  'Plante saine (En parfaite santé)': {
    scientific: 'Aucun problème',
    image: 'https://th.bing.com/th/id/OIP.RjkCdCQcOYqNBD2rcc0MkAHaL5?w=115&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3'
  },
  'Fusarium oxysporum (Maladie mortelle des racines)': {
    scientific: 'Problème de l\'intérieur de la plante',
    image: '/fusarium.jpg'
  },
  'Deformation foliaire (Feuilles tordues ou abîmées)': {
    scientific: 'Carence, soleil ou insectes',
    image: '/deformation.jpg'
  },
  'Taches foliaires (Maladie des taches noires ou jaunes)': {
    scientific: 'Problème lié à trop d\'eau',
    image: 'https://live.staticflickr.com/1566/25433565174_dd3e08ab87_b.jpg'
  }
};

const BaseMaladies = () => {
  const [maladies, setMaladies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaladies = async () => {
      try {
        const response = await api.get('/maladies/');
        setMaladies(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des maladies:", err);
        setError("Impossible de charger la base de connaissances.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaladies();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <p>Chargement de la base de connaissances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '150px 0', textAlignment: 'center' }}>
        <h2>{error}</h2>
        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="maladies-page">
      <div className="container">
        <header className="page-header">
          <Link to="/" className="back-link"><ArrowLeft size={20} /> Retour</Link>
          <div className="header-text">
            <span className="tech-badge">Guide Pratique</span>
            <h1>Base de Connaissances des Bananiers</h1>
            <p>Apprenez à identifier les symptômes et à appliquer les bons gestes pour protéger votre exploitation.</p>
          </div>
        </header>

        <div className="maladies-grid-detailed">
          {maladies.map((maladie, index) => {
            const extra = extraInfo[maladie.id] || extraInfo[maladie.nom_simple] || {
              scientific: 'Inconnu',
              image: 'https://via.placeholder.com/600x400?text=Image+Non+Disponible'
            };
            const symptoms = maladie.symptomes || maladie.symptomes_typiques || maladie.symptomes_observes || [];
            const recommendations = maladie.recommandations || maladie.recommandations_immediates || [];

            let rawGravite = maladie.niveau_gravite || maladie.gravite || '🟢 Faible';
            let formattedGravite = rawGravite;
            if (rawGravite === 'Variable') formattedGravite = '⚪ Variable';
            if (rawGravite === 'Eleve - Tres serieux' || rawGravite === 'Élevé - Très sérieux') formattedGravite = '🔴 Élevé - Très sérieux';
            if (rawGravite === 'Eleve' || rawGravite === 'Élevé') formattedGravite = '🔴 Élevé';
            if (rawGravite === 'Faible') formattedGravite = '🟢 Faible';
            if (rawGravite === 'Aucune') formattedGravite = '🟢 Aucune';

            return (
              <motion.div 
                key={maladie.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="maladie-detail-card"
              >
                <div className="card-image">
                  <img src={extra.image} alt={maladie.nom_simple} />
                  <div className={`severity-tag ${formattedGravite.toLowerCase().replace('🟢', '').replace('🟡', '').replace('🔴', '').replace('🟠', '').replace('⚪', '').trim().replace(/[^a-z0-9]/g, '-')}`}>
                    {formattedGravite}
                  </div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3>{maladie.nom_simple}</h3>
                    <span className="scientific-name">{extra.scientific}</span>
                  </div>
                  
                  <div className="info-section">
                    <h4><Info size={16} /> Description</h4>
                    <p>{maladie.description}</p>
                  </div>

                  {maladie.causes_possibles && (
                    <div className="info-section">
                      <h4><Info size={16} /> Causes possibles</h4>
                      <ul>
                        {maladie.causes_possibles.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {symptoms.length > 0 && (
                    <div className="info-section">
                      <h4><AlertTriangle size={16} /> Symptômes clés</h4>
                      <ul>
                        {symptoms.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="info-section">
                      <h4><CheckCircle size={16} /> Recommandations</h4>
                      <ul>
                        {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {maladie.traitement && (
                    <div className="info-section treatment-box">
                      <h4><CheckCircle size={16} /> Conseil de traitement</h4>
                      {typeof maladie.traitement === 'string' ? (
                        <p>{maladie.traitement}</p>
                      ) : (
                        <div style={{ fontSize: '0.95rem', color: '#374151' }}>
                          {maladie.traitement.note && (
                            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                              {maladie.traitement.note}
                            </p>
                          )}
                          {maladie.traitement.mesures_controle && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Mesures de contrôle :</strong>
                              <ul style={{ marginTop: '4px' }}>
                                {maladie.traitement.mesures_controle.map((m, i) => <li key={i}>{m}</li>)}
                              </ul>
                            </div>
                          )}
                          {maladie.traitement.prevention && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>{maladie.traitement.prevention.titre || "Prévention"} :</strong>
                              <ul style={{ marginTop: '4px' }}>
                                {maladie.traitement.prevention.actions?.map((a, i) => <li key={i}>{a}</li>)}
                              </ul>
                            </div>
                          )}
                          {maladie.traitement.curatif && (
                            <div>
                              <strong>{maladie.traitement.curatif.titre || "Curatif"} :</strong>
                              {maladie.traitement.curatif.produits_locaux && (
                                <p style={{ margin: '4px 0' }}>
                                  <em>Produits locaux :</em> {maladie.traitement.curatif.produits_locaux.join(', ')}
                                </p>
                              )}
                              {maladie.traitement.curatif.mode_emploi && (
                                <ul style={{ marginTop: '4px' }}>
                                  {maladie.traitement.curatif.mode_emploi.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                              )}
                            </div>
                          )}
                          {maladie.traitement.avertissement && (
                            <p style={{ color: '#b91c1c', fontSize: '0.85em', marginTop: '10px', fontWeight: '600' }}>
                              ⚠️ {maladie.traitement.avertissement}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BaseMaladies;
