import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BaseMaladies.css';

const maladiesData = [
  {
    id: 'sigatoka',
    name: 'Sigatoka Noire',
    scientific: 'Mycosphaerella fijiensis',
    severity: 'Élevée',
    description: 'La Sigatoka noire est l\'une des maladies les plus graves du bananier. Elle se manifeste par de petites taches rougeâtres ou brunes qui s\'étendent pour devenir de grandes zones mortes (nécroses) sur les feuilles.',
    symptoms: [
      'Stries sombres allongées parallèlement aux nervures.',
      'Dessèchement rapide des feuilles atteintes.',
      'Diminution importante de la taille des régimes de bananes.'
    ],
    treatment: 'Enlever et brûler les feuilles infectées. Assurer un bon espacement entre les plants pour laisser passer l\'air.',
    image: 'https://live.staticflickr.com/1566/25433565174_dd3e08ab87_b.jpg'
  },
  {
    id: 'panama',
    name: 'Maladie de Panama',
    scientific: 'Fusarium oxysporum',
    severity: 'Critique',
    description: 'C\'est une maladie vasculaire causée par un champignon du sol. Elle empêche l\'eau et les nutriments de circuler dans la plante, provoquant son flétrissement total.',
    symptoms: [
      'Jaunissement des feuilles les plus anciennes sur les bords.',
      'Cassure des pétioles (la base de la feuille) qui pendent le long du tronc.',
      'Coloration brune à l\'intérieur de la tige si on la coupe.'
    ],
    treatment: 'Il n\'y a pas de remède curatif. Il faut isoler le plant, ne pas déplacer la terre contaminée et planter des variétés résistantes.',
    image: 'https://apps.lucidcentral.org/pppw_v10/images/entities/banana_fusarium_wilt_176/fusarium_wilt_left_daff_queensland.jpg'
  },
  {
    id: 'pestalotiopsis',
    name: 'Pestalotiopsis',
    scientific: 'Pestalotiopsis musae',
    severity: 'Modérée',
    description: 'Une maladie fongique courante qui affaiblit les feuilles mais qui est généralement moins destructrice que les deux précédentes si elle est traitée à temps.',
    symptoms: [
      'Taches ovales avec un centre gris clair ou blanchâtre.',
      'Bords de la tache de couleur brun foncé ou noir.',
      'Présence fréquente sur les feuilles déjà un peu affaiblies.'
    ],
    treatment: 'Maintenir la plantation propre, éviter les blessures sur les feuilles et utiliser un engrais équilibré pour renforcer les défenses du plant.',
    image: 'https://s3.amazonaws.com/plantvillage-production-new/images/pics/000/099/711/original/5694086710_ba048fbd7e_o.jpg?1488384240'
  },
  {
    id: 'sain',
    name: 'Spécimen Sain',
    scientific: 'Santé Optimale',
    severity: 'Aucune',
    description: 'Un bananier en bonne santé présente un feuillage vigoureux et une production régulière. La prévention est la clé pour maintenir cet état.',
    symptoms: [
      'Feuilles d\'un vert uniforme et brillant.',
      'Absence de taches ou de jaunissement anormal.',
      'Croissance continue du bourgeon terminal.'
    ],
    treatment: 'Continuer la surveillance hebdomadaire, le désherbage et l\'apport régulier en eau et nutriments.',
    image: 'https://th.bing.com/th/id/OIP.RjkCdCQcOYqNBD2rcc0MkAHaL5?w=115&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3'
  }
];

const BaseMaladies = () => {
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
          {maladiesData.map((maladie, index) => (
            <motion.div 
              key={maladie.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="maladie-detail-card"
            >
              <div className="card-image">
                <img src={maladie.image} alt={maladie.name} />
                <div className={`severity-tag ${maladie.severity.toLowerCase()}`}>
                  {maladie.severity}
                </div>
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3>{maladie.name}</h3>
                  <span className="scientific-name">{maladie.scientific}</span>
                </div>
                
                <div className="info-section">
                  <h4><Info size={16} /> Description</h4>
                  <p>{maladie.description}</p>
                </div>

                <div className="info-section">
                  <h4><AlertTriangle size={16} /> Symptômes clés</h4>
                  <ul>
                    {maladie.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="info-section treatment-box">
                  <h4><CheckCircle size={16} /> Conseil de traitement</h4>
                  <p>{maladie.treatment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaseMaladies;
