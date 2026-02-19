import api from './axiosConfig';

const BASE = '/api/admin/payments';

export const getPayments = (page = 0, size = 10, status = '') => {
    const params = { page, size, sort: 'approvedAt,desc' };
    if (status) params.status = status;
    return api.get(BASE, { params }).then(r => r.data);
};

export const cancelPayment = (id) =>
    api.patch(`${BASE}/${id}/cancel`).then(r => r.data);
