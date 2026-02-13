// 백엔드 API 연동

const API_BASE_URL = 'http://localhost:8080/api/user';

// 백엔드 연결 여부 (false면 임시 데이터 사용)
const USE_MOCK = false;

// 임시 사용자 데이터 (테스트용)
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@test.com',
    phone: '010-1234-5678',
    role: 'ADMIN',
    point: 10000,
    keywordPref: '힐링,맛집,문화예술'
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    email: 'user1@test.com',
    phone: '010-2222-3333',
    role: 'USER',
    point: 5000,
    keywordPref: '액티비티,자연,사진'
  },
  {
    id: 3,
    username: 'test',
    password: 'test123',
    email: 'test@test.com',
    phone: '010-9999-8888',
    role: 'USER',
    point: 3000,
    keywordPref: '카페,쇼핑'
  }
];

// localStorage에 mock_users 초기화
const initMockUsers = () => {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
  }
};
initMockUsers();

/**
 * 로그인 API
 */
export const loginApi = async (username, password) => {
  // 임시 데이터 사용 시
  if (USE_MOCK) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 제외한 사용자 정보
    const { password: _, ...userWithoutPassword } = user;

    const token = btoa(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000
    }));

    return { user: userWithoutPassword, token };
  }

  // 백엔드 API 사용 시
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // 세션 쿠키 저장/전송을 위해 필수
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || '로그인에 실패했습니다.');
  }

  const user = result.data;

  // 임시 토큰 생성 (나중에 백엔드 JWT로 교체)
  const token = btoa(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
  }));

  return {
    user,
    token
  };
};

/**
 * 회원가입 API
 */
export const registerApi = async (userData) => {
  // 임시 데이터 사용 시
  if (USE_MOCK) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    // 아이디 중복 체크
    if (users.find(u => u.username === userData.username)) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }
    
    // 이메일 중복 체크
    if (users.find(u => u.email === userData.email)) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const newUser = {
      id: users.length + 1,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      phone: userData.phone || '',
      role: 'USER',
      point: 1000, // 신규 가입 포인트
      keywordPref: userData.keyword_pref || userData.keywordPref || ''
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, message: '회원가입이 완료되었습니다.' };
  }

  // 백엔드 API 사용 시
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      username: userData.username,
      nickname: userData.nickname,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm || userData.password_confirm || userData.password,
      email: userData.email,
      phone: userData.phone,
      keywordPref: userData.keyword_pref || userData.keywordPref,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || '회원가입에 실패했습니다.');
  }

  return {
    user: result.data,
    message: result.message
  };
};

/**
 * 토큰으로 사용자 정보 조회 (자동 로그인용)
 */
export const getUserByTokenApi = async (token) => {
  try {
    const decoded = JSON.parse(atob(token));

    // 토큰 만료 체크
    if (decoded.exp < Date.now()) {
      throw new Error('토큰이 만료되었습니다.');
    }

    // 임시 데이터 사용 시
    if (USE_MOCK) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    // 백엔드에서 사용자 정보 조회
    const response = await fetch(`${API_BASE_URL}/${decoded.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '사용자 정보를 가져올 수 없습니다.');
    }

    return result.data;
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
};

/**
 * 아이디 중복 체크 API
 */
export const checkUsernameApi = async (username) => {
  if (USE_MOCK) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.some(u => u.username === username);
  }

  const response = await fetch(`${API_BASE_URL}/check-username?username=${encodeURIComponent(username)}`);
  const result = await response.json();
  return result.data;
};

/**
 * 이메일 중복 체크 API
 */
export const checkEmailApi = async (email) => {
  if (USE_MOCK) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.some(u => u.email === email);
  }

  const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`);
  const result = await response.json();
  return result.data;
};
