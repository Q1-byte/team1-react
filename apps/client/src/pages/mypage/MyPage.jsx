import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');

  // Mock 데이터 (hooks는 항상 최상단에!)
  const [myPlans] = useState([
    {
      id: 1,
      title: '제주 2박3일',
      region: '제주',
      travel_date: '2026-03-15',
      duration_days: 3,
      status: 'READY',
      total_price: 450000,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: '부산 당일치기',
      region: '부산',
      travel_date: '2026-02-20',
      duration_days: 1,
      status: 'PAID',
      total_price: 89000,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [pointHistory] = useState([
    {
      id: 1,
      amount: 1000,
      type: '적립',
      description: '회원가입 축하 포인트',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      amount: -500,
      type: '사용',
      description: '부산 여행 결제',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [recentViews] = useState([
    {
      id: 1,
      title: '서울 한강 나들이',
      region: '서울',
      viewed_at: new Date().toISOString()
    }
  ]);

  // 로그인 체크 (hooks 이후에!)
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>로그인이 필요합니다</h2>
        <button onClick={() => navigate('/login')} className="btn-primary">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      READY: { text: '준비중', color: '#3498db' },
      PAID: { text: '결제완료', color: '#2ecc71' },
      CANCEL: { text: '취소', color: '#e74c3c' },
      DONE: { text: '완료', color: '#95a5a6' }
    };
    const badge = badges[status] || badges.READY;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        background: badge.color + '20',
        color: badge.color
      }}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="mypage-container">
      {/* 사용자 정보 헤더 */}
      <div className="mypage-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user.username}님</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="user-points">
          <span className="points-label">보유 포인트</span>
          <span className="points-value">{user.point?.toLocaleString() || 0}P</span>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mypage-tabs">
        <button
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          내 여행 계획
        </button>
        <button
          className={`tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          포인트 내역
        </button>
        <button
          className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          최근 본 계획
        </button>
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          회원정보
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mypage-content">
        {/* 내 여행 계획 */}
        {activeTab === 'plans' && (
          <div>
            <h3>내 여행 계획</h3>
            <div className="plan-grid">
              {myPlans.map(plan => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <h4>{plan.title}</h4>
                    {getStatusBadge(plan.status)}
                  </div>
                  <div className="plan-info">
                    <p>📍 {plan.region}</p>
                    <p>📅 {plan.travel_date} ({plan.duration_days}일)</p>
                    <p className="plan-price">💰 {plan.total_price.toLocaleString()}원</p>
                  </div>
                  <div className="plan-actions">
                    <button className="btn-primary btn-sm">상세보기</button>
                    {plan.status === 'READY' && (
                      <button className="btn-success btn-sm">결제하기</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 포인트 내역 */}
        {activeTab === 'points' && (
          <div>
            <h3>포인트 내역</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>구분</th>
                  <th>내용</th>
                  <th>포인트</th>
                </tr>
              </thead>
              <tbody>
                {pointHistory.map(point => (
                  <tr key={point.id}>
                    <td>{new Date(point.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${point.amount > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {point.type}
                      </span>
                    </td>
                    <td>{point.description}</td>
                    <td style={{
                      fontWeight: 'bold',
                      color: point.amount > 0 ? '#2ecc71' : '#e74c3c'
                    }}>
                      {point.amount > 0 ? '+' : ''}{point.amount.toLocaleString()}P
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 최근 본 계획 */}
        {activeTab === 'recent' && (
          <div>
            <h3>최근 본 계획</h3>
            <div className="recent-list">
              {recentViews.map(view => (
                <div key={view.id} className="recent-item">
                  <div>
                    <h4>{view.title}</h4>
                    <p>📍 {view.region}</p>
                  </div>
                  <div>
                    <small>{new Date(view.viewed_at).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 회원정보 */}
        {activeTab === 'profile' && (
          <div>
            <h3>회원정보</h3>
            <div className="profile-form">
              <div className="form-group">
                <label>아이디</label>
                <input type="text" value={user.username} disabled />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="tel" defaultValue={user.phone || ''} placeholder="연락처를 입력하세요" />
              </div>
              <div className="form-group">
                <label>여행 성향</label>
                <input type="text" defaultValue={user.keyword_pref || ''} placeholder="힐링, 액티비티 등" />
              </div>
              <div className="form-actions">
                <button className="btn-primary">정보 수정</button>
                <button className="btn-secondary">비밀번호 변경</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPage;
