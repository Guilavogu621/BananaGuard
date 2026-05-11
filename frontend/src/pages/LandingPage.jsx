import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Zap, 
  Camera, 
  ArrowRight, 
  Cpu, 
  Layers,
  ChevronRight
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="landing-page">
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <span className="tech-badge">Projet Étudiant - Groupe 6</span>
            <h1>Banana<span>Guard</span> : Protégez vos bananiers simplement</h1>
            <p>
              Une application simple pour identifier les maladies de vos plantations en quelques secondes. 
              Prenez une photo et obtenez immédiatement un diagnostic pour sauver vos récoltes.
            </p>
            <div className="hero-btns">
              <Link to="/signup" className="btn btn-primary">
                Commencer maintenant <ArrowRight size={20} />
              </Link>
              <Link to="/maladies" className="btn btn-outline">
                Voir les maladies
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-viz"
          >
            <div className="viz-circle"></div>
            <div className="viz-card glass-card">
              <div className="viz-header">
                <Activity size={20} color="#1b5e20" />
                <span>Analyse en cours...</span>
              </div>
              <div className="viz-content">
                <div className="scan-line"></div>
                <img src="https://images.unsplash.com/photo-1528510138833-93881313e24d?auto=format&fit=crop&q=80&w=400" alt="Feuille de bananier" />
              </div>
              <div className="viz-result-phrase">
                <p><strong>Résultat :</strong> Sigatoka noire détectée</p>
                <p><strong>Fiabilité :</strong> Très élevée (98%)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Process Section (Comment ça marche ?) */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p>Trois étapes simples pour surveiller votre plantation au quotidien.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="process-grid"
          >
            {[
              { 
                icon: <Camera />, 
                title: "Prendre une photo", 
                desc: "Photographiez une feuille suspecte ou téléversez une image depuis la galerie de votre téléphone." 
              },
              { 
                icon: <Cpu />, 
                title: "Lancer l'analyse", 
                desc: "Notre système analyse les taches et les formes sur la feuille automatiquement." 
              },
              { 
                icon: <Activity />, 
                title: "Suivre le conseil", 
                desc: "Recevez le nom de la maladie et les conseils pour soigner votre bananier." 
              }
            ].map((step, index) => (
              <motion.div key={index} variants={itemVariants} className="process-card">
                <div className="step-num">{index + 1}</div>
                <div className="icon-box">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Maladies Section */}
      <section className="maladie-section">
        <div className="container">
          <h2 className="section-title">Maladies reconnues</h2>
          <div className="maladie-grid">
            {[
              { name: "Sigatoka noire", color: "#d32f2f", info: "Taches noires sur les feuilles" },
              { name: "Maladie de Panama", color: "#f57c00", info: "Jaunissement des bords" },
              { name: "Pestalotiopsis", color: "#fbc02d", info: "Taches grises et sèches" },
              { name: "Plante Saine", color: "#388e3c", info: "Pas de maladie détectée" }
            ].map((item, index) => (
              <div key={index} className="maladie-item glass-card">
                <div className="indicator" style={{ background: item.color }}></div>
                <h4>{item.name}</h4>
                <ChevronRight size={20} className="arrow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tech Section */}
      <section className="tech-specs">
        <div className="container tech-grid">
          <div className="tech-info">
            <span className="tech-badge">Technologie utilisée</span>
            <h2>Une application rapide et efficace</h2>
            <p>
              Nous avons développé ce système pour qu'il soit facile à utiliser, même si vous n'avez pas beaucoup de réseau dans les champs.
            </p>
            <ul className="tech-list">
              <li><Layers size={18} /> Reconnaissance automatique des formes</li>
              <li><Database size={18} /> Base de données de plus de 1600 images</li>
              <li><Zap size={18} /> Résultats rapides en moins de 2 secondes</li>
            </ul>
          </div>
          <div className="tech-image">
             <div className="simple-result glass-card">
               <div className="result-header">Rapport de Diagnostic</div>
               <div className="result-body">
                 <p>La feuille analysée présente des symptômes de <strong>Maladie</strong>.</p>
                 <p className="advice">Conseil : Coupez les feuilles infectées et brûlez-les loin de la plantation.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="cta-final">
        <div className="container">
          <div className="cta-card glass-card">
            <h2>Prêt à protéger votre plantation ?</h2>
            <p>Rejoignez les agriculteurs qui utilisent BananaGuard dès aujourd'hui.</p>
            <Link to="/signup" className="btn btn-primary">Créer mon compte gratuit</Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <ShieldCheck /> <span>BananaGuard</span>
          </div>
          <p>© 2026 BananaGuard - Groupe 6. Université de Conakry (UGANC).</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
