## Getting Started

> 아래 명령어들을 순서대로 실행하면 로컬 개발 환경이 준비됩니다.

### 1. Install dependencies
```bash
pnpm install
```

### 2. Run development server
```bash
pnpm dev

pnpm dev:client

pnpm dev:all
```

---

## 🔌 API 연동 가이드

### 핵심 규칙 (꼭 읽어주세요!)

```javascript
// ❌ 절대 이렇게 하지 마세요
import axios from 'axios';
axios.get('http://localhost:8080/api/...');

// ✅ 반드시 이렇게 하세요
import api from '../api/axiosConfig';
api.get('/api/...');
```

**왜?** → `axiosConfig.js`에 세션 쿠키 설정이 되어 있어요. 안 쓰면 **401 에러** 납니다!

---

### 📁 파일 구조

```
src/api/
├── axiosConfig.js   ← axios 설정 (건드리지 마세요)
├── mypageApi.js     ← 마이페이지 API
├── authApi.js       ← 로그인/회원가입 API
└── xxxApi.js        ← 새로 만들 API 파일
```

---

### 🛠 새 API 만드는 법

#### 1단계: API 파일 만들기

```javascript
// 📁 src/api/reviewApi.js (예시)

import api from './axiosConfig';

// 목록 조회
export const getReviews = async () => {
  const response = await api.get('/api/reviews');
  return response.data;
};

// 상세 조회
export const getReviewDetail = async (id) => {
  const response = await api.get(`/api/reviews/${id}`);
  return response.data;
};

// 생성
export const createReview = async (data) => {
  const response = await api.post('/api/reviews', data);
  return response.data;
};

// 수정
export const updateReview = async (id, data) => {
  const response = await api.put(`/api/reviews/${id}`, data);
  return response.data;
};

// 삭제
export const deleteReview = async (id) => {
  const response = await api.delete(`/api/reviews/${id}`);
  return response.data;
};
```

#### 2단계: 컴포넌트에서 사용하기

```jsx
// 📁 src/pages/review/ReviewList.jsx

import { useState, useEffect } from 'react';
import { getReviews } from '../../api/reviewApi';

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getReviews();
        if (response.success) {
          setReviews(response.data);
        }
      } catch (err) {
        console.error('에러:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>{review.title}</div>
      ))}
    </div>
  );
}
```

---

### 📋 백엔드 응답 형식

모든 API는 이 형식으로 응답합니다:

```json
{
  "success": true,
  "code": 200,
  "message": "성공",
  "data": { ... }
}
```

프론트에서 사용할 때:
```javascript
const response = await api.get('/api/xxx');

if (response.data.success) {
  const 실제데이터 = response.data.data;  // 여기에 진짜 데이터!
}
```

---

### ⚠️ 자주 하는 실수

| 증상 | 원인 | 해결법 |
|-----|-----|-------|
| 401 에러 | axios 직접 사용 | `axiosConfig.js` import |
| CORS 에러 | 백엔드 설정 누락 | 백엔드 팀에 문의 |
| 데이터 안 나옴 | `response.data.data` 안 씀 | data 두 번 접근 |
| 무한 렌더링 | useEffect 의존성 문제 | `[]` 빈 배열 확인 |

---

### 🔗 현재 구현된 API

| 파일 | 엔드포인트 | 설명 |
|-----|-----------|------|
| mypageApi.js | GET /api/mypage | 마이페이지 메인 |
| | GET /api/mypage/plans | 내 여행 계획 |
| | GET /api/mypage/points | 포인트 내역 |
| | PUT /api/mypage/profile | 프로필 수정 |
| | PUT /api/mypage/password | 비밀번호 변경 |

---
