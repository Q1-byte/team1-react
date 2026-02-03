import { useState } from 'react';

function InquiryList() {
  const [inquiries, setInquiries] = useState([
    {
      id: 1,
      username: 'user1',
      type: '문의',
      category: '결제',
      title: '결제 취소 문의',
      content: '결제를 취소하고 싶은데 어떻게 하나요?',
      answer: '',
      status: 'WAIT',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'user1',
      type: '문의',
      category: '여행',
      title: '여행 일정 변경',
      content: '일정을 변경할 수 있나요?',
      answer: '네, 마이페이지에서 변경 가능합니다.',
      status: 'ANSWERED',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      answered_at: new Date().toISOString()
    }
  ]);

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answerText, setAnswerText] = useState('');

  const handleAnswer = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerText(inquiry.answer || '');
  };

  const submitAnswer = () => {
    if (!answerText.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    setInquiries(inquiries.map(inq =>
      inq.id === selectedInquiry.id ? {
        ...inq,
        answer: answerText,
        status: 'ANSWERED',
        answered_at: new Date().toISOString()
      } : inq
    ));

    alert('답변이 등록되었습니다.');
    setSelectedInquiry(null);
    setAnswerText('');
  };

  const filterStatus = (status) => {
    if (status === 'ALL') return inquiries;
    return inquiries.filter(inq => inq.status === status);
  };

  return (
    <div>
      <div className="page-header">
        <h1>💬 문의/답변 관리</h1>
        <p>회원 문의 조회 및 답변</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체 문의</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {inquiries.length}건
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>대기 중</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f39c12' }}>
            {inquiries.filter(i => i.status === 'WAIT').length}건
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>답변 완료</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {inquiries.filter(i => i.status === 'ANSWERED').length}건
          </p>
        </div>
      </div>

      {selectedInquiry && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa' }}>
          <h3>답변 작성</h3>
          <div style={{ marginTop: '16px' }}>
            <p><strong>제목:</strong> {selectedInquiry.title}</p>
            <p><strong>문의 내용:</strong> {selectedInquiry.content}</p>
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
                marginTop: '12px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={submitAnswer} className="btn btn-success">답변 등록</button>
              <button onClick={() => setSelectedInquiry(null)} className="btn" style={{ background: '#95a5a6', color: 'white' }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>작성자</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>상태</th>
              <th>작성일</th>
              <th>답변일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td>{inquiry.id}</td>
                <td>{inquiry.username}</td>
                <td><span className="badge badge-success">{inquiry.category}</span></td>
                <td><strong>{inquiry.title}</strong></td>
                <td>
                  <span className={`badge ${inquiry.status === 'WAIT' ? 'badge-warning' : 'badge-success'}`}>
                    {inquiry.status === 'WAIT' ? '대기' : '답변완료'}
                  </span>
                </td>
                <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                <td>
                  {inquiry.answered_at ? new Date(inquiry.answered_at).toLocaleDateString() : '-'}
                </td>
                <td>
                  <button
                    onClick={() => handleAnswer(inquiry)}
                    className={`btn btn-sm ${inquiry.status === 'WAIT' ? 'btn-primary' : ''}`}
                    style={inquiry.status !== 'WAIT' ? { background: '#95a5a6', color: 'white' } : {}}
                  >
                    {inquiry.status === 'WAIT' ? '답변하기' : '수정'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InquiryList;
