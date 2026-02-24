import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './TravelReviewWrite.css';

const TravelReviewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        userId: user?.id,
        title: '',
        content: '',
        rating: 5,
        isPublic: true
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/reviews/${id}`)
            .then(res => {
                const data = res.data; // 버그 수정: 이전에는 data가 선언되지 않았음
                if (data.userId !== user?.id && user?.role !== 'admin') {
                    alert("본인이 작성한 글만 수정할 수 있습니다.");
                    navigate('/reviews');
                    return;
                }
                setFormData({
                    userId: data.userId,
                    title: data.title,
                    content: data.content,
                    rating: data.rating,
                    isPublic: data.isPublic ?? true
                });
                setImages(data.images || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("기존 후기 정보를 불러오는 중 오류 발생:", err);
                setLoading(false);
            });
    }, [id, user, navigate]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file, index) => ({
            originName: file.name,
            storedUrl: URL.createObjectURL(file),
            sortOrder: images.length + index,
            file: file
        }));
        setImages(prev => [...prev, ...newImages]);
        e.target.value = '';
    };

    const handleRemoveImage = (index) => {
        if (!window.confirm("이미지를 삭제하시겠습니까?")) return;
        setImages(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const existingImages = images.filter(img => !img.file);
            const newFileImages = images.filter(img => img.file);

            let newlyUploadedImages = [];
            if (newFileImages.length > 0) {
                const formDataUpload = new FormData();
                newFileImages.forEach(img => formDataUpload.append('files', img.file));
                const uploadRes = await api.post('/files/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                newlyUploadedImages = uploadRes.data;
            }

            const finalImages = [
                ...existingImages.map(img => ({ originName: img.originName, storedUrl: img.storedUrl })),
                ...newlyUploadedImages.map(img => ({ originName: img.originName, storedUrl: img.storedUrl }))
            ].map((img, idx) => ({ ...img, sortOrder: idx }));

            const updateDto = {
                userId: formData.userId,
                title: formData.title,
                content: formData.content,
                rating: formData.rating,
                isPublic: formData.isPublic,
                images: finalImages
            };

            await api.put(`/reviews/${id}`, updateDto);
            alert("수정이 완료되었습니다!");
            navigate(`/reviews/${id}`, { replace: true });
        } catch (err) {
            console.error("수정 중 오류 발생:", err);
            alert("수정 실패: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="write-container"><p>로딩 중...</p></div>;

    return (
        <div className="write-container">
            <h2 className="write-title">여행 후기 수정</h2>

            <form className="write-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>제목</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </div>

                <div className="input-row">
                    <div className="input-group flex-1">
                        <label>평점</label>
                        <select
                            className="rating-select"
                            value={formData.rating}
                            onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        >
                            {[5, 4, 3, 2, 1].map(n => (
                                <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n}점)</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group" style={{ marginTop: '10px' }}>
                    <label>본문 내용</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="여행 이야기를 작성해 주세요."
                        required
                    />
                </div>

                {/* 이미지 첨부 */}
                <div className="input-group image-upload-section">
                    <label>사진 첨부</label>
                    <label className="file-upload-btn">
                        + 사진 추가
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>

                    {images.length > 0 && (
                        <div className="image-preview-container">
                            {images.map((img, index) => (
                                <div key={index} className="preview-card">
                                    <button type="button" className="delete-preview-btn" onClick={() => handleRemoveImage(index)}>×</button>
                                    <img src={img.storedUrl} className="preview-item" alt={img.originName || 'preview'} />
                                    <span className="preview-filename">{img.originName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <span className="helper-text">* 사진은 본문 하단에 표시됩니다.</span>
                </div>

                <div className="public-setting-area">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        />
                        <span className="checkbox-text">이 후기를 공개로 설정합니다.</span>
                    </label>
                </div>

                <div className="write-btns">
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>취소</button>
                    <button type="submit" className="submit-btn">수정 완료</button>
                </div>
            </form>
        </div>
    );
};

export default TravelReviewEdit;
