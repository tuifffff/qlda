import { axiosClient } from './axiosClient.js';

/**
 * bannerApi — gọi đến /api/banner
 */
export const bannerApi = {
  /** Lấy danh sách banner đang active */
  getActive: () => axiosClient.get('/api/banner/active'),
};
