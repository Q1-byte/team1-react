import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';

// 페이지 임포트
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MyPage from '../pages/mypage/MyPage';
import GachaPage from '../pages/gacha/GachaPage';

// 메인 페이지 컴포넌트
import MidBanner from '../components/MidBanner';
import ReviewSection from '../components/ReviewSection';

// 관리자 페이지
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/users/UserList';
import SpotManagement from '../pages/admin/spots/SpotList';
import PaymentManagement from '../pages/admin/payments/PaymentList';
import EventManagement from '../pages/admin/events/EventList';
import ReviewManagement from '../pages/admin/reviews/ReviewList';
import InquiryManagement from '../pages/admin/inquiries/InquiryList';

// Protected Route (로그인 필요)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Guest Route (로그인 시 접근 불가)
function GuestRoute({ children }) {
  const token = localStorage.getItem('auth_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// 메인 홈 컴포넌트
function HomePage() {
  return (
    <>
      <MidBanner />
      <ReviewSection />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'gacha',
        element: <GachaPage />
      },
      {
        path: 'mypage',
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        )
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        )
      }
    ]
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
