import api from './axiosConfig';

// 카테고리 목록 조회
export const getCategoriesApi = async () => {
  const response = await api.get('/api/inquiries/categories');
  return response.data.data;
};

// 내 문의 목록 조회
export const getMyInquiriesApi = async (page = 0, size = 10) => {
  const response = await api.get('/api/inquiries/my', {
    params: { page, size }
  });
  return response.data.data;
};

// 문의 상세 조회
export const getInquiryApi = async (id) => {
  const response = await api.get(`/api/inquiries/${id}`);
  return response.data.data;
};

// 문의 등록
export const createInquiryApi = async (inquiryData) => {
  const response = await api.post('/api/inquiries', inquiryData);
  return response.data.data;
};

// 문의 삭제
export const deleteInquiryApi = async (id) => {
  const response = await api.delete(`/api/inquiries/${id}`);
  return response.data;
};

// ==================== 관리자용 ====================

// 전체 문의 목록 조회 (관리자)
export const getAdminInquiriesApi = async (page = 0, size = 10, status = '') => {
  const params = { page, size };
  if (status) params.status = status;

  const response = await api.get('/api/admin/inquiries', { params });
  return response.data.data;
};

// 문의 상세 조회 (관리자)
export const getAdminInquiryApi = async (id) => {
  const response = await api.get(`/api/admin/inquiries/${id}`);
  return response.data.data;
};

// 답변 등록 (관리자)
export const answerInquiryApi = async (id, answer) => {
  const response = await api.patch(`/api/admin/inquiries/${id}/answer`, { answer });
  return response.data;
};

// 문의 삭제 (관리자)
export const deleteAdminInquiryApi = async (id) => {
  const response = await api.delete(`/api/admin/inquiries/${id}`);
  return response.data;
};

// 답변 대기 문의 수 (관리자)
export const getWaitingCountApi = async () => {
  const response = await api.get('/api/admin/inquiries/waiting-count');
  return response.data.data;
};

// 검색 (관리자)
export const searchInquiriesApi = async (keyword, page = 0, size = 10) => {
  const response = await api.get('/api/admin/inquiries/search', {
    params: { keyword, page, size }
  });
  return response.data.data;
};
