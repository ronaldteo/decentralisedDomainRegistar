import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import DomainSearch from './pages/DomainSearch/DomainSearch';
import DomainDetails from './pages/DomainDetails/DomainDetails';
import DomainResolver from './pages/DomainResolver/DomainResolver';
import SendEth from './pages/SendEth/SendEth';
import History from './pages/History/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blockchain-dark">
        <Header />
        <Routes>
          <Route path="/" element={<DomainSearch />} />
          <Route path="/domain/:domain" element={<DomainDetails />} />
          <Route path="/resolver" element={<DomainResolver />} />
          <Route path="/send" element={<SendEth />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
