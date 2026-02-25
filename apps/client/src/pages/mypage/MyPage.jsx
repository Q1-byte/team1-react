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

const TRAVEL_KEYWORDS = ['힐링', '자연', '스릴', '추억', '예술', '체험', '데이트', '트레킹'];

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const REGION_DATA = {
  1: "서울", 2: "인천", 3: "대전", 4: "울산", 5: "대구", 
  6: "광주", 7: "부산", 8: "세종", 9: "경기", 10: "강원", 
  11: "충북", 12: "충남", 13: "전북", 14: "전남", 15: "경북", 
  16: "경남", 17: "제주"
};

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
  
  const [myPlans, setMyPlans] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [myInquiries, setMyInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPhone, setEditPhone] = useState('');
  const [editKeywordPref, setEditKeywordPref] = useState([]);
  const [editNickname, setEditNickname] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
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
          setEditKeywordPref(response.data.user.keywordPref ? response.data.user.keywordPref.split(',').map(k => k.trim()).filter(Boolean) : []);
          setEditNickname(response.data.user.nickname || '');
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
        } else if (activeTab === 'recent') {
          if (recentViews.length === 0) {
            const response = await getRecentPlansApi(user.id);
            if (response.success) {
              setRecentViews(response.data || []);
            }
          }

        }
      } catch (err) {
        console.error('탭 데이터 로드 실패:', err);
      }
    };
    
    fetchTabData();
  }, [activeTab, user]);

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('이 여행 계획을 삭제할까요?')) return;
    try {
      await api.delete(`/plans/${planId}`);
      setMyPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('계획 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setProfileLoading(true);
      const response = await updateProfile({ phone: editPhone, keywordPref: editKeywordPref.join(','), nickname: editNickname });
      if (response.success) {
        alert('프로필이 수정되었습니다.');
        setUserInfo(response.data);
        updateUser({ phone: response.data.phone, keywordPref: response.data.keywordPref, nickname: response.data.nickname });
        setEditKeywordPref(response.data.keywordPref ? response.data.keywordPref.split(',').map(k => k.trim()).filter(Boolean) : []);
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

  const handlePasswordChange = async () => {
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
      const response = await changePassword({ currentPassword, newPassword });
      if (response.success) {
        alert('비밀번호가 변경되었습니다.');
        setShowPasswordModal(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
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

  if (!user) {
    return (
      <div className="login-required-container">
        <h2>로그인이 필요합니다</h2>
        <button onClick={() => navigate('/login')} className="btn-primary">로그인하러 가기</button>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="mypage-container loading-state">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mypage-container error-state">
          <p className="error-text">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">다시 시도</button>
        </div>
        <Footer />
      </>
    );
  }

  const displayUser = userInfo || user;

  const getStatusBadge = (status) => {
    const badges = {
      READY: { text: '준비중', className: 'badge-ready' },
      PAID: { text: '결제완료', className: 'badge-paid' },
      CANCEL: { text: '취소', className: 'badge-cancel' },
      DONE: { text: '완료', className: 'badge-done' }
    };
    const badge = badges[status] || badges.READY;
    return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
  };

  return (
    <div className="mypage-wrapper">
      <Header />
      <div className="mypage-container">
        <div className="mypage-header-card">
          <div className="user-info">
            <div className="user-avatar">
              {displayUser.username?.charAt(0).toUpperCase()}
            </div>
            
            <div className="user-text">
              <h2>{displayUser.username}님</h2>
              <p className="email">{displayUser.email}</p>
              {displayUser.phone && <p className="phone">📞 {displayUser.phone}</p>}
            </div>
          </div>
        </div>

        <div className="mypage-tabs">
          <button className={`tab ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>내 여행 계획</button>
          <button className={`tab ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>포인트 내역</button>
          <button className={`tab ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>최근 본 계획</button>
          <button className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>문의 내역</button>
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>회원정보</button>
        </div>

        <div className="mypage-content">
          {activeTab === 'plans' && (
            <div>
              <h3>내 여행 계획</h3>
              {myPlans.length === 0 ? (
                <div className="empty-state">
                  <p>아직 여행 계획이 없습니다.</p>
                  <button onClick={() => navigate('/reserve')} className="btn-primary">여행 계획 만들기</button>
                </div>
              ) : (
                <div className="plan-grid">
                  {myPlans.map(plan => (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-header">
                        <h4 className="plan-title">
                          {plan.region || plan.regionName || REGION_DATA[Number(plan.regionId || plan.region_id)] || plan.title || "지역 정보 없음"}
                        </h4>
                        {getStatusBadge(plan.status)}
                      </div>
                      <div className="plan-info">
                        <div className="info-item"><span className="info-icon">📅</span><span className="info-text">{plan.travelDate} ({plan.durationDays}일)</span></div>
                        <div className="info-item"><span className="info-icon">👥</span><span className="info-text">{plan.peopleCount}명</span></div>
                        <div className="info-item">
                          <span className="info-icon">💰</span>
                          <span className="info-text">
                            {plan.totalPrice ? `${plan.totalPrice.toLocaleString()}원` : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="plan-actions">
                        <button className="btn-sm-v" onClick={() => {
                          if (plan.status === 'PAID') {
                            navigate('/reserve/receipt', { state: { planData: plan } });
                          } else {
                            navigate(`/reserve/${plan.id}`);
                          }
                        }}>상세보기</button>
                        {plan.status === 'READY' && (
                          <>
                            <button className="btn-sm-p">결제하기</button>
                            <button className="btn-sm-c" onClick={() => handleDeletePlan(plan.id)}>삭제</button>
                          </>
                        )}
                        {plan.status === 'DONE' && (
                          <button className="btn-sm-w" onClick={() => navigate('/reviews/write')}>후기 작성</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="tab-content-fade">
              <h3>포인트 내역</h3>
              <div className="point-dashboard">
                <div className="point-info-card">
                  <span className="point-label">보유 포인트</span>
                  <div className="point-amount-wrapper">
                    <span className="point-value">{displayUser.point?.toLocaleString() || 0}</span>
                    <span className="point-unit">P</span>
                  </div>
                </div>
              </div>
              {pointHistory.length === 0 ? (
                <div className="empty-state card-style"><p>아직 적립된 포인트 내역이 없습니다.</p></div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>날짜</th><th>구분</th><th>내용</th><th className="text-right">포인트 변동</th></tr>
                    </thead>
                    <tbody>
                      {pointHistory.map(point => (
                        <tr key={point.id} className="hover-row">
                          <td className="text-muted">{new Date(point.createdAt).toLocaleDateString()}</td>
                          <td><span className={`badge-pill badge-${point.type?.toLowerCase() || 'save'}`}>{point.type === 'SAVE' ? '적립' : '사용'}</span></td>
                          <td className="text-dark font-medium">{point.description}</td>
                          <td className={`text-right font-bold ${point.amount > 0 ? 'color-plus' : 'color-minus'}`}>
                            {point.amount > 0 ? '+' : ''}{point.amount.toLocaleString()} P
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              <div className="inquiry-header-row">
                <h3>문의 내역</h3>
                <span className="link-text-click" onClick={() => navigate('/inquiry')}>전체보러가기 {`>>`}</span>
              </div>
              {myInquiries.length === 0 ? (
                <div className="empty-state"><p>문의 내역이 없습니다.</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>카테고리</th><th>제목</th><th>상태</th><th>작성일</th></tr>
                  </thead>
                  <tbody>
                    {myInquiries.map(inquiry => (
                      <tr key={inquiry.id} className="clickable-row" onClick={() => navigate(`/inquiry/${inquiry.id}`)}>
                        <td><span className="badge badge-category">{inquiry.category}</span></td>
                        <td>{inquiry.title} {inquiry.isSecret && '🔒'}</td>
                        <td><span className={`badge status-${inquiry.status?.toLowerCase() || 'wait'}`}>{inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}</span></td>
                        <td>{inquiry.createdAt?.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {activeTab === 'recent' && (
            <div className="recent-container">
              <h3>최근 본 계획</h3>
              {recentViews.length === 0 ? (
                <div className="empty-state card-style">
                  <p>최근 본 계획이 없습니다.</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentViews.map((view, index) => (
                    <div key={index} className="recent-card">
                      <div className="recent-info">
                        <h4>{view.name || view.plan?.title || '제목 없음'}</h4>
                        {view.viewedAt && (
                          <span className="viewed-at">
                            {new Date(view.viewedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <button className="btn-sm-v" onClick={() => navigate(`/reserve/${view.planId}`)}>보기</button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h3>회원정보</h3>
              <div className="profile-form">
                <div className="form-group"><label>아이디</label><input type="text" value={displayUser.username || ''} disabled /></div>
                <div className="form-group"><label>이메일</label><input type="email" value={displayUser.email || ''} disabled /></div>
                <div className="form-group"><label>닉네임</label><input type="text" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} placeholder="닉네임을 입력하세요" /></div>
                <div className="form-group"><label>연락처</label><input type="tel" value={editPhone} onChange={(e) => setEditPhone(formatPhone(e.target.value))} placeholder="010-1234-5678" /></div>
                <div className="form-group keyword-section">
                  <label>여행 성향</label>
                  <div className="keyword-grid">
                    {TRAVEL_KEYWORDS.map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        className={`keyword-chip ${editKeywordPref.includes(keyword) ? 'selected' : ''}`}
                        onClick={() => setEditKeywordPref(prev =>
                          prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
                        )}
                      >{keyword}</button>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-sm-s" onClick={handleProfileUpdate} disabled={profileLoading}>정보 수정</button>
                  <button className="btn-sm-n" onClick={() => setShowPasswordModal(true)}>비밀번호 변경</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>비밀번호 변경</h3>
            {passwordError && <p className="error-text">{passwordError}</p>}
            <div className="form-group">
              <label>현재 비밀번호</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>새 비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-sm-n" onClick={handlePasswordChange} disabled={passwordLoading}>
                {passwordLoading ? '변경 중...' : '변경'}
              </button>
              <button className="btn-sm-c" onClick={() => setShowPasswordModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default MyPage;