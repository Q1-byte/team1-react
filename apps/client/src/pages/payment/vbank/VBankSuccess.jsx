import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import '../PaymentStatus.css';

const VBankSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [accountInfo, setAccountInfo] = useState(null);

    useEffect(() => {
        const confirmVBank = async () => {
            try {
                const paymentKey = searchParams.get('paymentKey');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');

                // 백엔드의 가상계좌 승인 엔드포인트 호출
                const response = await api.post('/api/payment/toss/confirm', {
                    paymentKey,
                    orderId,
                    amount: parseInt(amount, 10)
                });

                if (response.data) {
                    // 가상계좌 정보 저장 (은행명, 계좌번호, 예금주 등)
                    // 응답 구조에 따라 response.data.virtualAccount 또는 response.data 확인 필요
                    setAccountInfo(response.data.virtualAccount || response.data); 
                    setIsProcessing(false);
                    
                    // 로컬스토리지 임시 데이터 삭제
                    localStorage.removeItem('temp_plan_data');
                }
            } catch (error) {
                console.error("가상계좌 신청 오류:", error);
                navigate('/payment/vbank/fail');
            }
        };

        confirmVBank();
    }, [searchParams, navigate]);

    // 🚀 확인 버튼 클릭 시 영수증 페이지로 이동하는 함수
    const handleConfirm = () => {
        navigate('/reserve/receipt', { 
            replace: true,
            state: { 
                paymentType: 'VBANK',
                accountDetail: accountInfo 
            }
        });
    };

    if (isProcessing) {
        return (
            <div className="payment-status-container">
                <div className="status-card">
                    <div className="spinner"></div>
                    <p>안전하게 계좌 정보를 생성 중입니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <div className="success-icon" style={{ fontSize: '3rem', marginBottom: '10px' }}>🏦</div>
                <h2>가상계좌 발급 완료</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>아래 계좌로 입금해 주시면 결제가 최종 완료됩니다.</p>
                
                <div className="account-details" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    textAlign: 'left',
                    marginBottom: '25px',
                    lineHeight: '1.8'
                }}>
                    <p><strong>은행:</strong> {accountInfo?.bank || '정보 없음'}</p>
                    <p><strong>계좌번호:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{accountInfo?.accountNumber}</span></p>
                    <p><strong>입금 금액:</strong> {Number(searchParams.get('amount')).toLocaleString()}원</p>
                    {accountInfo?.dueDate && (
                        <p><strong>입금 기한:</strong> {new Date(accountInfo.dueDate).toLocaleString()}</p>
                    )}
                </div>

                <button 
                    className="confirm-btn" 
                    onClick={handleConfirm}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#007bff',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    확인 및 영수증 보기 🧾
                </button>
            </div>
        </div>
    );
};

export default VBankSuccess;