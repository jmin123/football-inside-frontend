import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import api from '../components/api';

function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subjectPrefix, setSubjectPrefix] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const location = useLocation();
  const { category: categoryParam } = useParams();
  const { isLoggedIn } = useUser();

  const categories = [
    { id: 1, name: '국내축구', path: '/domestic', englishName: 'domestic' },
    { id: 2, name: '해외축구', path: '/international', englishName: 'international' },
  ];

  const subjectPrefixes = {
    1: ['일반', '정보', '질문', '사진/영상'],
    2: ['일반', '정보', '질문', '사진/영상'],
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '지금 새로고침을 하시면 모든 내용이 사라집니다.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn) {
        try {
          await api.get('/auth/check');
          setIsLoading(false);
        } catch (error) {
          navigate('/login', { state: { from: location.pathname } });
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoggedIn, navigate, location.pathname]);

  useEffect(() => {
    if (isLoading) return;
  
    let initialCategoryName = location.state?.category || categoryParam;
  
    console.log('Initial Category Name:', initialCategoryName); // Debug log
  
    if (!initialCategoryName) {
      initialCategoryName = 'domestic';
    }
  
    const category = categories.find(cat => 
      cat.englishName.toLowerCase() === initialCategoryName.toLowerCase() || 
      cat.name === initialCategoryName
    );
    
    console.log('Found Category:', category); // Debug log
  
    if (category) {
      setSelectedCategory(category.id);
      setCategoryName(category.name);
      const initialSubjectPrefix = subjectPrefixes[category.id][0];
      setSubjectPrefix(initialSubjectPrefix);
    } else {
      setSelectedCategory(1);
      setCategoryName('국내축구');
      setSubjectPrefix(subjectPrefixes[1][0]);
    }
  
    console.log('Final Category Name:', categoryName); // Debug log
  }, [isLoading, location, categoryParam]);

  useEffect(() => {
    if (categoryName) {
      document.title = `${categoryName} 게시글 작성`;
    }
  }, [categoryName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.');
      return;
    }
  
    try {
      const response = await api.post('/posts', {
        title,
        content,
        categoryIds: [selectedCategory],
        subjectPrefix,
      });
      
      const category = categories.find(cat => cat.id === selectedCategory);
      navigate(category ? category.path : '/');
    } catch (error) {
      setError(error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Container className="mt-5">
      <h2>{categoryName} 게시글 작성</h2>
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
          <Form.Label>말머리</Form.Label>
          <Form.Select
            value={subjectPrefix}
            onChange={(e) => setSubjectPrefix(e.target.value)}
            required
          >
            {selectedCategory && subjectPrefixes[selectedCategory] ? (
              subjectPrefixes[selectedCategory].map((prefix, index) => (
                <option key={index} value={prefix}>
                  {prefix}
                </option>
              ))
            ) : (
              <option>말머리를 선택할 수 없습니다</option>
            )}
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