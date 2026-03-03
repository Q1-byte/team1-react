import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './TravelReviewDetail.css';

// 외부 플레이스홀더 서비스 대신 로컬 SVG 사용
const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23aaa' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage Not Found%3C/text%3E%3C/svg%3E";

const TravelReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const hasFetched = useRef(false); // React StrictMode 2회 호출 방지

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🚩 신고 모달 관련 상태
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportCategory, setReportCategory] = useState("스팸/광고");
    const [reportDetail, setReportDetail] = useState("");

    // 💬 댓글 관련 상태
    const [newComment, setNewComment] = useState("");
    const [replyToId, setReplyToId] = useState(null);

    useEffect(() => {
        // StrictMode에서 2번 실행되어 조회수가 2씩 오르는 문제 방지
        if (hasFetched.current) return;
        hasFetched.current = true;

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

    // 댓글/답글 등록·삭제 후 화면만 갱신 (조회수 증가 없이 댓글만 업데이트)
    const refreshComments = async () => {
        const res = await api.get(`/reviews/${id}`);
        setReview(res.data);
    };

    // [함수] 댓글 제출 핸들러
    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        try {
            await api.post(`/reviews/${id}/comments`, {
                userId: user.id,
                content: newComment,
                parentId: replyToId
            });
            setNewComment("");
            setReplyToId(null);
            await refreshComments();
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
            await refreshComments();
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

    // 비공개 리뷰: 작성자 본인 또는 관리자가 아니면 접근 차단
    if (review.isPublic !== true && !(user && (review.userId === user.id || user.role === 'ADMIN'))) {
        return (
            <div className="error-wrap">
                <p>비공개 후기입니다.</p>
                <button onClick={() => navigate('/reviews')}>목록으로 돌아가기</button>
            </div>
        );
    }

    // 본문 텍스트 렌더링: [IMAGE_N] 태그 제거 후 줄바꿈 처리
    const renderContent = (content) => {
        if (!content) return null;
        const cleanText = content.replace(/\[IMAGE_\d+\]/g, '').trim();
        return cleanText.split('\n').map((line, i) => (
            <p key={i} className="content-line">{line || '\u00A0'}</p>
        ));
    };

    // 첨부 이미지 갤러리 렌더링
    const renderImageGallery = (images) => {
        if (!images || images.length === 0) return null;
        const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        return (
            <div className="attachment-gallery">
                {sorted.map((img, i) => (
                    <div key={i} className="attachment-item">
                        <img
                            src={img.storedUrl}
                            alt={img.originName || `이미지 ${i + 1}`}
                            onError={(e) => { e.target.src = NO_IMG; }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderStars = (num) => "★".repeat(num || 0) + "☆".repeat(5 - (num || 0));

    const canEditOrDelete = user && (review.userId === user.id || user.role === 'ADMIN');

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
                    {/* 본문 텍스트 */}
                    <div className="content-text-area">
                        {renderContent(review.content)}
                    </div>
                    {/* 첨부 이미지 갤러리 */}
                    {review.images && review.images.length > 0 && (
                        <div className="content-attachments">
                            <p className="attachment-label">첨부 이미지 ({review.images.length}장)</p>
                            {renderImageGallery(review.images)}
                        </div>
                    )}
                </div>

                <footer className="review-footer">
                    <button className="report-btn" onClick={() => setIsReportModalOpen(true)}>
                        🚨 이 게시글 신고하기
                    </button>
                </footer>
            </article>

            {/* 💬 댓글 섹션 */}
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

                                        {user && (comment.userId === user.id || user.role === 'admin') && (
                                            <button className="comment-delete-btn" onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                                        )}
                                    </div>
                                </div>
                                <p className="comment-content">{comment.content}</p>

                                {comment.children && comment.children.length > 0 && (
                                    <div className="reply-list">
                                        {comment.children.map((reply) => (
                                            <div key={reply.id} className="reply-item">
                                                <div className="comment-header">
                                                    <span className="comment-author">↪ {reply.authorAccountId}</span>
                                                    <span className="comment-date">{reply.createdAt ? reply.createdAt.split('T')[0] : ''}</span>

                                                    {user && (reply.userId === user.id || user.role === 'admin') && (
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
                        placeholder={user ? (replyToId ? "답글을 입력하세요..." : "댓글을 입력하세요...") : "로그인 후 댓글을 작성할 수 있습니다."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user}
                    />
                    <button className="comment-submit-btn" onClick={handleCommentSubmit} disabled={!user}>등록</button>
                </div>
            </section>

            {/* 🚩 신고 모달 */}
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
