import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MainPage() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
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
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      }
    };

    fetchCategoriesAndPosts();
  }, []);

  const renderPosts = (categoryPosts, categoryName) => {
    return categoryPosts.map(post => (
      <Card key={post.id} className="mb-3">
        <Card.Body>
          <Card.Title>
            <Link to={`/posts/${categoryName}/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {post.title}
              <span style={{ fontSize: '0.8em', marginLeft: '5px', color: '#003CFA' }}>
                [{post.commentCount}]
              </span>
            </Link>
          </Card.Title>
        </Card.Body>
      </Card>
    ));
  };

  const AdSpace = ({ side }) => (
    <div className="ad-space" style={{ height: '100%', backgroundColor: '#f0f0f0', padding: '10px' }}>
      <p style={{ textAlign: 'center' }}>광고란 ({side})</p>
    </div>
  );

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
                  <Link to={`/${category.name}`} style={{ color: 'inherit', textDecoration: 'none' }}>
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