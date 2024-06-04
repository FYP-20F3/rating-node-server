import axios from 'axios';

const FLASK_API_BASE_URL = 'http://localhost:5000/review';

export const analyzeReview = async (reviewText) => {
  try {
    const response = await axios.post(`${FLASK_API_BASE_URL}/analyze-review`, {
      review: reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing review:', error);
    throw error;
  }
};

export const detectFakeReview = async (reviewText) => {
  try {
    const response = await axios.post(`${FLASK_API_BASE_URL}/detect-fake-review`, {
      review: reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error detecting fake review:', error);
    throw error;
  }
};

export const detectAbusiveLanguage = async (reviewText) => {
  try {
    const response = await axios.post(`${FLASK_API_BASE_URL}/detect-abusive-language`, {
      review: reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error detecting abusive language:', error);
    throw error;
  }
};
