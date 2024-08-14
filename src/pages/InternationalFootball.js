import React, { useState, useEffect } from 'react';
import { Table, Container, Pagination, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import "../styles/CategoryDetail.css";

function InternationalFootball() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [visitedPosts, setVisitedPosts] = useState(new Set());

  const handleWritePost = () => {
    if (user) {
      navigate('/write-post', { 
        state: { category: 'international' },
        pathname: '/write-post/international'
      });
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  useEffect(() => {
    const storedVisitedPosts = JSON.parse(localStorage.getItem('visitedPosts') || '[]');
    setVisitedPosts(new Set(storedVisitedPosts));

    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = (page) => {
    axios.get(`/api/posts/category/name/international?page=${page - 1}&size=20`)
      .then(response => {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => console.error('게시글을 불러오는 데 실패하였습니다.', error));
  };

  const formatDate = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();

    if (postDate.toDateString() === now.toDateString()) {
      // 당일은 시간만
      return postDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (postDate.getFullYear() === now.getFullYear()) {
      // 올해면 월.일
      const parts = postDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).split('.');
      return `${parts[0].trim()}.${parts[1].trim()}`;
    } else {
      // 이외는 년.월.일
      const parts = postDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).split('.');
      return `${parts[0].trim()}.${parts[1].trim()}.${parts[2].trim()}`;
    }
  };


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePostClick = (postId) => {
    const updatedVisitedPosts = new Set(visitedPosts);
    updatedVisitedPosts.add(postId);
    setVisitedPosts(updatedVisitedPosts);
    localStorage.setItem('visitedPosts', JSON.stringify([...updatedVisitedPosts]));
  };

  const AdSpace = ({ side }) => (
    <div className="ad-space" style={{
      height: '100%',
      backgroundColor: '#f0f0f0',
      padding: '10px',
      position: 'sticky',
    }}>
      <p style={{ textAlign: 'center' }}>광고란({side})</p>
    </div>
  );

  return (
    <Container fluid className="px-2">
      <Row className="justify-content-center">
        <Col md={2}>
          <AdSpace side="Left" />
        </Col>
        <Col lg={7} md={9}>
          <h1 className="my-4">해외축구</h1>
          <Table striped bordered hover className="custom-table">
            <colgroup>
              <col style={{width: '50%'}} />
              <col style={{width: '30%'}} />
              <col style={{width: '10%'}} />
              <col style={{width: '10%'}} />
            </colgroup>
            <thead>
              <tr>
                <th>제목</th>
                <th>글쓴이</th>
                <th>추천 수</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <Link 
                        to={`/posts/domestic/${post.id}`}
                        className={visitedPosts.has(post.id) ? 'visited' : ''}
                        onClick={() => handlePostClick(post.id)}
                      >
                        {post.title}
                        {post.commentCount > 0 && ` [${post.commentCount}]`}
                      </Link>
                    </td>
                    <td>{post.username}</td>
                    <td>{post.recommendationCount}</td>
                    <td>{formatDate(post.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">아직 올라온 게시글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="d-flex flex-column align-items-center mt-4">
            <Pagination className="mb-3">
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              <Pagination.Item active>{currentPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>페이지 {currentPage} 중 {totalPages}</span>
              <Button variant="primary" onClick={handleWritePost}>글쓰기</Button>
            </div>
          </div>
        </Col>
        <Col md={2} >
          <AdSpace side="Right" />
        </Col>
      </Row>
    </Container>
  );
}

export default InternationalFootball;