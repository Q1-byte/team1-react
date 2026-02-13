import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyInquiriesApi } from '../../api/inquiryApi';
import './InquiryList.css';

const InquiryList = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/inquiry' } });
            return;
        }
        fetchInquiries();
    }, [isAuthenticated, page]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const data = await getMyInquiriesApi(page, 10);
            setInquiries(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError('문의 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderRow = (inquiry) => {
        const isLocked = inquiry.isSecret &&
                        inquiry.userId !== user?.id &&
                        user?.role !== 'ADMIN';

        return (
            <tr key={inquiry.id} className="inquiry-row">
                <td className="col-type">{inquiry.category}</td>
                <td className="col-title">
                    {isLocked ? (
                        <span className="locked-text">
                            <i className="lock-icon">🔒</i> 비밀글입니다.
                        </span>
                    ) : (
                        <Link to={`/inquiry/${inquiry.id}`} className="inquiry-link">
                            {inquiry.title}
                            {inquiry.isSecret && <span className="lock-icon"> 🔒</span>}
                        </Link>
                    )}
                </td>
                <td className="col-status">
                    <span className={`status-badge ${inquiry.status?.toLowerCase()}`}>
                        {inquiry.statusDescription || (inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기')}
                    </span>
                </td>
                <td className="col-date">
                    {inquiry.createdAt ? inquiry.createdAt.split('T')[0] : '-'}
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <div className="inquiry-list-wrapper">
                <div className="list-header">
                    <h2>1:1 문의 게시판</h2>
                </div>
                <p style={{ textAlign: 'center', padding: '50px 0' }}>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="inquiry-list-wrapper">
            <div className="list-header">
                <h2>1:1 문의 게시판</h2>
                <p>서비스 이용 관련 궁금한 점을 남겨주시면 관리자가 답변해 드립니다.</p>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

            <table className="inquiry-table">
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>유형</th>
                        <th>제목</th>
                        <th style={{ width: '15%' }}>상태</th>
                        <th style={{ width: '15%' }}>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries.length > 0 ? (
                        inquiries.map(renderRow)
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-msg">등록된 문의 내역이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{ marginRight: '10px', padding: '5px 15px' }}
                    >
                        이전
                    </button>
                    <span>{page + 1} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        style={{ marginLeft: '10px', padding: '5px 15px' }}
                    >
                        다음
                    </button>
                </div>
            )}

            <div className="list-footer">
                <button className="write-btn" onClick={() => navigate('/inquiry/write')}>
                    문의하기
                </button>
            </div>
        </div>
    );
};

export default InquiryList;
