import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/MainPage.css"

function MainPage() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState({});
  const [error, setError] = useState(null);
  const [visitedPosts, setVisitedPosts] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedVisitedPosts = JSON.parse(localStorage.getItem('visitedPosts') || '[]');
    setVisitedPosts(new Set(storedVisitedPosts));

    const fetchCategoriesAndPosts = async () => {
      try {
        const categoriesResponse = await axios.get('/api/categories');
        const fetchedCategories = categoriesResponse.data;
        setCategories(fetchedCategories);

        const postsPromises = fetchedCategories.map(category =>
          axios.get(`/api/posts/category/name/${category.name}?page=0&size=10`)
            .then(response => ({
              categoryName: category.name,
              posts: response.data.content || []
            }))
        );

        const categorizedPosts = await Promise.all(postsPromises);

        const postsWithComments = await Promise.all(
          categorizedPosts.map(async ({ categoryName, posts }) => {
            const postsWithCommentCounts = await Promise.all(
              posts.map(async post => {
                const commentResponse = await axios.get(`/api/posts/${post.id}/comments`);
                return {
                  ...post,
                  commentCount: commentResponse.data.page.totalElements
                };
              })
            );
            return { categoryName, posts: postsWithCommentCounts };
          })
        );

        const postsObject = postsWithComments.reduce((acc, { categoryName, posts }) => {
          acc[categoryName] = posts;
          return acc;
        }, {});

        setPosts(postsObject);
        setIsLoaded(true);
      } catch (err) {
        setError('게시글을 불러오는 데 문제가 있습니다.\n잠시 후에 다시 시도해주세요...');
        setIsLoaded(true);
      }
    };

    fetchCategoriesAndPosts();
  }, []);

  const handlePostClick = (postId) => {
    const updatedVisitedPosts = new Set(visitedPosts);
    updatedVisitedPosts.add(postId);
    setVisitedPosts(updatedVisitedPosts);
    localStorage.setItem('visitedPosts', JSON.stringify([...updatedVisitedPosts]));
  };

  const renderPosts = (categoryPosts, categoryName) => {
    return categoryPosts.map((post, index) => (
      <div key={post.id} className="post-item">
        <Link 
          to={`/posts/${categoryName}/${post.id}`} 
          className={`post-link ${visitedPosts.has(post.id) ? 'visited' : ''}`}
          onClick={() => handlePostClick(post.id)}
        >
          {post.title}
          <span className="comment-count">
            [{post.commentCount}]
          </span>
        </Link>
        {index < categoryPosts.length - 1 && <hr className="post-divider" />}
      </div>
    ));
  };

  const AdSpace = ({ side }) => (
    <div className="ad-space" style={{ height: '100%', backgroundColor: '#f0f0f0', padding: '10px' }}>
      <p style={{ textAlign: 'center' }}>광고란 ({side})</p>
    </div>
  );

  if (!isLoaded) {
    return null; // 로딩 중에는 페이지가 비어보이게
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={2}>
          <AdSpace side="좌" />
        </Col>
        <Col md={8}>
          <Row>
            {categories.map(category => (
              <Col md={6} key={category.id} className="post-column">
                <h2 className="mb-3">
                  <Link to={`/${category.name}`} className="category-link">
                    {category.nameKr}
                  </Link>
                </h2>
                {posts[category.name] && renderPosts(posts[category.name], category.name)}
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={2}>
          <AdSpace side="우" />
        </Col>
      </Row>
    </Container>
  );
}

export default MainPage;