import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import api from '../components/api';

const RecommendationSection = ({ postId, initialRecommendationCount, user }) => {
  const [recommendationCount, setRecommendationCount] = useState(initialRecommendationCount);
  const [userRecommendation, setUserRecommendation] = useState(null);
  const [recommendError, setRecommendError] = useState('');

  useEffect(() => {
    const checkRecommendationStatus = async () => {
      if (user) {
        try {
          const response = await api.get(`/posts/${postId}/user-recommendation`);
          setUserRecommendation(response.data.recommendation);
        } catch (error) {
          console.error('Error checking recommendation status:', error);
        }
      }
    };

    checkRecommendationStatus();
  }, [postId, user]);

  useEffect(() => {
    let timer;
    if (recommendError) {
      timer = setTimeout(() => {
        setRecommendError('');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [recommendError]);

  const handleRecommendation = async (action) => {
    if (!user) {
      setRecommendError('추천 또는 비추천하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const endpoint = action === 'recommend' ? `/posts/${postId}/recommend` : `/posts/${postId}/unrecommend`;
      const response = await api.post(endpoint);
      setRecommendationCount(response.data.recommendationCount);
      setUserRecommendation(action);
      setRecommendError('');
    } catch (error) {
      setRecommendError(error.response?.data || '추천/비추천 중 오류가 발생했습니다.');
    }
  };

  const recommendationStyle = recommendationCount < 0 ? { color: 'red' } : {};

  return (
    <div className="d-flex align-items-center">
      <Button 
        variant={userRecommendation === 'recommend' ? "primary" : "outline-primary"}
        onClick={() => handleRecommendation('recommend')}
        className="me-2"
        disabled={userRecommendation === 'recommend' || userRecommendation === 'unrecommend'}
      >
        추천
      </Button>
      <div className="me-2 p-2 border rounded" style={{ minWidth: '40px', textAlign: 'center', ...recommendationStyle }}>
        {recommendationCount}
      </div>
      <Button 
        variant={userRecommendation === 'unrecommend' ? "danger" : "outline-danger"}
        onClick={() => handleRecommendation('unrecommend')}
        disabled={userRecommendation === 'recommend' || userRecommendation === 'unrecommend'}
      >
        비추천
      </Button>
      {recommendError && <Alert variant="danger" className="mt-2">{recommendError}</Alert>}
    </div>
  );
};

export default RecommendationSection;