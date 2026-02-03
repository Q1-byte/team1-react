    import React, { useState } from 'react';
    import './InquiryWrite.css';

    const InquiryForm = ({ onSave, currentUser }) => {
    const [formData, setFormData] = useState({
        type: 'SYSTEM',
        category: 'GENERAL',
        title: '',
        content: '',
        isSecret: true,
        images: [] // 업로드된 이미지 URL들
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 데이터 유효성 검사 후 저장 로직 실행
        if (formData.title.length < 5) return alert("제목을 5자 이상 입력해주세요.");
        onSave(formData); 
    };

    return (
        <div className="inquiry-form-container">
        <h2>1:1 문의하기</h2>
        <p className="form-desc">궁금하신 내용을 남겨주시면 영업일 기준 2~3일 내에 답변드립니다.</p>

        <form onSubmit={handleSubmit} className="inquiry-main-form">
            <div className="form-group row">
            <div className="field">
                <label>문의 유형</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                <option value="PAYMENT">결제 문의</option>
                <option value="RANDOM">랜덤박스 문의</option>
                <option value="SYSTEM">시스템 오류</option>
                </select>
            </div>
            <div className="field">
                <label>공개 설정</label>
                <div className="checkbox-wrapper">
                <input type="checkbox" name="isSecret" id="isSecret"
                        checked={formData.isSecret} onChange={handleChange} />
                <label htmlFor="isSecret">비밀글로 문의하기</label>
                </div>
            </div>
            </div>

            <div className="form-group">
            <label>제목</label>
            <input type="text" name="title" placeholder="제목을 입력해주세요" 
                    value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
            <label>내용</label>
            <textarea name="content" placeholder="내용을 상세히 입력해주세요" 
                        value={formData.content} onChange={handleChange} required />
            </div>

            {/* 이미지 업로드 영역 - 나중에 디테일하게 짤 부분 */}
            <div className="form-group image-section">
            <label>이미지 첨부 (최대 3장)</label>
            <div className="image-placeholder">
                <span>📷 클릭하여 이미지 추가</span>
            </div>
            </div>

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => window.history.back()}>취소</button>
            <button type="submit" className="submit-btn">문의 등록</button>
            </div>
        </form>
        </div>
    );
    };

    export default InquiryForm;