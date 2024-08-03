import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import api from '../components/api';

function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const categories = [
    { id: 1, name: 'Domestic' },
    { id: 2, name: 'International' },
    // Add more categories as needed
  ];

  useEffect(() => {
    const userString = localStorage.getItem('user');
    console.log('User string in WritePost:', userString);
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        console.log('Parsed user data in WritePost:', userData);
      } catch (error) {
        console.error('Error parsing user data in WritePost:', error);
      }
    }
  
    if (!user) {
      console.log('No user in context, redirecting to login');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const userString = localStorage.getItem('user');
    console.log('User string in handleSubmit:', userString);
  
    if (!user) {
      console.log('No user in context, cannot submit post');
      setError('로그인이 필요합니다.');
      return;
    }
  
    if (selectedCategories.length === 0) {
      setError('카테고리를 선택해주세요.');
      return;
    }
  
    console.log('Submitting post with user:', user);
  
    try {
      const response = await api.post('/posts', {
        title,
        content,
        categoryIds: selectedCategories,
      });
      console.log('Post creation response:', response.data);
      // Navigate to the page of the first selected category
      navigate(`/category/${categories.find(cat => cat.id === selectedCategories[0]).name.toLowerCase()}`);
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      setError(error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">새 글 작성</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>제목</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="제목을 입력하세요"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>내용</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="내용을 입력하세요"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>카테고리</Form.Label>
          {categories.map(category => (
            <Form.Check 
              type="checkbox"
              key={category.id}
              id={`category-${category.id}`}
              label={category.name}
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategoryChange(category.id)}
            />
          ))}
        </Form.Group>
        <Button variant="primary" type="submit">
          글 작성
        </Button>
      </Form>
    </Container>
  );
}

export default WritePost;