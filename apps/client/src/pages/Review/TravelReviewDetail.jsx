import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './TravelReviewDetail.css';

const TravelReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🚩 신고 모달 관련 상태
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportCategory, setReportCategory] = useState("스팸/광고");
    const [reportDetail, setReportDetail] = useState("");

    // 💬 댓글 관련 상태
    const [newComment, setNewComment] = useState("");
    const [replyToId, setReplyToId] = useState(null); // 대댓글 부모 ID

    useEffect(() => {
        api.get(`/reviews/${id}`)
            .then(res => {
                setReview(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("후기 상세 정보를 불러오는 중 오류 발생:", err);
                setLoading(false);
            });
    }, [id]);

    // [함수] 댓글 제출 핸들러
    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        if (!user.isLoggedIn) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        try {
            await api.post(`/reviews/${id}/comments`, {
                userId: user.id,
                content: newComment,
                parentId: replyToId // 대댓글일 경우 부모 ID 포함
            });
            setNewComment("");
            setReplyToId(null);
            // 댓글 등록 후 새로고침
            const res = await api.get(`/reviews/${id}`);
            setReview(res.data);
        } catch (error) {
            alert("댓글 등록에 실패했습니다.");
        }
    };

    // [함수] 댓글 삭제 핸들러
    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        try {
            await api.delete(`/reviews/${id}/comments/${commentId}`, {
                params: { userId: user.id }
            });
            // 삭제 후 새로고침
            const res = await api.get(`/reviews/${id}`);
            setReview(res.data);
        } catch (error) {
            alert("댓글 삭제에 실패했습니다.");
        }
    };

    // [함수] 신고 제출 핸들러
    const handleReportSubmit = async () => {
        if (!reportDetail.trim()) {
            alert("상세 사유를 입력해주세요.");
            return;
        }

        const finalReason = `[${reportCategory}] ${reportDetail}`;

        try {
            await api.post('/reports', {
                reviewId: id,
                reporterId: user.id || 1,
                reason: finalReason
            });

            alert("신고가 정상적으로 접수되었습니다.");
            setIsReportModalOpen(false);
            setReportDetail("");
        } catch (error) {
            alert("신고 접수 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = () => {
        if (window.confirm("정말로 이 후기를 삭제하시겠습니까?")) {
            // 삭제 시 userId가 필요함 (백엔드 deleteReview 참고)
            api.delete(`/reviews/${id}`, { params: { userId: user.id } })
                .then(() => {
                    alert("삭제되었습니다.");
                    navigate('/reviews', { replace: true });
                })
                .catch(err => {
                    alert("삭제 중 오류가 발생했습니다: " + (err.response?.data?.message || err.message));
                });
        }
    };

    if (loading) return <div className="review-detail-layout"><p>로딩 중...</p></div>;

    if (!review) {
        return (
            <div className="error-wrap">
                <p>요청하신 후기가 존재하지 않거나 삭제되었습니다.</p>
                <button onClick={() => navigate('/reviews')}>목록으로 돌아가기</button>
            </div>
        );
    }

    const renderMixedContent = (content, images) => {
        if (!content) return null;
        const parts = content.split(/(\[IMAGE_\d+\])/g);
        const sortedImages = images ? [...images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

        return parts.map((part, index) => {
            const match = part.match(/\[IMAGE_(\d+)\]/);
            if (match) {
                const imgIdx = parseInt(match[1], 10) - 1;
                const imgObj = sortedImages[imgIdx];
                return imgObj ? (
                    <div key={`img-${index}`} className="gallery-card">
                        <div className="img-frame">
                            <img
                                src={imgObj.storedUrl}
                                alt={imgObj.originName}
                                className="fixed-height-img"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
                            />
                        </div>
                        <p className="img-name-tag">{imgObj.originName}</p>
                    </div>
                ) : null;
            }
            return <span key={`text-${index}`} className="content-text-part">{part}</span>;
        });
    };

    const renderStars = (num) => "★".repeat(num || 0) + "☆".repeat(5 - (num || 0));

    // [추가] 관리 권한 체크 (글 작성자이거나 관리자일 때)
    const canEditOrDelete = review.userId === user.id || user.role === 'admin';

    return (
        <div className="review-detail-layout">
            <header className="detail-nav-header">
                <button className="back-list-btn" onClick={() => navigate('/reviews')}>
                    ← 목록으로 돌아가기
                </button>
            </header>

            <article className="review-main-card">
                <div className="review-header">
                    <h1 className="review-title">{review.title}</h1>
                    <div className="review-meta">
                        <span className="meta-text">작성자: <strong>{review.authorAccountId}</strong></span>
                        <span className="meta-sep">|</span>
                        <span className="meta-text">날짜: {review.createdAt ? review.createdAt.split('T')[0] : ''}</span>
                        <span className="meta-sep">|</span>
                        <span className="meta-text">조회수: {review.viewCount?.toLocaleString() || 0}</span>
                    </div>

                    <div className="review-summary-row">
                        <div className="summary-item rating">
                            <span className="summary-label">평점</span>
                            <span className="summary-value star-gold">{renderStars(review.rating)}</span>
                        </div>

                        {/* 본인 또는 관리자일 때만 노출 */}
                        {canEditOrDelete && (
                            <div className="post-admin-actions">
                                <button className="text-action-btn" onClick={() => navigate(`/reviews/edit/${id}`)}>수정</button>
                                <span className="action-divider">|</span>
                                <button className="text-action-btn delete-color" onClick={handleDelete}>삭제</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="review-body">
                    <div className="content-mixed-area">
                        {renderMixedContent(review.content, review.images)}
                    </div>
                </div>

                <footer className="review-footer">
                    <button className="report-btn" onClick={() => setIsReportModalOpen(true)}>
                        🚨 이 게시글 신고하기
                    </button>
                </footer>
            </article>

            {/* 💬 댓글 섹션 추가 */}
            <section className="comment-section">
                <h3>댓글 {review.comments?.length || 0}</h3>

                <div className="comment-list">
                    {review.comments && review.comments.length > 0 ? (
                        review.comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.authorAccountId}</span>
                                    <span className="comment-date">{comment.createdAt ? comment.createdAt.split('T')[0] : ''}</span>
                                    <div className="comment-actions">
                                        <button className="comment-reply-btn" onClick={() => {
                                            setReplyToId(comment.id);
                                            document.querySelector('.comment-write textarea')?.focus();
                                        }}>답글</button>

                                        {/* 댓글 작성자 또는 관리자만 삭제 가능 */}
                                        {(comment.userId === user.id || user.role === 'admin') && (
                                            <button className="comment-delete-btn" onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                                        )}
                                    </div>
                                </div>
                                <p className="comment-content">{comment.content}</p>

                                {/* 답글(대댓글) 렌더링 */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="reply-list">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="reply-item">
                                                <div className="comment-header">
                                                    <span className="comment-author">↪ {reply.authorAccountId}</span>
                                                    <span className="comment-date">{reply.createdAt ? reply.createdAt.split('T')[0] : ''}</span>

                                                    {/* 답글 작성자 또는 관리자만 삭제 가능 */}
                                                    {(reply.userId === user.id || user.role === 'admin') && (
                                                        <button className="comment-delete-btn" onClick={() => handleCommentDelete(reply.id)}>삭제</button>
                                                    )}
                                                </div>
                                                <p className="comment-content">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="no-comment">첫 번째 댓글을 남겨보세요!</p>
                    )}
                </div>

                <div className="comment-write">
                    {replyToId && (
                        <div className="reply-indicator">
                            <span>답글 작성 중...</span>
                            <button onClick={() => setReplyToId(null)}>취소</button>
                        </div>
                    )}
                    <textarea
                        placeholder={replyToId ? "답글을 입력하세요..." : "댓글을 입력하세요..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="comment-submit-btn" onClick={handleCommentSubmit}>등록</button>
                </div>
            </section>

            {/* 🚩 신고 모달 UI */}
            {isReportModalOpen && (
                <div className="report-modal-overlay">
                    <div className="report-modal-content">
                        <h3>신고 사유 선택</h3>
                        <p className="modal-sub-text">부적절한 게시글을 신고해주세요.</p>

                        <div className="category-group">
                            <label><input type="radio" name="category" value="스팸/광고" checked={reportCategory === "스팸/광고"} onChange={(e) => setReportCategory(e.target.value)} /> 스팸/광고</label>
                            <label><input type="radio" name="category" value="욕설/비하" checked={reportCategory === "욕설/비하"} onChange={(e) => setReportCategory(e.target.value)} /> 욕설/비하</label>
                            <label><input type="radio" name="category" value="부적절한 콘텐츠" checked={reportCategory === "부적절한 콘텐츠"} onChange={(e) => setReportCategory(e.target.value)} /> 부적절한 콘텐츠</label>
                            <label><input type="radio" name="category" value="기타" checked={reportCategory === "기타"} onChange={(e) => setReportCategory(e.target.value)} /> 기타</label>
                        </div>

                        <textarea
                            className="report-textarea"
                            placeholder="상세 내용을 입력해 주세요 (필수)"
                            value={reportDetail}
                            onChange={(e) => setReportDetail(e.target.value)}
                        />

                        <div className="modal-action-btns">
                            <button className="cancel-btn" onClick={() => setIsReportModalOpen(false)}>취소</button>
                            <button className="submit-btn" onClick={handleReportSubmit}>신고 제출</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelReviewDetail;