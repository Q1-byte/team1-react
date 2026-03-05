import { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';
import { getEvents, createEvent, deleteEvent } from '../../../api/eventApi';

const EMPTY_FORM = {
  name: '', address: '', addr2: '', category: '축제',
  tel: '', imageUrl: '', description: '', startDate: '', endDate: ''
};

const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box', fontSize: '14px' };

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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

  const fetchEvents = async (p = page) => {
    try {
      setLoading(true);
      const data = await getEvents(p, 8);
      if (data && data.content) {
        setEvents(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setEvents(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('이벤트 목록 조회 실패:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent(formData)
      .then(() => {
        alert('이벤트가 등록되었습니다.');
        setShowForm(false);
        setFormData(EMPTY_FORM);
        setPage(0);
        fetchEvents(0);
      })
      .catch(err => {
        console.error('이벤트 등록 실패:', err);
        alert('등록에 실패했습니다.');
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      deleteEvent(id)
        .then(() => fetchEvents(page))
        .catch(err => {
          console.error('이벤트 삭제 실패:', err);
          alert('삭제에 실패했습니다.');
        });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🎉 이벤트 관리</h1>
        <p>축제, 이벤트 등록 및 관리 (총 {totalElements}건)</p>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ marginTop: '16px' }}>
          + 이벤트 등록
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: '4px' }}>새 이벤트 등록</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>* 표시 항목은 필수입니다.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* 이벤트명 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>이벤트명 *</label>
                <input type="text" placeholder="예: 서울 빛 축제" value={formData.name} onChange={set('name')} required style={inputStyle} />
              </div>

              {/* 카테고리 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>카테고리 *</label>
                <select value={formData.category} onChange={set('category')} style={inputStyle}>
                  <option>축제</option>
                  <option>먹거리</option>
                  <option>시즌테마</option>
                </select>
              </div>

              {/* 주소 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>주소 *</label>
                <input type="text" placeholder="예: 서울특별시 중구 세종대로 110" value={formData.address} onChange={set('address')} required style={inputStyle} />
              </div>

              {/* 상세주소 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>상세주소</label>
                <input type="text" placeholder="예: 1층 행사장" value={formData.addr2} onChange={set('addr2')} style={inputStyle} />
              </div>

              {/* 전화번호 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>전화번호</label>
                <input type="tel" placeholder="예: 02-1234-5678" value={formData.tel} onChange={set('tel')} style={inputStyle} />
              </div>

              {/* 기간 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>행사 기간 *</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="date" value={formData.startDate} onChange={set('startDate')} required style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ color: '#888', flexShrink: 0 }}>~</span>
                  <input type="date" value={formData.endDate} onChange={set('endDate')} required style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>

              {/* 이미지 업로드 */}
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <label style={labelStyle}>대표 이미지</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', height: '90px', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8f9fa', flexShrink: 0 }}>
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

              {/* 설명 */}
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <textarea placeholder="이벤트에 대한 설명을 입력하세요." value={formData.description} onChange={set('description')}
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

      <div className="card" style={{ marginTop: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이미지</th>
                  <th>이벤트명</th>
                  <th>주소</th>
                  <th>카테고리</th>
                  <th>전화번호</th>
                  <th>기간</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>등록된 이벤트가 없습니다.</td>
                  </tr>
                ) : (
                  events.map(event => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td>
                        {event.imageUrl
                          ? <img src={event.imageUrl} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                          : <span style={{ fontSize: '11px', color: '#aaa' }}>없음</span>}
                      </td>
                      <td><strong>{event.name}</strong></td>
                      <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{event.address}</td>
                      <td><span className="badge badge-success">{event.category}</span></td>
                      <td style={{ fontSize: '12px' }}>{event.tel || '-'}</td>
                      <td style={{ fontSize: '13px' }}>{event.startDate} ~ {event.endDate}</td>
                      <td>
                        <button onClick={() => handleDelete(event.id)} className="btn btn-danger btn-sm">삭제</button>
                      </td>
                    </tr>
                  ))
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

export default EventList;
