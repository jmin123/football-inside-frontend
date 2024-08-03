import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/registration.css';
import { useNavigate } from 'react-router-dom';

function Registration() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [message, setMessage] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); // username이 사용 가능한지 여부
    const [isEmailAvailable, setIsEmailAvailable] = useState(null); // email이 사용 가능한지 여부
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    // 회원가입 버튼이 활성화되는 조건을 담은 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isUsernameValid || !isEmailAvailable) {
            setMessage('사용자 이름 또는 이메일을 확인해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                username,
                email,
                password,
            });
            alert('회원가입 완료');
            navigate('/login');
        } catch (error) {
            console.error('회원가입 오류 :', error.response?.data);
            setMessage('회원가입 중 오류가 발생했습니다.');
        }
    };

    const validateUsername = (username) => {
        return /^[a-zA-Z0-9가-힣]{2,10}$/.test(username);
    };

    const checkUsernameAvailability = async () => {
        if (username.length === 0) {
            setMessage('사용자 이름을 입력해주세요.');
            return;
        }
        if (!validateUsername(username)) {
            setMessage('사용자 이름은 2-10자의 영문, 숫자, 한글만 사용 가능합니다.');
            setIsUsernameValid(false);
            return;
        }
        try {
            const response = await axios.get(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
            setIsUsernameAvailable(response.data);
            setIsUsernameValid(response.data);
            setMessage(response.data ? '사용 가능한 사용자 이름입니다.' : '이미 사용 중인 사용자 이름입니다.');
        } catch (error) {
            setMessage('사용자 이름 확인 중 오류가 발생했습니다.');
            setIsUsernameValid(false);
        }
    };

    const checkEmailAvailability = async () => {
        if (email.length === 0) {
            setMessage('이메일 주소를 입력해주세요.');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (!emailRegex.test(email)) {
            setMessage('올바른 이메일 형식이 아닙니다.');
            return;
        }

        try {
            const response = await axios.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            setIsEmailAvailable(response.data);
            setMessage(response.data ? '사용 가능한 이메일 주소입니다.' : '이미 사용 중인 이메일 주소입니다.');
        } catch (error) {
            setMessage('이메일 주소 확인 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col xs={12} md={6}>
                    <h2 className="text-center mb-4">회원가입</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Label>사용자 이름</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    placeholder="사용자 이름을 입력하세요"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setIsUsernameAvailable(null);
                                        setIsUsernameValid(false);
                                    }}
                                    required
                                    isInvalid={username.length > 0 && !isUsernameValid}
                                />
                                <Button variant="outline-primary" onClick={checkUsernameAvailability} className="ms-2 fw-bold custom-width">                    중복 확인
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>이메일 주소</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="email"
                                    placeholder="이메일을 입력하세요"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setIsEmailAvailable(null);
                                    }}
                                    required
                                />
                                <Button variant="outline-primary" onClick={checkEmailAvailability} className="ms-2 fw-bold custom-width">
                                    중복 확인
                                </Button>
                            </div>
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

                        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                            <Form.Label>비밀번호 확인</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="비밀번호를 다시 입력하세요"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setPasswordMatch(e.target.value === password);
                                }}
                                required
                                isInvalid={!passwordMatch}
                            />
                            <Form.Control.Feedback type="invalid">
                                비밀번호가 일치하지 않습니다.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={!isUsernameValid || !isEmailAvailable || 
                            !passwordMatch || password !== confirmPassword}>
                            회원가입
                        </Button>
                    </Form>
                    {message && <Alert variant={isUsernameAvailable ? "success" : "danger"} className="mt-3">{message}</Alert>}
                </Col>
            </Row>
        </Container>
    );
}

export default Registration;