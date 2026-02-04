// 백엔드 API 연동

const API_BASE_URL = 'http://localhost:8080/api/user';

/**
 * 로그인 API
 */
export const loginApi = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.username,
      password: userData.password,
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

    // 백엔드에서 사용자 정보 조회
    const response = await fetch(`${API_BASE_URL}/${decoded.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
  const response = await fetch(`${API_BASE_URL}/check-username?username=${encodeURIComponent(username)}`);
  const result = await response.json();
  return result.data; // true면 중복, false면 사용 가능
};

/**
 * 이메일 중복 체크 API
 */
export const checkEmailApi = async (email) => {
  const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`);
  const result = await response.json();
  return result.data; // true면 중복, false면 사용 가능
};
