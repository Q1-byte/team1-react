import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import App from '../App';

// 페이지 임포트
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MyPage from '../pages/mypage/MyPage';
import GachaPage from '../pages/gacha/GachaPage';

// 메인 페이지 컴포넌트
import TopSlider from '../components/TopSlider';
import NavBar from '../components/NavBar';
import MidBanner from '../components/MidBanner';
import ReviewSection from '../components/ReviewSection';

// 관리자 페이지
import AdminLayout from '../pages/admin/AdminLayout';

// Plan 페이지
import PlanSearch from '../pages/plan/PlanSearch';
import PlanKeyword from '../pages/plan/PlanKeyword';
import PlanResult from '../pages/plan/PlanResult';
import PlanCheckout from '../pages/plan/PlanCheckout';

// Payment 페이지
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentFail from '../pages/payment/PaymentFail';
import PaymentCancel from '../pages/payment/PaymentCancel';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/users/UserList';
import SpotManagement from '../pages/admin/spots/SpotList';
import PaymentManagement from '../pages/admin/payments/PaymentList';
import EventManagement from '../pages/admin/events/EventList';
import ReviewManagement from '../pages/admin/reviews/ReviewList';
import InquiryManagement from '../pages/admin/inquiries/InquiryList';

// Protected Route (로그인 필요)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Guest Route (로그인 시 접근 불가)
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// 메인 페이지 컴포넌트 임포트
import Header from '../components/Header';
import Footer from '../components/Footer';

// 메인 홈 컴포넌트 (헤더가 슬라이더 위에 떠있음)
function HomePage() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Header />
      </div>
      <TopSlider />
      <NavBar />
      <MidBanner />
      <ReviewSection />
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  // 메인페이지 (별도 레이아웃 - 헤더가 슬라이더 위에)
  {
    path: '/',
    element: <HomePage />
  },
  // 다른 페이지들 (App 레이아웃 - 헤더가 일반 흐름)
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'gacha',
        element: <GachaPage />
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        )
      },
      // Plan 관련 라우트
      {
        path: 'reserve',
        element: <PlanSearch />
      },
      {
        path: 'keyword',
        element: <PlanKeyword />
      },
      {
        path: 'result',
        element: <PlanResult />
      },
      {
        path: 'checkout',
        element: <PlanCheckout />
      },
      // Payment 관련 라우트
      {
        path: 'payment/success',
        element: <PaymentSuccess />
      },
      {
        path: 'payment/fail',
        element: <PaymentFail />
      },
      {
        path: 'payment/cancel',
        element: <PaymentCancel />
      }
    ]
  },
  // 로그인 페이지 (헤더/푸터만)
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    )
  },
  // 마이페이지 (헤더/푸터만)
  {
    path: '/mypage',
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    )
  },
  // 관리자 페이지
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: 'users',
        element: <UserManagement />
      },
      {
        path: 'spots',
        element: <SpotManagement />
      },
      {
        path: 'payments',
        element: <PaymentManagement />
      },
      {
        path: 'events',
        element: <EventManagement />
      },
      {
        path: 'reviews',
        element: <ReviewManagement />
      },
      {
        path: 'inquiries',
        element: <InquiryManagement />
      }
    ]
  },
  // 404 페이지
  {
    path: '*',
    element: <div>404 Not Found</div>
  }
]);
