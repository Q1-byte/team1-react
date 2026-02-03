// Mock API - 나중에 실제 백엔드 API로 교체

// Mock 사용자 데이터 (localStorage에 저장)
const USERS_KEY = 'mock_users';

// 초기 Mock 사용자 데이터
const initMockUsers = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@trip.com',
        phone: '010-1234-5678',
        role: 'ADMIN',
        keyword_pref: '힐링,맛집,자연',
        point: 5000,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user1',
        password: 'user123',
        email: 'user1@trip.com',
        phone: '010-9876-5432',
        role: 'USER',
        keyword_pref: '액티비티,체험,축제',
        point: 1000,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
};

// Mock 지연 함수 (실제 API 호출처럼 보이게)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 사용자 목록 가져오기
const getUsers = () => {
  initMockUsers();
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// 사용자 저장하기
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * 로그인 API
 */
export const loginApi = async (username, password) => {
  await delay();

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    throw new Error('존재하지 않는 아이디입니다.');
  }

  if (user.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  // 비밀번호 제외하고 반환
  const { password: _, ...userWithoutPassword } = user;

  // Mock JWT 토큰
  const token = btoa(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
  }));

  return {
    user: userWithoutPassword,
    token
  };
};

/**
 * 회원가입 API
 */
export const registerApi = async (userData) => {
  await delay();

  const users = getUsers();

  // 중복 체크
  if (users.find(u => u.username === userData.username)) {
    throw new Error('이미 존재하는 아이디입니다.');
  }

  if (users.find(u => u.email === userData.email)) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  // 새 사용자 생성
  const newUser = {
    id: users.length + 1,
    ...userData,
    role: 'USER',
    point: 0,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // 비밀번호 제외하고 반환
  const { password, ...userWithoutPassword } = newUser;

  return {
    user: userWithoutPassword,
    message: '회원가입이 완료되었습니다.'
  };
};

/**
 * 토큰으로 사용자 정보 조회 (자동 로그인용)
 */
export const getUserByTokenApi = async (token) => {
  await delay(200);

  try {
    const decoded = JSON.parse(atob(token));

    // 토큰 만료 체크
    if (decoded.exp < Date.now()) {
      throw new Error('토큰이 만료되었습니다.');
    }

    const users = getUsers();
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
};
