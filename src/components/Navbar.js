import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import '../styles/NavBar.css';

function NavBar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">풋볼 인사이드</Navbar.Brand>
        <Nav className="me-auto main-nav">
          <Nav.Link as={Link} to="/popular">인기글</Nav.Link>
          <Nav.Link as={Link} to="/domestic">국내축구</Nav.Link>
          <Nav.Link as={Link} to="/international">해외축구</Nav.Link>
        </Nav>
        <Nav>
          {user ? (
            <>
              <Navbar.Text className="me-2">
                {user.email}
              </Navbar.Text>
              <Button variant="outline-light" as={Link} to="/mypage">마이페이지</Button>
              <Button variant="outline-light" onClick={handleLogout} className="ms-2">로그아웃</Button>
            </>
          ) : (
            <>
              <Button variant="outline-light" as={Link} to="/login">로그인</Button>
              <Button variant="outline-light" as={Link} to="/register" className="ms-2">회원가입</Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;