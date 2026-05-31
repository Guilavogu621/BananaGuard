import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './UploadPage.css';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  const camInputRef = useRef(null);
  const galInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Veuillez sélectionner une image valide (JPG, PNG).");
    }
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analyse/`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Simulation d'un temps de traitement pour le côté "professionnel"
      setTimeout(() => {
        navigate(`/resultat/${response.data.id}`);
      }, 1500);

    } catch (err) {
      console.error("Erreur d'analyse:", err);
      const message = err.response?.data?.detail || "Une erreur est survenue lors de l'analyse. Vérifiez que le serveur est bien lancé.";
      setError(message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-card"
        >
          <div className="upload-header">
            <ShieldCheck size={48} color="#1b5e20" style={{ marginBottom: '1rem' }} />
            <h2>Nouvelle Analyse</h2>
            <p>Photographiez la feuille de votre bananier ou choisissez une image existante.</p>
          </div>

          {error && <div className="error-msg" style={{ marginBottom: '1rem' }}><AlertCircle size={18} /> {error}</div>}

          {!preview ? (
            <div className="action-btns">
              <button className="upload-btn" onClick={() => camInputRef.current.click()}>
                <Camera size={32} />
                <span>Prendre une photo</span>
              </button>
              
              <button className="upload-btn" onClick={() => galInputRef.current.click()}>
                <ImageIcon size={32} />
                <span>Galerie Photos</span>
              </button>
            </div>
          ) : (
            <div className="preview-area">
              <div className="preview-container">
                <img src={preview} alt="Prévisualisation" />
                <button className="remove-img" onClick={() => { setPreview(null); setSelectedFile(null); }}>
                  <X size={20} />
                </button>
              </div>
              
              <button 
                className="btn btn-primary submit-btn" 
                onClick={startAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyse en cours..." : "Lancer l'analyse du diagnostic"}
              </button>
            </div>
          )}

          {/* Hidden Inputs */}
          <input 
            type="file" 
            ref={camInputRef} 
            accept="image/*" 
            capture="environment" 
            onChange={handleInputChange} 
            style={{ display: 'none' }} 
          />
          <input 
            type="file" 
            ref={galInputRef} 
            accept="image/*" 
            onChange={handleInputChange} 
            style={{ display: 'none' }} 
          />
        </motion.div>
      </div>

      {/* Analysis Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="analysis-overlay"
          >
            <Loader2 className="spinner" size={64} />
            <motion.h3
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Analyse automatique en cours...
            </motion.h3>
            <p>Notre système examine les formes et les taches foliaires.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
