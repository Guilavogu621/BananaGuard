import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Historique from './pages/Historique';
import BaseMaladies from './pages/BaseMaladies';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Routes Protégées */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/maladies" element={<BaseMaladies />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/resultat/:id" element={<ResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
