import React, { useState } from 'react'; // [추가]
import { useParams, useNavigate } from 'react-router-dom'; // [추가]
import './InquiryDetail.css';

const InquiryDetail = () => { // [수정] props 제거
    const { id } = useParams(); // URL에서 ID 추출
    const navigate = useNavigate();

    // [추가] App.jsx 수정 없이 사용할 내부 유저 정보
    const currentUser = { id: 101, role: 'USER' }; 

    // [추가] 테스트용 가짜 상세 데이터 (리뷰 상세와 비슷한 구조)
    const [inquiry] = useState({
        id: id,
        type: "결제",
        title: "중복 결제가 되었어요. 확인 부탁드립니다.",
        userId: 101,
        content: "어제 오후 3시쯤 결제를 했는데, 카드 승인 문자가 두 번 왔습니다. 확인 후 한 건은 취소 부탁드려요.",
        status: "ANSWERED", // ANSWERED 또는 WAITING
        answer: "안녕하세요. 고객님. 확인 결과 시스템 오류로 중복 결제된 것이 확인되어 즉시 취소 처리해 드렸습니다. 이용에 불편을 드려 죄송합니다.",
        createdAt: "2026-02-03T10:00:00",
        answeredAt: "2026-02-04T14:00:00"
    });

    // 삭제 로직 (리뷰 리스트에서 만드신 것과 동일한 스타일)
    const handleDelete = () => {
        if (inquiry.status === 'ANSWERED') {
            alert("답변이 완료된 문의는 삭제할 수 없습니다.");
            return;
        }
        if (window.confirm("정말로 이 문의를 취소하시겠습니까?")) {
            alert("문의가 삭제되었습니다.");
            navigate('/inquiry');
        }
    };

    return (
        <div className="inquiry-detail-wrapper">
            <div className="detail-header">
                <span className={`status-badge ${inquiry.status.toLowerCase()}`}>
                    {inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                </span>
                <h2>{inquiry.title}</h2>
                <div className="detail-meta">
                    <span>유형: {inquiry.type}</span>
                    <span className="separator">|</span>
                    <span>작성일: {inquiry.createdAt.split('T')[0]}</span>
                </div>
            </div>

            <div className="detail-body">
                <div className="user-question">
                    <p>{inquiry.content}</p>
                </div>

                {/* 답변이 있을 때만 노출 */}
                {inquiry.status === 'ANSWERED' && (
                    <div className="admin-answer">
                        <div className="answer-header">
                            <strong>관리자 답변</strong>
                            <span>답변일: {inquiry.answeredAt?.split('T')[0]}</span>
                        </div>
                        <div className="answer-content">
                            {inquiry.answer}
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-footer">
                <button className="back-btn" onClick={() => navigate('/inquiry')}>목록으로</button>
                
                {/* 본인 글이고 답변 대기 중일 때만 삭제 버튼 노출 */}
                {currentUser.id === inquiry.userId && inquiry.status === 'WAITING' && (
                    <button className="delete-btn" onClick={handleDelete}>문의 삭제</button>
                )}
            </div>
        </div>
    );
};

export default InquiryDetail;