import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../components/api'; 
import { useUser } from '../components/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        const userData = {
          ...response.data,
          token: response.data.token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data stored in localStorage:', userData);
        setUser(userData);
        navigate(from, { replace: true });
      } else {
        throw new Error('Token not received from server');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };  

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">로그인</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>이메일 주소</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="이메일을 입력하세요" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="비밀번호를 입력하세요" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              로그인
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;