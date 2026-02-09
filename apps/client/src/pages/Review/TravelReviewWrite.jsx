import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './TravelReviewWrite.css';

const TravelReviewWrite = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // 1. [요구조건: DB 테이블 대조] 명세서의 모든 컬럼을 상태값으로 관리
    const [formData, setFormData] = useState({
        userId: user.id || 1, // AuthContext의 실제 유저 ID 사용
        planId: 501,          // DB: plan_id (BigInt)
        title: '',             // DB: title (Varchar)
        content: '',           // DB: content (Text)
        rating: 5,             // DB: rating (Int)
        isRandom: false,      // DB: is_random (Boolean)
        isPublic: true,       // DB: is_public (Boolean)
        isDeleted: false,     // DB: is_deleted (Boolean)
        view_count: 0          // DB: view_count (Int)
    });

    // 2. [요구조건: 지워진 기능 복구] 이미지 객체 배열 (파일+미리보기+DB용 메타데이터)
    const [uploadFiles, setUploadFiles] = useState([]);

    // 입력 핸들러 (속성별 개행 준수)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // [요구조건: 테이블 대조] 이미지 처리 시 sort_order 및 file_name 유지
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map((file, idx) => ({
            file_obj: file,
            url: URL.createObjectURL(file),
            file_name: file.name,
            sort_order: uploadFiles.length + idx // DB 저장 시 필요한 순서값
        }));

        setUploadFiles(prev => [...prev, ...newImages]);
    };

    // [요구조건: 블로그형 믹스] 본문 내 특정 위치에 이미지 태그 삽입
    const insertImageTag = (index) => {
        const tag = `\n[IMAGE_${index + 1}]\n`;
        setFormData(prev => ({
            ...prev,
            content: prev.content + tag
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. 이미지 파일이 있으면 먼저 서버에 업로드하여 영구 URL 획득
            let uploadedImages = [];
            if (uploadFiles.length > 0) {
                const formDataUpload = new FormData();
                uploadFiles.forEach(img => {
                    formDataUpload.append('files', img.file_obj);
                });

                // FileController의 /api/files/upload 호출
                const uploadRes = await api.post('/files/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // 서버에서 반환한 [ {originName, storedUrl}, ... ] 정보 매핑
                uploadedImages = uploadRes.data.map((resImg, idx) => ({
                    originName: resImg.originName,
                    storedUrl: resImg.storedUrl, // 서버에서 생성된 영구 URL
                    sortOrder: idx
                }));
            }

            // 2. 백엔드 ReviewSaveRequestDto 형식에 맞게 최종 데이터 조립
            const submitData = {
                title: formData.title,
                content: formData.content,
                userId: formData.userId,
                planId: formData.planId,
                rating: parseInt(formData.rating, 10),
                isPublic: formData.isPublic,
                images: uploadedImages
            };

            const response = await api.post('/reviews', submitData);
            console.log("DB 전송 결과:", response.data);
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

                {/* 평점 & 난이도 가로 배치 */}
                <div className="input-row">
                    <div className="input-group flex-1">
                        <label>평점</label>
                        <select name="rating" value={formData.rating} onChange={handleChange}>
                            <option value="5">★★★★★</option>
                            <option value="4">★★★★☆</option>
                            <option value="3">★★★☆☆</option>
                            <option value="2">★★☆☆☆</option>
                            <option value="1">★☆☆☆☆</option>
                        </select>
                    </div>

                </div>

                {/* 본문 (태그 삽입 위치) */}
                <div className="input-group">
                    <label>여행 이야기</label>
                    <textarea
                        name="content"
                        placeholder="내용을 작성하고 아래 사진의 '본문에 삽입' 버튼을 눌러보세요."
                        value={formData.content}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* 이미지 업로드 영역 (모든 요구 조건 통합) */}
                <div className="input-group image-upload-section">
                    <label>이미지 첨부 (다중 선택 가능)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="file-input"
                        onChange={handleImageChange}
                    />

                    <div className="image-preview-container">
                        {uploadFiles.map((image, index) => (
                            <div key={index} className="preview-card">
                                <img
                                    src={image.url}
                                    alt={image.file_name}
                                    className="preview-item"
                                />
                                <button
                                    type="button"
                                    className="insert-tag-btn"
                                    onClick={() => insertImageTag(index)}
                                >
                                    본문에 삽입
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* 사용자님이 강조하신 헬퍼 텍스트 */}
                    <span className="helper-text">
                        * 사진을 업로드한 후 '본문에 삽입' 버튼을 누르면 원하는 위치에 사진을 배치할 수 있습니다.
                    </span>
                </div>

                {/* 공개 여부 설정 */}
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