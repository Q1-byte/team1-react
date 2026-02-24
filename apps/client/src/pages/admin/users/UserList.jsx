import { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUserPoint, updateUserStatus } from '../../../api/userApi';

function UserList() {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (p = 0, kw = keyword, role = roleFilter) => {
    try {
      setLoading(true);
      const data = await getUsers(p, 10, kw, role);
      setUsers(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('회원 목록 로드 실패:', err);
      alert('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, keyword, roleFilter);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers(0, keyword, roleFilter);
  };

  const handleRoleFilter = (role) => {
    const next = roleFilter === role ? '' : role;
    setRoleFilter(next);
    setPage(0);
    fetchUsers(0, keyword, next);
  };

  const handleDelete = async (id, role) => {
    if (role === 'ADMIN') return;
    if (!window.confirm('정말로 이 회원을 삭제하시겠습니까?')) return;
    try {
      await deleteUser(id);
      alert('삭제되었습니다.');
      fetchUsers(page, keyword, roleFilter);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'ADMIN') return;
    const isActive = user.status !== 'SUSPENDED';
    const action = isActive ? '사용중지' : '활성화';
    if (!window.confirm(`${user.username}을(를) ${action}하시겠습니까?`)) return;
    try {
      await updateUserStatus(user.id, isActive ? 'SUSPENDED' : 'ACTIVE');
      fetchUsers(page, keyword, roleFilter);
    } catch (err) {
      alert(`${action} 처리에 실패했습니다.`);
    }
  };

  const handleEditPoint = async (user) => {
    const input = prompt(`${user.username}의 포인트를 수정하세요:`, user.point);
    if (input === null) return;
    const point = parseInt(input);
    if (isNaN(point)) { alert('올바른 숫자를 입력해주세요.'); return; }
    try {
      await updateUserPoint(user.id, point);
      alert('포인트가 수정되었습니다.');
      fetchUsers(page, keyword, roleFilter);
    } catch (err) {
      console.error('포인트 수정 실패:', err);
      alert('포인트 수정에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>👥 회원 관리</h1>
        <p>전체 회원 목록 및 관리</p>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div
          className="card"
          onClick={() => handleRoleFilter('')}
          style={{ cursor: 'pointer', borderLeft: roleFilter === '' ? '4px solid #005ADE' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체 회원</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalElements.toLocaleString()}명</p>
        </div>
        <div
          className="card"
          onClick={() => handleRoleFilter('USER')}
          style={{ cursor: 'pointer', borderLeft: roleFilter === 'USER' ? '4px solid #2ecc71' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>일반 회원 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {roleFilter === 'USER' ? `${totalElements.toLocaleString()}명` : '-'}
          </p>
        </div>
        <div
          className="card"
          onClick={() => handleRoleFilter('ADMIN')}
          style={{ cursor: 'pointer', borderLeft: roleFilter === 'ADMIN' ? '4px solid #e74c3c' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>관리자 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>
            {roleFilter === 'ADMIN' ? `${totalElements.toLocaleString()}명` : '-'}
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="🔍 아이디, 닉네임, 이메일로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '300px',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">검색</button>
            {keyword && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ddd', color: '#555' }}
                onClick={() => { setKeyword(''); setPage(0); fetchUsers(0, '', roleFilter); }}
              >
                초기화
              </button>
            )}
          </form>
          <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>총 {totalElements.toLocaleString()}명</span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>아이디</th>
                  <th>닉네임</th>
                  <th>이메일</th>
                  <th>연락처</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>포인트</th>
                  <th>여행 성향</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td><strong>{user.username}</strong></td>
                      <td>{user.nickname || '-'}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className="badge" style={{ background: user.role === 'ADMIN' ? '#fde8e8' : '#e6f4ea', color: user.role === 'ADMIN' ? '#c62828' : '#2e7d32' }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: user.status === 'SUSPENDED' ? '#fde8e8' : '#e6f4ea', color: user.status === 'SUSPENDED' ? '#c62828' : '#2e7d32' }}>
                          {user.status === 'SUSPENDED' ? '중지' : '정상'}
                        </span>
                      </td>
                      <td><strong>{user.point?.toLocaleString() || 0}P</strong></td>
                      <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{user.keywordPref || '-'}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '64px' }}>
                          <button
                            onClick={() => handleEditPoint(user)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '12px', padding: '4px 0', width: '100%' }}
                          >
                            포인트
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="btn btn-sm"
                            style={{ background: user.status === 'SUSPENDED' ? '#2ecc71' : '#f39c12', color: 'white', fontSize: '12px', padding: '4px 0', width: '100%' }}
                            disabled={user.role === 'ADMIN'}
                          >
                            {user.status === 'SUSPENDED' ? '활성화' : '중지'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.role)}
                            className="btn btn-sm"
                            style={{ background: '#e74c3c', color: 'white', fontSize: '12px', padding: '4px 0', width: '100%' }}
                            disabled={user.role === 'ADMIN'}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-sm"
                  style={{ marginRight: '10px' }}
                >
                  이전
                </button>
                <span>{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-sm"
                  style={{ marginLeft: '10px' }}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserList;
