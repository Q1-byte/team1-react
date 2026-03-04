import { useState, useEffect, useCallback } from 'react';
import { getSpots, createSpot, deleteSpot, toggleSpot } from '../../../api/spotApi';
import api from '../../../api/axiosConfig';

const EMPTY_FORM = {
  name: '', address: '', category: '관광', description: '',
  imageUrl: '', latitude: '', longitude: '', level: 1, regionId: ''
};

const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box', fontSize: '14px' };

function SpotList() {
  const [spots, setSpots] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('files', file);
    try {
      setUploading(true);
      const res = await api.post('/api/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data[0]?.storedUrl;
      if (url) setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const fetchSpots = useCallback(async (p = 0, kw = keyword, active = activeFilter) => {
    try {
      setLoading(true);
      const data = await getSpots(p, 8, kw, active);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchSpots(0, keyword, activeFilter);
  };

  const handleActiveFilter = (value) => {
    const next = activeFilter === value ? null : value;
    setActiveFilter(next);
    setPage(0);
    fetchSpots(0, keyword, next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSpot({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        level: formData.level ? parseInt(formData.level) : null,
        regionId: formData.regionId ? parseInt(formData.regionId) : null,
      });
      alert('여행지가 등록되었습니다.');
      setShowForm(false);
      setFormData(EMPTY_FORM);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" onClick={() => handleActiveFilter(null)} style={{ cursor: 'pointer', borderLeft: activeFilter === null ? '4px solid #005ADE' : '4px solid transparent' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체 여행지</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalElements.toLocaleString()}개</p>
        </div>
        <div className="card" onClick={() => handleActiveFilter(true)} style={{ cursor: 'pointer', borderLeft: activeFilter === true ? '4px solid #2ecc71' : '4px solid transparent' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>활성 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>{activeFilter === true ? `${totalElements.toLocaleString()}개` : '-'}</p>
        </div>
        <div className="card" onClick={() => handleActiveFilter(false)} style={{ cursor: 'pointer', borderLeft: activeFilter === false ? '4px solid #e74c3c' : '4px solid transparent' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>비활성 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>{activeFilter === false ? `${totalElements.toLocaleString()}개` : '-'}</p>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa' }}>
          <h3 style={{ marginBottom: '4px' }}>새 여행지 등록</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>* 표시 항목은 필수입니다.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* 여행지명 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>여행지명 *</label>
                <input type="text" placeholder="예: 경복궁" value={formData.name} onChange={set('name')} required style={inputStyle} />
              </div>

              {/* 카테고리 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>카테고리 *</label>
                <select value={formData.category} onChange={set('category')} style={inputStyle}>
                  <option>관광</option>
                  <option>맛집</option>
                  <option>숙소</option>
                  <option>액티비티</option>
                  <option>카페</option>
                </select>
              </div>

              {/* 주소 */}
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <label style={labelStyle}>주소 *</label>
                <input type="text" placeholder="예: 서울특별시 종로구 사직로 161" value={formData.address} onChange={set('address')} required style={inputStyle} />
              </div>

              {/* 이미지 업로드 */}
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <label style={labelStyle}>대표 이미지</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', height: '90px', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'white', flexShrink: 0 }}>
                    {formData.imageUrl
                      ? <img src={formData.imageUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      : <span style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', padding: '8px' }}>미리보기</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'block', padding: '10px', background: '#005ADE', color: 'white', borderRadius: '6px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, fontSize: '14px' }}>
                      {uploading ? '업로드 중...' : '📎 파일에서 선택'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                    <input type="text" placeholder="또는 이미지 URL 직접 입력" value={formData.imageUrl} onChange={set('imageUrl')} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* 위도 / 경도 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>위도 (latitude)</label>
                <input type="number" placeholder="예: 37.5796" value={formData.latitude} onChange={set('latitude')} step="any" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>경도 (longitude)</label>
                <input type="number" placeholder="예: 126.9770" value={formData.longitude} onChange={set('longitude')} step="any" style={inputStyle} />
              </div>

              {/* 등급 / 지역 ID */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>등급 (level)</label>
                <input type="number" placeholder="예: 1" value={formData.level} onChange={set('level')} min="1" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>지역 ID (regionId)</label>
                <input type="number" placeholder="예: 1" value={formData.regionId} onChange={set('regionId')} style={inputStyle} />
              </div>

              {/* 설명 */}
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <textarea placeholder="여행지에 대한 설명을 입력하세요." value={formData.description} onChange={set('description')}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">등록</button>
              <button type="button" onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); }} className="btn" style={{ background: '#95a5a6', color: 'white' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="🔍 여행지명 또는 주소로 검색..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
              style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: '6px', width: '280px', fontSize: '0.9rem' }} />
            <button type="submit" className="btn btn-primary btn-sm">검색</button>
            {keyword && (
              <button type="button" className="btn btn-sm" style={{ background: '#ddd', color: '#555' }}
                onClick={() => { setKeyword(''); setPage(0); fetchSpots(0, '', activeFilter); }}>초기화</button>
            )}
          </form>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ 여행지 등록</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이미지</th>
                  <th>여행지명</th>
                  <th>주소</th>
                  <th>카테고리</th>
                  <th>등급</th>
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
                      <td>
                        {spot.imageUrl
                          ? <img src={spot.imageUrl} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                          : <span style={{ fontSize: '11px', color: '#aaa' }}>없음</span>}
                      </td>
                      <td><strong>{spot.name}</strong></td>
                      <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{spot.address}</td>
                      <td><span className="badge badge-success">{spot.category}</span></td>
                      <td style={{ textAlign: 'center' }}>{spot.level ?? '-'}</td>
                      <td>
                        <span className="badge" style={{ background: spot.isActive ? '#e6f4ea' : '#fce8e8', color: spot.isActive ? '#2e7d32' : '#c62828' }}>
                          {spot.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td>{spot.createdAt ? new Date(spot.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button onClick={() => handleToggle(spot.id)} className="btn btn-sm"
                          style={{ background: spot.isActive ? '#f39c12' : '#2ecc71', color: 'white', marginRight: '5px' }}>
                          {spot.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button onClick={() => handleDelete(spot.id)} className="btn btn-sm" style={{ background: '#e74c3c', color: 'white' }}>삭제</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>데이터가 없습니다.</td></tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setPage(0)} disabled={page === 0} className="btn btn-sm">처음</button>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-sm">이전</button>
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter(num => { const s = Math.max(0, Math.min(page - 2, totalPages - 5)); return num >= s && num <= s + 4; })
                  .map(num => (
                    <button key={num} onClick={() => setPage(num)} className={`btn btn-sm ${page === num ? 'btn-primary' : ''}`}>{num + 1}</button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-sm">다음</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} className="btn btn-sm">마지막</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SpotList;
