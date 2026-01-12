import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const contractsAPI = {
  /**
   * Upload a contract file
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload response
   */
  uploadContract: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/contracts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      },
    });
  },

  /**
   * Get list of contracts with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} List of contracts
   */
  getContracts: (params = {}) => {
    return apiClient.get('/contracts/', { params });
  },

  /**
   * Get a specific contract with analysis
   * @param {string} contractId - Contract ID
   * @returns {Promise} Contract details
   */
  getContract: (contractId) => {
    return apiClient.get(`/contracts/${contractId}`);
  },

  /**
   * Get analysis results for a contract
   * @param {string} contractId - Contract ID
   * @returns {Promise} Analysis results
   */
  getAnalysis: (contractId) => {
    return apiClient.get(`/contracts/${contractId}/analysis`);
  },

  /**
   * Delete a contract
   * @param {string} contractId - Contract ID
   * @returns {Promise} Delete response
   */
  deleteContract: (contractId) => {
    return apiClient.delete(`/contracts/${contractId}`);
  },

  /**
   * Reanalyze a contract
   * @param {string} contractId - Contract ID
   * @returns {Promise} Reanalyze response
   */
  reanalyzeContract: (contractId) => {
    return apiClient.post(`/contracts/${contractId}/reanalyze`);
  },
};

export default apiClient;
