import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Container } from 'react-bootstrap';
import api from '../components/api';

function CategoryPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categoryName } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/posts/category/name/${categoryName}`);
        setPosts(response.data.content);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryName]);

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <h2>{categoryName}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Recommendations</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map(post => (
              <tr key={post.id}>
                <td>
                  <Link to={`/${categoryName}/${post.id}`}>{post.title}</Link>
                </td>
                <td>{post.username}</td>
                <td>{post.recommendationCount}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No posts available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default CategoryPosts;