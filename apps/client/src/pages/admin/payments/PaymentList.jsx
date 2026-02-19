import { useState, useEffect } from 'react';
import { getPayments, cancelPayment } from '../../../api/paymentApi';

const STATUS_LABEL = {
  COMPLETED: '결제완료',
  CANCELLED: '취소',
  WAITING_FOR_DEPOSIT: '입금대기'
};

const STATUS_STYLE = {
  COMPLETED: { background: '#e6f4ea', color: '#2e7d32' },
  CANCELLED: { background: '#fde8e8', color: '#c62828' },
  WAITING_FOR_DEPOSIT: { background: '#e3f2fd', color: '#1565c0' }
};

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async (p = 0, status = statusFilter) => {
    try {
      setLoading(true);
      const data = await getPayments(p, 10, status);
      setPayments(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('결제 내역 로드 실패:', err);
      alert('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, statusFilter);
  }, [page]);

  const handleStatusFilter = (status) => {
    const next = statusFilter === status ? '' : status;
    setStatusFilter(next);
    setPage(0);
    fetchPayments(0, next);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('결제를 취소하시겠습니까?')) return;
    try {
      await cancelPayment(id);
      alert('결제가 취소되었습니다.');
      fetchPayments(page, statusFilter);
    } catch (err) {
      console.error('결제 취소 실패:', err);
      alert('결제 취소에 실패했습니다.');
    }
  };

  // READY(미완료 이탈) 제외
  const visiblePayments = payments.filter(p => p.status !== 'READY');

  const totalAmount = visiblePayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>💳 결제 내역</h1>
        <p>전체 결제 내역 조회 및 관리</p>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div
          className="card"
          onClick={() => handleStatusFilter('')}
          style={{ cursor: 'pointer', borderLeft: statusFilter === '' ? '4px solid #005ADE' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>전체</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalElements.toLocaleString()}건</p>
        </div>
        <div
          className="card"
          onClick={() => handleStatusFilter('COMPLETED')}
          style={{ cursor: 'pointer', borderLeft: statusFilter === 'COMPLETED' ? '4px solid #2ecc71' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>결제완료 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>
            {statusFilter === 'COMPLETED' ? `${totalElements.toLocaleString()}건` : '-'}
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>현재 페이지 완료 금액</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#005ADE' }}>
            {totalAmount.toLocaleString()}원
          </p>
        </div>
        <div
          className="card"
          onClick={() => handleStatusFilter('CANCELLED')}
          style={{ cursor: 'pointer', borderLeft: statusFilter === 'CANCELLED' ? '4px solid #e74c3c' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>취소 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>
            {statusFilter === 'CANCELLED' ? `${totalElements.toLocaleString()}건` : '-'}
          </p>
        </div>
        <div
          className="card"
          onClick={() => handleStatusFilter('WAITING_FOR_DEPOSIT')}
          style={{ cursor: 'pointer', borderLeft: statusFilter === 'WAITING_FOR_DEPOSIT' ? '4px solid #1565c0' : '4px solid transparent' }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>입금대기 필터</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1565c0' }}>
            {statusFilter === 'WAITING_FOR_DEPOSIT' ? `${totalElements.toLocaleString()}건` : '-'}
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</p>
        ) : (
          <>
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
                {visiblePayments.length > 0 ? (
                  visiblePayments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{payment.username}</td>
                      <td><strong>{payment.planTitle}</strong></td>
                      <td><strong>{payment.amount?.toLocaleString()}원</strong></td>
                      <td>{payment.paymentMethod || '-'}</td>
                      <td>
                        <span className="badge" style={STATUS_STYLE[payment.status] || {}}>
                          {STATUS_LABEL[payment.status] || payment.status}
                        </span>
                      </td>
                      <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '-'}</td>
                      <td>
                        {payment.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleCancel(payment.id)}
                            className="btn btn-sm"
                            style={{ background: '#e74c3c', color: 'white' }}
                          >
                            취소
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      결제 내역이 없습니다.
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

export default PaymentList;
