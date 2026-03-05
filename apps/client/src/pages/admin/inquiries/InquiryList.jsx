import { useState, useEffect } from 'react';
import {
  getAdminInquiriesApi,
  getAdminInquiryApi,
  answerInquiryApi,
  deleteAdminInquiryApi,
  getAdminInquiryStatsApi,
  searchInquiriesApi
} from '../../../api/inquiryApi';

function InquiryList() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalStats, setTotalStats] = useState({ total: 0, waiting: 0, answered: 0 });
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // 실제 검색에 사용된 키워드

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [page, statusFilter, activeSearch]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      let data;
      if (activeSearch) {
        data = await searchInquiriesApi(activeSearch, page, 8);
      } else {
        data = await getAdminInquiriesApi(page, 8, statusFilter);
      }
      setInquiries(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('문의 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await getAdminInquiryStatsApi();
      setTotalStats(stats || { total: 0, waiting: 0, answered: 0 });
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const handleAnswer = async (inquiry) => {
    try {
      const detail = await getAdminInquiryApi(inquiry.id);
      setSelectedInquiry(detail);
      setAnswerText(detail.answer || '');
    } catch (error) {
      console.error('문의 상세 조회 실패:', error);
      setSelectedInquiry(inquiry);
      setAnswerText(inquiry.answer || '');
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await answerInquiryApi(selectedInquiry.id, answerText);
      alert('답변이 등록되었습니다.');
      setSelectedInquiry(null);
      setAnswerText('');
      fetchInquiries();
      fetchStats();
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) return;

    try {
      await deleteAdminInquiryApi(id);
      alert('문의가 삭제되었습니다.');
      fetchInquiries();
      fetchStats();
    } catch (error) {
      console.error('문의 삭제 실패:', error);
      alert('문의 삭제에 실패했습니다.');
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setActiveSearch(''); // 필터링 시 검색 초기화
    setSearchKeyword('');
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchKeyword);
    setStatusFilter(''); // 검색 시 필터링 초기화
    setPage(0);
  };

  return (
    <div>
      <div className="page-header">
        <h1>문의/답변 관리</h1>
        <p>회원 문의 조회 및 답변</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" onClick={() => handleStatusFilter('')} style={{ cursor: 'pointer', borderTop: !statusFilter && !activeSearch ? '4px solid #3498db' : 'none' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체 문의</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {totalStats.total}건
          </p>
        </div>
        <div className="card" onClick={() => handleStatusFilter('WAIT')} style={{ cursor: 'pointer', borderTop: statusFilter === 'WAIT' ? '4px solid #f39c12' : 'none' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>대기 중</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f39c12' }}>
            {totalStats.waiting}건
          </p>
        </div>
        <div className="card" onClick={() => handleStatusFilter('ANSWERED')} style={{ cursor: 'pointer', borderTop: statusFilter === 'ANSWERED' ? '4px solid #2ecc71' : 'none' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>답변 완료</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {totalStats.answered}건
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="제목 또는 내용으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button type="submit" className="btn btn-primary">검색</button>
          {activeSearch && (
            <button
              type="button"
              className="btn"
              style={{ background: '#95a5a6', color: 'white' }}
              onClick={() => {
                setSearchKeyword('');
                setActiveSearch('');
              }}
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {selectedInquiry && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa' }}>
          <h3>답변 작성</h3>
          <div style={{ marginTop: '16px' }}>
            <p><strong>작성자:</strong> {selectedInquiry.writerName}</p>
            <p><strong>카테고리:</strong> {selectedInquiry.category}</p>
            <p><strong>제목:</strong> {selectedInquiry.title}</p>
            <p><strong>문의 내용:</strong></p>
            <div style={{ background: 'white', padding: '12px', borderRadius: '6px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
              {selectedInquiry.content}
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="답변을 입력하세요..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={submitAnswer}
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? '등록 중...' : '답변 등록'}
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="btn"
                style={{ background: '#95a5a6', color: 'white' }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>작성자</th>
                  <th>카테고리</th>
                  <th>제목</th>
                  <th>상태</th>
                  <th>작성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length > 0 ? (
                  inquiries.map(inquiry => (
                    <tr key={inquiry.id}>
                      <td>{inquiry.id}</td>
                      <td>{inquiry.writerName}</td>
                      <td><span className="badge badge-success">{inquiry.category}</span></td>
                      <td>
                        <strong>{inquiry.title}</strong>
                        {inquiry.isSecret && <span style={{ marginLeft: '5px', color: '#999' }}>🔒</span>}
                      </td>
                      <td>
                        <span className={`badge ${inquiry.status === 'WAIT' ? 'badge-warning' : 'badge-success'}`}>
                          {inquiry.statusDescription || (inquiry.status === 'WAIT' ? '대기' : '답변완료')}
                        </span>
                      </td>
                      <td>{inquiry.createdAt?.split('T')[0]}</td>
                      <td>
                        <button
                          onClick={() => handleAnswer(inquiry)}
                          className={`btn btn-sm ${inquiry.status === 'WAIT' ? 'btn-primary' : ''}`}
                          style={inquiry.status !== 'WAIT' ? { background: '#3498db', color: 'white' } : {}}
                        >
                          {inquiry.status === 'WAIT' ? '답변하기' : '수정'}
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="btn btn-sm"
                          style={{ background: '#e74c3c', color: 'white', marginLeft: '5px' }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      문의 내역이 없습니다.
                    </td>
                  </tr>
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

export default InquiryList;
