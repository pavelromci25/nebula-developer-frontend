import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<h1>Router is working!</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;