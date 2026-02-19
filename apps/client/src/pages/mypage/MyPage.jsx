import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getMyPageMain, getMyPlans, getMyPoints, updateProfile, changePassword } from '../../api/mypageApi';
import { getMyInquiriesApi } from '../../api/inquiryApi';
import api from '../../api';
import './MyPage.css';

const getRecentPlansApi = async (userId) => {
  try {
    const response = await api.get(`/plans/recent?userId=${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("최근 본 계획 로드 실패:", error);
    return { success: false };
  }
};

function MyPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  
  // 데이터 상태
  const [myPlans, setMyPlans] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [myInquiries, setMyInquiries] = useState([]);
  
  // 로딩/에러 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 프로필 수정 상태
  const [editPhone, setEditPhone] = useState('');
  const [editKeywordPref, setEditKeywordPref] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // 비밀번호 변경 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 마이페이지 메인 데이터 로드
  useEffect(() => {
    const fetchMainData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await getMyPageMain();
        
        if (response.success) {
          setUserInfo(response.data.user);
          setRecentViews(response.data.recentViewedPlans || []);
          setEditPhone(response.data.user.phone || '');
          setEditKeywordPref(response.data.user.keywordPref || '');
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('마이페이지 데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, [user]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    const fetchTabData = async () => {
      if (!user) return;

      try {
        if (activeTab === 'plans' && myPlans.length === 0) {
          const response = await getMyPlans();
          if (response.success) {
            setMyPlans(response.data || []);
          }
        } else if (activeTab === 'points' && pointHistory.length === 0) {
          const response = await getMyPoints();
          if (response.success) {
            setPointHistory(response.data || []);
          }
        } else if (activeTab === 'inquiries' && myInquiries.length === 0) {
          const data = await getMyInquiriesApi(0, 5);
          setMyInquiries(data.content || []);
        }else if (activeTab === 'recent' && recentViews.length === 0) {
          const response = await getRecentPlansApi(user.id);
          if (response.success) {
            setRecentViews(response.data || []);
          }
        }
      } catch (err) {
        console.error('탭 데이터 로드 실패:', err);
      }
    };
    
    fetchTabData();
  }, [activeTab, user, myPlans.length, pointHistory.length, myInquiries.length, recentViews.length]);

  // 프로필 수정 핸들러
  const handleProfileUpdate = async () => {
    try {
      setProfileLoading(true);
      const response = await updateProfile({
        phone: editPhone,
        keywordPref: editKeywordPref
      });

      if (response.success) {
        alert('프로필이 수정되었습니다.');
        setUserInfo(response.data);
        // AuthContext 업데이트
        updateUser({
          phone: response.data.phone,
          keywordPref: response.data.keywordPref
        });
      } else {
        alert(response.message || '프로필 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      alert('프로필 수정에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async () => {
    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      
      const response = await changePassword({
        currentPassword,
        newPassword
      });

      if (response.success) {
        alert('비밀번호가 변경되었습니다.');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      setPasswordError('비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 로그인 체크
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

  // 로딩 중
  if (loading) {
    return (
      <>
        <Header />
        <div className="mypage-container" style={{ textAlign: 'center', paddingTop: '200px' }}>
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
        <Footer />
      </>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <>
        <Header />
        <div className="mypage-container" style={{ textAlign: 'center', paddingTop: '200px' }}>
          <p style={{ color: '#e74c3c' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            다시 시도
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const displayUser = userInfo || user;

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

  const getPointTypeBadge = (type) => {
    const colors = {
      '적립': '#2ecc71',
      '사용': '#e74c3c',
      '이벤트': '#9b59b6',
      '후기': '#f39c12'
    };
    return colors[type] || '#95a5a6';
  };

  return (
    <>
      <Header />
      <div className="mypage-container">
      {/* 사용자 정보 헤더 */}
        <div className="mypage-header">
          <div className="user-info">
            <div className="user-avatar">
              {displayUser.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{displayUser.username}님</h2>
              <p>{displayUser.email}</p>
              {displayUser.phone && <p>📞 {displayUser.phone}</p>}
            </div>
          </div>
          <div className="user-points">
            <span className="points-label">보유 포인트</span>
            <span className="points-value">{displayUser.point?.toLocaleString() || 0}P</span>
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
          className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          문의 내역
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
              {myPlans.length === 0 ? (
                <div className="empty-state">
                  <p>아직 여행 계획이 없습니다.</p>
                  <button onClick={() => navigate('/reserve')} className="btn-primary">
                    여행 계획 만들기
                  </button>
                </div>
              ) : (
                <div className="plan-grid">
                  {myPlans.map(plan => (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-header">
                        <h4>{plan.title}</h4>
                        {getStatusBadge(plan.status)}
                      </div>
                      <div className="plan-info">
                        <p>🏷️ {plan.type}</p>
                        <p>📅 {plan.travelDate} ({plan.durationDays}일)</p>
                        <p>👥 {plan.peopleCount}명</p>
                        <p>🔖 {plan.keyword}</p>
                        <p className="plan-price">💰 {plan.totalPrice?.toLocaleString()}원</p>
                      </div>
                      <div className="plan-actions">
                        <button className="btn-primary btn-sm">상세보기</button>
                        {plan.status === 'READY' && (
                          <button className="btn-success btn-sm">결제하기</button>
                        )}
                        {plan.status === 'DONE' && (
                          <button className="btn-secondary btn-sm" onClick={() => navigate('/reviews/write')}>
                            후기 작성
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 포인트 내역 */}
          {activeTab === 'points' && (
            <div>
              <h3>포인트 내역</h3>
              <div className="point-summary">
                <span>현재 포인트: <strong>{displayUser.point?.toLocaleString() || 0}P</strong></span>
              </div>
              {pointHistory.length === 0 ? (
                <div className="empty-state">
                  <p>포인트 내역이 없습니다.</p>
                </div>
              ) : (
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
                        <td>{new Date(point.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span 
                            className="badge"
                            style={{ 
                              background: getPointTypeBadge(point.type) + '20',
                              color: getPointTypeBadge(point.type)
                            }}
                          >
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
              )}
            </div>
          )}

          {/* 최근 본 계획 */}
          {/* 1. 이 부분을 찾으세요 (약 250~270라인 사이) */}
          {activeTab === 'recent' && (
            <div>
              <h3>최근 본 계획</h3>
              {recentViews.length === 0 ? (
                <div className="empty-state">
                  <p>최근 본 계획이 없습니다.</p>
                  <button onClick={() => navigate('/plan/search')} className="btn-primary">
                    여행 계획 둘러보기
                  </button>
                </div>
              ) : (
                <div className="recent-list">
                  {/* 2. 바로 여기! 기존 {recentViews.map(...)} 부분을 아래 코드로 교체하세요 */}
                  {recentViews.map((view, index) => (
                    <div key={index} className="recent-item">
                      <div className="recent-info">
                        <h4>{view.name || '제목 없음'}</h4> 
                        <p>📍 {view.region || '지역 정보 없음'}</p>
                        <small>조회: {view.viewedAt ? new Date(view.viewedAt).toLocaleString() : '-'}</small>
                      </div>
                      <div className="recent-actions">
                        <button 
                          className="btn-primary btn-sm" 
                          onClick={() => navigate(`/plan/${view.planId}`)}
                        >
                          보기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 문의 내역 */}
          {activeTab === 'inquiries' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>문의 내역</h3>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => navigate('/inquiry')}
                >
                  전체보기
                </button>
              </div>
              {myInquiries.length === 0 ? (
                <div className="empty-state">
                  <p>문의 내역이 없습니다.</p>
                  <button onClick={() => navigate('/inquiry/write')} className="btn-primary">
                    문의하기
                  </button>
                </div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>카테고리</th>
                        <th>제목</th>
                        <th>상태</th>
                        <th>작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myInquiries.map(inquiry => (
                        <tr
                          key={inquiry.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/inquiry/${inquiry.id}`)}
                        >
                          <td>
                            <span className="badge" style={{ background: '#3498db20', color: '#3498db' }}>
                              {inquiry.category}
                            </span>
                          </td>
                          <td>
                            {inquiry.title}
                            {inquiry.isSecret && <span style={{ marginLeft: '5px', color: '#999' }}>🔒</span>}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: inquiry.status === 'ANSWERED' ? '#2ecc7120' : '#f39c1220',
                                color: inquiry.status === 'ANSWERED' ? '#2ecc71' : '#f39c12'
                              }}
                            >
                              {inquiry.statusDescription || (inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기')}
                            </span>
                          </td>
                          <td>{inquiry.createdAt?.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate('/inquiry/write')}
                    >
                      새 문의하기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 회원정보 */}
          {activeTab === 'profile' && (
            <div>
              <h3>회원정보</h3>
              <div className="profile-form">
                <div className="form-group">
                  <label>아이디</label>
                  <input type="text" value={displayUser.username || ''} disabled />
                </div>
                <div className="form-group">
                  <label>이메일</label>
                  <input type="email" value={displayUser.email || ''} disabled />
                </div>
                <div className="form-group">
                  <label>연락처</label>
                  <input 
                    type="tel" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="010-0000-0000" 
                  />
                </div>
                <div className="form-group">
                  <label>여행 성향 (키워드)</label>
                  <input 
                    type="text" 
                    value={editKeywordPref}
                    onChange={(e) => setEditKeywordPref(e.target.value)}
                    placeholder="힐링, 맛집, 액티비티 등" 
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    여러 키워드는 쉼표(,)로 구분해주세요
                  </small>
                </div>
                <div className="form-group">
                  <label>가입일</label>
                  <input 
                    type="text" 
                    value={displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : '-'} 
                    disabled 
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-primary" 
                    onClick={handleProfileUpdate}
                    disabled={profileLoading}
                  >
                    {profileLoading ? '저장 중...' : '정보 수정'}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    비밀번호 변경
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>비밀번호 변경</h3>
            {passwordError && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                {passwordError}
              </div>
            )}
            <div className="form-group">
              <label>현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력 (6자 이상)"
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 다시 입력"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default MyPage;
