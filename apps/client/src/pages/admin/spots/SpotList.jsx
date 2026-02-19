import { useState, useEffect, useCallback } from 'react';
import { getSpots, createSpot, deleteSpot, toggleSpot } from '../../../api/spotApi';

function SpotList() {
  const [spots, setSpots] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // 서버사이드 검색/필터 상태
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // null=전체, true=활성, false=비활성

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', category: '관광', description: ''
  });

  const fetchSpots = useCallback(async (p = 0, kw = keyword, active = activeFilter) => {
    try {
      setLoading(true);
      const data = await getSpots(p, 10, kw, active);
      setSpots(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('여행지 목록 로드 실패:', err);
      alert('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [keyword, activeFilter]);

  useEffect(() => {
    fetchSpots(page, keyword, activeFilter);
  }, [page]);

  // 검색어 변경 시 페이지 리셋 후 서버 요청
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchSpots(0, keyword, activeFilter);
  };

  // 활성/비활성 필터 클릭
  const handleActiveFilter = (value) => {
    const next = activeFilter === value ? null : value;
    setActiveFilter(next);
    setPage(0);
    fetchSpots(0, keyword, next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSpot(formData);
      alert('여행지가 등록되었습니다.');
      setShowForm(false);
      setFormData({ name: '', address: '', category: '관광', description: '' });
      setPage(0);
      fetchSpots(0, keyword, activeFilter);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 여행지를 삭제하시겠습니까?')) return;
    try {
      await deleteSpot(id);
      alert('삭제되었습니다.');
      fetchSpots(page, keyword, activeFilter);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSpot(id);
      fetchSpots(page, keyword, activeFilter);
    } catch (err) {
      console.error('토글 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ 여행지 관리</h1>
        <p>여행지 등록 및 활성화 관리</p>
      </div>

      {/* 요약 카드 - 전체 DB 기준 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div
          className="card"
          onClick={() => handleActiveFilter(null)}
          style={{ cursor: 'pointer', borderLeft: activeFilter === null ? '4px solid #005ADE' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체 여행지</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalElements.toLocaleString()}개</p>
        </div>
        <div
          className="card"
          onClick={() => handleActiveFilter(true)}
          style={{ cursor: 'pointer', borderLeft: activeFilter === true ? '4px solid #2ecc71' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>활성 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {activeFilter === true ? `${totalElements.toLocaleString()}개` : '-'}
          </p>
        </div>
        <div
          className="card"
          onClick={() => handleActiveFilter(false)}
          style={{ cursor: 'pointer', borderLeft: activeFilter === false ? '4px solid #e74c3c' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>비활성 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>
            {activeFilter === false ? `${totalElements.toLocaleString()}개` : '-'}
          </p>
        </div>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa' }}>
          <h3>새 여행지 등록</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder="여행지명"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option>관광</option>
                <option>맛집</option>
                <option>숙소</option>
                <option>액티비티</option>
                <option>카페</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="주소"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '12px', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              placeholder="설명 (선택)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '12px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-success">등록</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ background: '#95a5a6', color: 'white' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 테이블 카드 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="🔍 여행지명 또는 주소로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '280px',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">검색</button>
            {keyword && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ddd', color: '#555' }}
                onClick={() => { setKeyword(''); setPage(0); fetchSpots(0, '', activeFilter); }}
              >
                초기화
              </button>
            )}
          </form>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            + 여행지 등록
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>여행지명</th>
                  <th>주소</th>
                  <th>카테고리</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {spots.length > 0 ? (
                  spots.map(spot => (
                    <tr key={spot.id}>
                      <td>{spot.id}</td>
                      <td><strong>{spot.name}</strong></td>
                      <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{spot.address}</td>
                      <td><span className="badge badge-success">{spot.category}</span></td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: spot.isActive ? '#e6f4ea' : '#fce8e8',
                            color: spot.isActive ? '#2e7d32' : '#c62828'
                          }}
                        >
                          {spot.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td>{spot.createdAt ? new Date(spot.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button
                          onClick={() => handleToggle(spot.id)}
                          className="btn btn-sm"
                          style={{ background: spot.isActive ? '#f39c12' : '#2ecc71', color: 'white', marginRight: '5px' }}
                        >
                          {spot.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(spot.id)}
                          className="btn btn-sm"
                          style={{ background: '#e74c3c', color: 'white' }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      데이터가 없습니다.
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

export default SpotList;
