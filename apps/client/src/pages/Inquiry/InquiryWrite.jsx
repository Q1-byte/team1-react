import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCategoriesApi, createInquiryApi } from '../../api/inquiryApi';
import './InquiryWrite.css';

const InquiryWrite = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        content: '',
        isSecret: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/inquiry/write' } });
            return;
        }
        fetchCategories();
    }, [isAuthenticated]);

    const fetchCategories = async () => {
        try {
            const data = await getCategoriesApi();
            setCategories(data || []);
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, category: data[0].code }));
            }
        } catch (err) {
            console.error('카테고리 로딩 실패:', err);
            // 기본 카테고리 설정
            setCategories([
                { code: 'ACCOUNT', name: '계정/회원' },
                { code: 'PAYMENT', name: '결제/환불' },
                { code: 'TECHNICAL', name: '기술지원' },
                { code: 'SERVICE', name: '서비스 이용' },
                { code: 'ETC', name: '기타' }
            ]);
            setFormData(prev => ({ ...prev, category: 'ACCOUNT' }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (formData.title.length < 5) {
            setError('제목을 5자 이상 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            await createInquiryApi(formData);
            alert('문의가 등록되었습니다.');
            navigate('/inquiry');
        } catch (err) {
            console.error('문의 등록 실패:', err);
            setError(err.response?.data?.message || '문의 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inquiry-form-container">
            <h2>1:1 문의하기</h2>
            <p className="form-desc">궁금하신 내용을 남겨주시면 영업일 기준 2~3일 내에 답변드립니다.</p>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="inquiry-main-form">
                <div className="form-group row">
                    <div className="field">
                        <label>문의 유형</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            {categories.map(cat => (
                                <option key={cat.code} value={cat.code}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>공개 설정</label>
                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="isSecret"
                                id="isSecret"
                                checked={formData.isSecret}
                                onChange={handleChange}
                            />
                            <label htmlFor="isSecret">비밀글로 문의하기</label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>제목</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="제목을 입력해주세요 (5자 이상)"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>내용</label>
                    <textarea
                        name="content"
                        placeholder="내용을 상세히 입력해주세요"
                        value={formData.content}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? '등록 중...' : '문의 등록'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InquiryWrite;
