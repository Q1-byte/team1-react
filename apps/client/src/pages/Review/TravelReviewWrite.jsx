import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './TravelReviewWrite.css';

const TravelReviewWrite = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        userId: user?.id || 1,
        planId: null,
        title: '',
        content: '',
        rating: 5,
        isPublic: true,
    });

    const [uploadFiles, setUploadFiles] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newImages = files.map((file, idx) => ({
            file_obj: file,
            url: URL.createObjectURL(file),
            file_name: file.name,
            sort_order: uploadFiles.length + idx
        }));
        setUploadFiles(prev => [...prev, ...newImages]);
        // 같은 파일 재선택 허용을 위해 input 초기화
        e.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let uploadedImages = [];
            if (uploadFiles.length > 0) {
                const formDataUpload = new FormData();
                uploadFiles.forEach(img => {
                    formDataUpload.append('files', img.file_obj);
                });
                const uploadRes = await api.post('/files/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImages = uploadRes.data.map((resImg, idx) => ({
                    originName: resImg.originName,
                    storedUrl: resImg.storedUrl,
                    sortOrder: idx
                }));
            }

            const submitData = {
                title: formData.title,
                content: formData.content,
                userId: formData.userId,
                planId: formData.planId,
                rating: parseInt(formData.rating, 10),
                isPublic: formData.isPublic,
                images: uploadedImages
            };

            await api.post('/reviews', submitData);
            alert("리뷰가 성공적으로 등록되었습니다!");
            navigate('/reviews');
        } catch (error) {
            console.error("리뷰 등록 중 오류 발생:", error);
            alert("리뷰 등록에 실패했습니다. " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="write-container">
            <h1 className="write-title">여행 후기 작성하기</h1>

            <form className="write-form" onSubmit={handleSubmit}>
                {/* 제목 */}
                <div className="input-group">
                    <label>제목</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="여행의 제목을 입력하세요"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* 평점 */}
                <div className="input-row">
                    <div className="input-group flex-1">
                        <label>평점</label>
                        <select name="rating" value={formData.rating} onChange={handleChange}>
                            <option value="5">★★★★★ (5점)</option>
                            <option value="4">★★★★☆ (4점)</option>
                            <option value="3">★★★☆☆ (3점)</option>
                            <option value="2">★★☆☆☆ (2점)</option>
                            <option value="1">★☆☆☆☆ (1점)</option>
                        </select>
                    </div>
                </div>

                {/* 본문 */}
                <div className="input-group">
                    <label>여행 이야기</label>
                    <textarea
                        name="content"
                        placeholder="여행에서 겪은 이야기를 자유롭게 작성해 주세요."
                        value={formData.content}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* 이미지 첨부 */}
                <div className="input-group image-upload-section">
                    <label>사진 첨부</label>
                    <label className="file-upload-btn">
                        + 사진 추가
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                    </label>

                    {uploadFiles.length > 0 && (
                        <div className="image-preview-container">
                            {uploadFiles.map((image, index) => (
                                <div key={index} className="preview-card">
                                    <button
                                        type="button"
                                        className="delete-preview-btn"
                                        onClick={() => handleRemoveFile(index)}
                                    >×</button>
                                    <img
                                        src={image.url}
                                        alt={image.file_name}
                                        className="preview-item"
                                    />
                                    <span className="preview-filename">{image.file_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <span className="helper-text">* 최대 여러 장 첨부 가능 · 사진은 본문 하단에 표시됩니다.</span>
                </div>

                {/* 공개 여부 */}
                <div className="public-setting-area">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={handleChange}
                        />
                        <span className="checkbox-text">이 후기를 전체 공개로 등록합니다.</span>
                    </label>
                </div>

                {/* 액션 버튼 */}
                <div className="write-btns">
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>취소</button>
                    <button type="submit" className="submit-btn">등록하기</button>
                </div>
            </form>
        </div>
    );
};

export default TravelReviewWrite;
