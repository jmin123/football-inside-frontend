import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MainPage() {
  const navigate = useNavigate();
  const [domesticPosts, setDomesticPosts] = useState([]);
  const [internationalPosts, setInternationalPosts] = useState([]);
  const [domesticPage, setDomesticPage] = useState(0);
  const [internationalPage, setInternationalPage] = useState(0);
  const [hasFetchedDomestic, setHasFetchedDomestic] = useState(false);
  const [hasFetchedInternational, setHasFetchedInternational] = useState(false);

  useEffect(() => {
    if (!hasFetchedDomestic) {
      fetchPosts('domestic', domesticPage, setDomesticPosts, setDomesticPage);
      setHasFetchedDomestic(true);
    }
  }, [hasFetchedDomestic, domesticPage]);

  useEffect(() => {
    if (!hasFetchedInternational) {
      fetchPosts('international', internationalPage, setInternationalPosts, setInternationalPage);
      setHasFetchedInternational(true);
    }
  }, [hasFetchedInternational, internationalPage]);

  const fetchPosts = (categoryName, page, setPosts, setPage) => {
    axios.get(`/api/posts/category/name/${categoryName}?page=${page}&size=10`)
      .then(response => {
        console.log(`Response for ${categoryName}:`, response.data);
        if (response.data.content && response.data.content.length > 0) {
          setPosts(response.data.content);
          setPage(page + 1);
        } else {
          console.log(`No posts found for category: ${categoryName}`);
        }
      })
      .catch(error => {
        console.error(`Error fetching posts for category ${categoryName}:`, error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      });
  };
  
  useEffect(() => {
    fetchPosts('domestic', 0, setDomesticPosts, setDomesticPage);
    fetchPosts('international', 0, setInternationalPosts, setInternationalPage);
  }, []);

  const renderPosts = (posts, category) => {
    return posts.map(post => (
      <Card key={post.id} className="mb-3">
        <Card.Body>
          <Card.Title>
            <Link to={`/posts/${category}/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {post.title}
            </Link>
          </Card.Title>
        </Card.Body>
      </Card>
    ));
  };  

  const LoadMoreButton = ({ category}) => (
    <div className="text-center mt-3 mb-3">
      <button onClick={() => navigate(`/${category}`)} className="btn btn-primary">
        더보기
      </button>
    </div>
  );

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={6} className="post-column">
          <h2 className="mb-3">
            <Link to="/domestic" style={{ color: 'inherit', textDecoration: 'none' }}>
              국내축구
            </Link>
          </h2>
          {renderPosts(domesticPosts, 'domestic')}
          <LoadMoreButton category="domestic" />
        </Col>
        <Col md={6} className="post-column">
          <h2 className="mb-3">
            <Link to="/international" style={{ color: 'inherit', textDecoration: 'none' }}>
              해외축구
            </Link>
          </h2>
          {renderPosts(internationalPosts, 'international')}
          <LoadMoreButton category="international" />
        </Col>
      </Row>
    </Container>
  );
}

export default MainPage;