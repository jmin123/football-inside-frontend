import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import api from '../components/api';

function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const categories = [
    { id: 1, name: 'Domestic', path: '/domestic' },
    { id: 2, name: 'International', path: '/international' },
    // Add more categories as needed
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }

    // Set the default category based on the state passed from the previous page
    if (location.state && location.state.category) {
      const category = categories.find(cat => cat.name.toLowerCase() === location.state.category);
      if (category) {
        setSelectedCategory(category.id.toString());
      }
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    try {
      const response = await api.post('/posts', {
        title,
        content,
        categoryIds: [parseInt(selectedCategory)],
      });
      console.log('Post creation response:', response.data);
      const category = categories.find(cat => cat.id.toString() === selectedCategory);
      navigate(category.path);
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      setError(error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
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
          <Form.Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button variant="primary" type="submit">
          글 작성
        </Button>
      </Form>
    </Container>
  );
}

export default WritePost;