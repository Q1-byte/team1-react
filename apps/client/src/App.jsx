import { Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import TopSlider from './components/TopSlider';
import MidBanner from './components/MidBanner';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ReviewSection from './components/ReviewSection';

// 페이지 임포트
import GachaPage from './pages/gacha/GachaPage';

// [박진희 일반 여행 예약 페이지 추가] 
import PlanSearch from './pages/plan/PlanSearch';   // 지역/날짜 선택(예약 시작 페이지)
import PlanKeyword from './pages/plan/PlanKeyword'; // 키워드 선택
import PlanResult from './pages/plan/PlanResult';   // 일정 결과
import PlanCheckout from './pages/plan/PlanCheckout'; // 결제 확인
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFail from './pages/payment/PaymentFail';
import PaymentCancel from './pages/payment/PaymentCancel';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    // 1. 전체를 세로형 FlexBox로 만들고 최소 높이를 화면 전체(100vh)로 잡습니다.
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 모든 페이지에서 공통으로 보이는 상단 영역 */}
      <Header />

      {/* 2. flex: 1을 주면 이 영역이 남는 공간을 모두 차지해 푸터를 아래로 밀어냅니다. */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="*" element={<MainLayout />} />

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

function MainLayout() {
  return (
    <>
      <TopSlider />
      <NavBar />
      <MidBanner />
      <ReviewSection />
    </>
  );
}