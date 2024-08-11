import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../components/api';
import { useUser } from '../components/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleRememberMeChange = (e) => {
    if (e.target.checked) {
      const userConfirmed = window.confirm('이 버튼을 클릭 시 창을 닫아도 로그인이 유지됩니다\n공공장소에서 사용하는 것을 비추천합니다');
      if (userConfirmed) {
        setRememberMe(true);
      } else {
        setRememberMe(false);
      }
    } else {
      setRememberMe(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password, rememberMe });
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('isLoggedIn', 'true');
        login(response.data);
        navigate(from, { replace: true });
      } else {
        setError('Login failed: No access token received');
      }
    } catch (err)  {
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      if (err.response && err.response.status === 400) {
        setError('이메일/비밀번호가 올바르지 않습니다.');
      } 
      else if (err.response && err.response.status === 429) {
        setError('너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요');
      }
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
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="자동 로그인" 
                checked={rememberMe}
                onChange={handleRememberMeChange}
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