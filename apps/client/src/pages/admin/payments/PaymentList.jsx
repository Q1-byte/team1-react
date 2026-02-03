import { useState } from 'react';

function PaymentList() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      user_id: 2,
      username: 'user1',
      plan_title: '제주 2박3일',
      amount: 450000,
      payment_method: '카드',
      status: 'PAID',
      paid_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 2,
      username: 'user1',
      plan_title: '부산 당일치기',
      amount: 89000,
      payment_method: '포인트',
      status: 'PAID',
      paid_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredPayments = filterStatus === 'ALL'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  const handleCancel = (id) => {
    if (window.confirm('결제를 취소하시겠습니까?')) {
      setPayments(payments.map(p =>
        p.id === id ? { ...p, status: 'CANCEL' } : p
      ));
      alert('결제가 취소되었습니다.');
    }
  };

  const getTotalAmount = () => {
    return payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1>💳 결제 내역</h1>
        <p>전체 결제 내역 조회 및 관리</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>총 결제 금액</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {getTotalAmount().toLocaleString()}원
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>총 결제 건수</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {payments.filter(p => p.status === 'PAID').length}건
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>취소 건수</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>
            {payments.filter(p => p.status === 'CANCEL').length}건
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : ''}`}
            style={filterStatus !== 'ALL' ? { background: '#ecf0f1', color: '#2c3e50' } : {}}
          >
            전체
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`btn ${filterStatus === 'PAID' ? 'btn-success' : ''}`}
            style={filterStatus !== 'PAID' ? { background: '#ecf0f1', color: '#2c3e50' } : {}}
          >
            결제완료
          </button>
          <button
            onClick={() => setFilterStatus('CANCEL')}
            className={`btn ${filterStatus === 'CANCEL' ? 'btn-danger' : ''}`}
            style={filterStatus !== 'CANCEL' ? { background: '#ecf0f1', color: '#2c3e50' } : {}}
          >
            취소
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>결제 ID</th>
              <th>회원</th>
              <th>여행 계획</th>
              <th>금액</th>
              <th>결제 수단</th>
              <th>상태</th>
              <th>결제일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  결제 내역이 없습니다
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.username}</td>
                  <td><strong>{payment.plan_title}</strong></td>
                  <td><strong>{payment.amount.toLocaleString()}원</strong></td>
                  <td>{payment.payment_method}</td>
                  <td>
                    <span className={`badge ${
                      payment.status === 'PAID' ? 'badge-success' :
                      payment.status === 'CANCEL' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {payment.status === 'PAID' ? '결제완료' :
                       payment.status === 'CANCEL' ? '취소' : '환불'}
                    </span>
                  </td>
                  <td>{new Date(payment.paid_at).toLocaleString()}</td>
                  <td>
                    {payment.status === 'PAID' && (
                      <button
                        onClick={() => handleCancel(payment.id)}
                        className="btn btn-danger btn-sm"
                      >
                        취소
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentList;
