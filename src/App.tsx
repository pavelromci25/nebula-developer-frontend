import DeveloperDashboard from './components/DeveloperDashboard';
import './App.css';

function App() {
  console.log('App: Rendering App component');
  return (
    <div className="app-container">
      <DeveloperDashboard />
    </div>
  );
}

export default App;