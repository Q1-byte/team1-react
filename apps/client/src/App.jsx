import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';
import BottomBanner from './components/BottomBanner';
import ScrollToTop from './components/ScrollToTop';

// App.js
export default function App() {
  return (
    <div className="App" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      margin: 0, 
      padding: 0 
    }}>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
      <BottomBanner />
      <Footer />
    </div>
  );
}