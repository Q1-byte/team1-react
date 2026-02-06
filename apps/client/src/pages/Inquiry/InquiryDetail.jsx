import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInquiryApi, deleteInquiryApi } from '../../api/inquiryApi';
import './InquiryDetail.css';

const InquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInquiry();
    }, [id]);

    const fetchInquiry = async () => {
        try {
            setLoading(true);
            const data = await getInquiryApi(id);
            setInquiry(data);
        } catch (err) {
            console.error('문의 상세 조회 실패:', err);
            if (err.response?.status === 403) {
                setError('접근 권한이 없습니다.');
            } else if (err.response?.status === 404) {
                setError('문의를 찾을 수 없습니다.');
            } else {
                setError('문의를 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (inquiry.status === 'ANSWERED') {
            alert('답변이 완료된 문의는 삭제할 수 없습니다.');
            return;
        }

        if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteInquiryApi(id);
            alert('문의가 삭제되었습니다.');
            navigate('/inquiry');
        } catch (err) {
            console.error('문의 삭제 실패:', err);
            alert(err.response?.data?.message || '문의 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="inquiry-detail-wrapper">
                <p style={{ textAlign: 'center', padding: '50px 0' }}>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inquiry-detail-wrapper">
                <p style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>{error}</p>
                <div style={{ textAlign: 'center' }}>
                    <button className="back-btn" onClick={() => navigate('/inquiry')}>목록으로</button>
                </div>
            </div>
        );
    }

    if (!inquiry) {
        return null;
    }

    const isOwner = user?.id === inquiry.userId;
    const canDelete = isOwner && inquiry.status === 'WAIT';

    return (
        <div className="inquiry-detail-wrapper">
            <div className="detail-header">
                <span className={`status-badge ${inquiry.status?.toLowerCase()}`}>
                    {inquiry.statusDescription || (inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기')}
                </span>
                <h2>{inquiry.title}</h2>
                <div className="detail-meta">
                    <span>유형: {inquiry.category}</span>
                    <span className="separator">|</span>
                    <span>작성일: {inquiry.createdAt?.split('T')[0]}</span>
                    {inquiry.isSecret && (
                        <>
                            <span className="separator">|</span>
                            <span>🔒 비밀글</span>
                        </>
                    )}
                </div>
            </div>

            <div className="detail-body">
                <div className="user-question">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{inquiry.content}</p>
                </div>

                {inquiry.status === 'ANSWERED' && inquiry.answer && (
                    <div className="admin-answer">
                        <div className="answer-header">
                            <strong>관리자 답변</strong>
                            <span>답변일: {inquiry.answeredAt?.split('T')[0]}</span>
                        </div>
                        <div className="answer-content">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{inquiry.answer}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-footer">
                <button className="back-btn" onClick={() => navigate('/inquiry')}>목록으로</button>

                {canDelete && (
                    <button className="delete-btn" onClick={handleDelete}>문의 삭제</button>
                )}
            </div>
        </div>
    );
};

export default InquiryDetail;
