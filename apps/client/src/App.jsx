import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import TopSlider from './components/TopSlider';
import NavBar from './components/NavBar';
import MidBanner from './components/MidBanner';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';

// 페이지 임포트
import GachaPage from './pages/GachaPage';

export default function App() {
  return (
    <div className="App">
      {/* 모든 페이지에서 공통으로 보이는 상단 영역 */}
      <Header />
      <TopSlider />
      <NavBar /> 

      {/* 주소(Path)에 따라 바뀌는 영역 */}
      <main style={{ minHeight: '60vh' }}>
        <Routes>
          {/* 1. 메인 홈 화면 (/) */}
          <Route path="/" element={
            <>
              
              <MidBanner />
              <ReviewSection />
            </>
          } />
          
          {/* 2. 가챠 페이지 (/gacha) */}
          <Route path="/gacha" element={<GachaPage />} />
        </Routes>
      </main>

      {/* 모든 페이지에서 공통으로 보이는 하단 영역 */}
      <Footer />
    </div>
  );
}