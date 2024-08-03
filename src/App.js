import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from './components/Navbar.js'
import AppRoutes from './Routes';
import { UserProvider } from './components/UserContext.js';

function App() {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;