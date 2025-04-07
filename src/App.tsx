import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DeveloperDashboard from './components/DeveloperDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<DeveloperDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;