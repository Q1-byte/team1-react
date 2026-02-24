    import api from './axiosConfig';

    // Mock 데이터 사용 여부 (백엔드 연결 전 테스트용)
    const USE_MOCK = false;

    // Mock 데이터
    const MOCK_DATA = {
    user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '010-1234-5678',
        role: 'USER',
        keywordPref: '힐링,맛집,자연',
        point: 5000,
        createdAt: '2025-01-15T10:30:00'
    },
    recentViewedPlans: [
    {
        id: 1,
        planId: 10,
        viewedAt: '2025-02-04T14:20:00',
        plan: {
        id: 10,
        type: '일반',
        title: '제주도 2박3일',
        regionId: 5,
        keyword: '힐링,자연',
        difficulty: '쉬움',
        peopleCount: 2,
        budgetMin: 300000,
        budgetMax: 500000,
        travelDate: '2025-03-01',
        durationDays: 3,
        totalPrice: 450000,
        status: 'READY',
        createdAt: '2025-01-20T09:00:00'
        }
    },
    {
        id: 2,
        planId: 11,
        viewedAt: '2025-02-03T10:15:00',
        plan: {
        id: 11,
        type: '프리미엄',
        title: '부산 당일치기',
        regionId: 3,
        keyword: '맛집,사진',
        difficulty: '보통',
        peopleCount: 4,
        budgetMin: 100000,
        budgetMax: 200000,
        travelDate: '2025-02-20',
        durationDays: 1,
        totalPrice: 150000,
        status: 'PAID',
        createdAt: '2025-01-18T11:30:00'
        }
    }
    ],
    plans: [
    {
        id: 10,
        type: '일반',
        title: '제주도 2박3일',
        regionId: 5,
        keyword: '힐링,자연',
        difficulty: '쉬움',
        peopleCount: 2,
        budgetMin: 300000,
        budgetMax: 500000,
        travelDate: '2025-03-01',
        durationDays: 3,
        totalPrice: 450000,
        status: 'READY',
        createdAt: '2025-01-20T09:00:00'
    },
    {
        id: 11,
        type: '프리미엄',
        title: '부산 당일치기',
        regionId: 3,
        keyword: '맛집,사진',
        difficulty: '보통',
        peopleCount: 4,
        budgetMin: 100000,
        budgetMax: 200000,
        travelDate: '2025-02-20',
        durationDays: 1,
        totalPrice: 150000,
        status: 'PAID',
        createdAt: '2025-01-18T11:30:00'
    },
    {
        id: 12,
        type: '일반',
        title: '서울 한강 나들이',
        regionId: 1,
        keyword: '힐링,카페',
        difficulty: '쉬움',
        peopleCount: 2,
        budgetMin: 50000,
        budgetMax: 100000,
        travelDate: '2025-01-10',
        durationDays: 1,
        totalPrice: 75000,
        status: 'DONE',
        createdAt: '2025-01-05T08:00:00'
    }
    ],
    points: [
    {
        id: 1,
        amount: 1000,
        type: '적립',
        description: '회원가입 축하 포인트',
        createdAt: '2025-01-15T10:30:00'
    },
    {
        id: 2,
        amount: 500,
        type: '후기',
        description: '여행 후기 작성 보상',
        createdAt: '2025-01-25T14:00:00'
    },
    {
        id: 3,
        amount: -500,
        type: '사용',
        description: '부산 여행 결제 시 사용',
        createdAt: '2025-01-20T15:00:00'
    },
    {
        id: 4,
        amount: 2000,
        type: '이벤트',
        description: '신년 이벤트 포인트 지급',
        createdAt: '2025-01-01T00:00:00'
    }
    ]
    };

    /**
     * 마이페이지 메인 조회
     * GET /api/mypage
     * - 회원정보 + 최근 본 계획 3개
     */
    export const getMyPageMain = async () => {
    if (USE_MOCK) {
    // Mock 응답
    return {
        success: true,
        code: 200,
        message: '성공',
        data: {
        user: MOCK_DATA.user,
        recentViewedPlans: MOCK_DATA.recentViewedPlans.slice(0, 3)
        }
    };
    }

    const response = await api.get('/api/mypage');
    return response.data;
    };

    /**
     * 내 여행 계획 목록 조회
     * GET /api/mypage/plans
     */
    export const getMyPlans = async () => {
    if (USE_MOCK) {
    return {
        success: true,
        code: 200,
        message: '성공',
        data: MOCK_DATA.plans
    };
    }

    const response = await api.get('/api/mypage/plans');
    return response.data;
    };

    /**
     * 포인트 내역 조회
     * GET /api/mypage/points
     */
    export const getMyPoints = async () => {
    if (USE_MOCK) {
    return {
        success: true,
        code: 200,
        message: '성공',
        data: MOCK_DATA.points
    };
    }

    const response = await api.get('/api/mypage/points');
    return response.data;
    };

    /**
     * 프로필 수정
     * PUT /api/mypage/profile
     * @param {Object} profileData - { phone, keywordPref }
     */
    export const updateProfile = async (profileData) => {
    if (USE_MOCK) {
    // Mock: 데이터 업데이트 시뮬레이션
    const updatedUser = {
        ...MOCK_DATA.user,
        phone: profileData.phone,
        keywordPref: profileData.keywordPref
    };
    MOCK_DATA.user = updatedUser;

    return {
        success: true,
        code: 200,
        message: '프로필이 수정되었습니다.',
        data: updatedUser
    };
    }

    const response = await api.put('/api/mypage/profile', {
        phone: profileData.phone,
        keywordPref: profileData.keywordPref,
        nickname: profileData.nickname
    });
    return response.data;
    };

    /**
     * 비밀번호 변경
     * PUT /api/mypage/password
     * @param {Object} passwordData - { currentPassword, newPassword }
     */
    export const changePassword = async (passwordData) => {
    if (USE_MOCK) {
    // Mock: 현재 비밀번호 체크 시뮬레이션
    if (passwordData.currentPassword !== 'test123') {
        return {
        success: false,
        code: 400,
        message: '현재 비밀번호가 일치하지 않습니다.',
        data: null
        };
    }

    return {
        success: true,
        code: 200,
        message: '비밀번호가 변경되었습니다.',
        data: null
    };
    }

    const response = await api.put('/api/mypage/password', passwordData);
    return response.data;
    };

    /**
     * 신규 회원 웰컴 포인트 지급 (1회 한정)
     * POST /api/user/welcome-bonus
     */
    export const claimWelcomeBonus = async () => {
        const response = await api.post('/api/user/welcome-bonus');
        return response.data;
    };

    export default {
    getMyPageMain,
    getMyPlans,
    getMyPoints,
    updateProfile,
    changePassword,
    claimWelcomeBonus
    };
