import { Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import TopSlider from './components/TopSlider';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// 페이지 임포트
import GachaPage from './pages/GachaPage';

// [박진희 일반 여행 예약 페이지 추가] 
import PlanSearch from './components/PlanSearch';   // 지역/날짜 선택(예약 시작 페이지)
import PlanKeyword from './components/PlanKeyword'; // 키워드 선택
import PlanResult from './components/PlanResult';   // 일정 결과
import PlanCheckout from './components/PlanCheckout'; // 결제 확인
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFail from './components/PaymentFail';
import PaymentCancel from './components/PaymentCancel';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="App">
      {/* 모든 페이지에서 공통으로 보이는 상단 영역 */}
      <Header />
      <TopSlider />
      <NavBar />

      {/* 주소(Path)에 따라 바뀌는 영역 */}
      <main style={{ minHeight: '60vh' }}>
        <Outlet />
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

          {/* [박진희 추가] 일반 예약 시스템 관련 페이지들 등록 */}
          <Route path="/reserve" element={<PlanSearch />} />
          <Route path="/keyword" element={<PlanKeyword />} />
          <Route path="/result" element={<PlanResult />} />
          <Route path="/checkout" element={<PlanCheckout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

        </Routes>
      </main>

      {/* 모든 페이지에서 공통으로 보이는 하단 영역 */}
      <Footer />
    </div>
  );
}
