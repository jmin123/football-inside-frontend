import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from './components/Navbar'
import AppRoutes from './Routes';
import { UserProvider } from './components/UserContext';
import Footer from './components/Footer';

function App() {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <AppRoutes />
        <Footer/>
      </Router>
    </UserProvider>
  );
}

export default App;