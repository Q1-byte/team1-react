import React, { useState } from 'react'; // [추가] useState 추가
import './InquiryList.css';

// [수정] props에서 받던 것을 제거하고 내부에서 처리하도록 변경
const InquiryList = () => { 
    
    // [추가] App.jsx를 수정하지 않기 위해 내부에서 유저 정보 선언
    const currentUser = { id: 101, role: 'USER' }; 

    // [추가] 화면을 테스트해볼 수 있는 가짜 데이터 (작성하신 리뷰 리스트 형식 참고)
    const [inquiries] = useState([
        { 
            id: 1, 
            type: "결제", 
            title: "중복 결제가 되었어요.", 
            userId: 101, 
            status: "ANSWERED", 
            isSecret: true,
            isDeleted: false,
            createdAt: "2026-02-03T10:00:00" 
        },
        { 
            id: 2, 
            type: "시스템", 
            title: "로그인이 안 됩니다.", 
            userId: 102, 
            status: "WAITING", 
            isSecret: false,
            isDeleted: false,
            createdAt: "2026-02-04T11:00:00" 
        }
    ]);

    // 리스트 항목 렌더링 로직 (기존 코드 그대로 유지)
    const renderRow = (inquiry) => {
        // 비밀글 여부 및 권한 체크
        const isLocked = inquiry.isSecret && 
                        inquiry.userId !== currentUser.id && 
                        currentUser.role !== 'ADMIN';

        return (
        <tr key={inquiry.id} className="inquiry-row">
            <td className="col-type">{inquiry.type}</td>
            <td className="col-title">
            {isLocked ? (
                <span className="locked-text">
                <i className="lock-icon">🔒</i> 비밀글입니다.
                </span>
            ) : (
                <a href={`/inquiry/${inquiry.id}`} className="inquiry-link">
                {inquiry.title}
                </a>
            )}
            {inquiry.images && inquiry.images.length > 0 && <span className="img-icon">🖼️</span>}
            </td>
            <td className="col-status">
            <span className={`status-badge ${inquiry.status.toLowerCase()}`}>
                {inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}
            </span>
            </td>
            <td className="col-date">{inquiry.createdAt.split('T')[0]}</td>
        </tr>
        );
    };

    return (
        <div className="inquiry-list-wrapper">
        <div className="list-header">
            <h2>1:1 문의 게시판</h2>
            <p>서비스 이용 관련 궁금한 점을 남겨주시면 관리자가 답변해 드립니다.</p>
        </div>

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
            {/* [수정] 외부에서 오던 inquiries 대신 내부 상태값 사용 */}
            {inquiries && inquiries.filter(q => !q.isDeleted).length > 0 ? (
                inquiries.filter(q => !q.isDeleted).map(renderRow)
            ) : (
                <tr>
                <td colSpan="4" className="empty-msg">등록된 문의 내역이 없습니다.</td>
                </tr>
            )}
            </tbody>
        </table>

        {currentUser.role !== 'ADMIN' && (
            <div className="list-footer">
            <button className="write-btn" onClick={() => window.location.href='/inquiry/write'}>
                문의하기
            </button>
            </div>
        )}
        </div>
    );
};

export default InquiryList;