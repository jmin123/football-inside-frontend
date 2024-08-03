import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import api from '../components/api';
import { useUser } from '../components/UserContext';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const navigate = useNavigate();
  const MAX_COMMENT_LENGTH = 500;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`)
        ]);

        console.log('Post data:', postResponse.data);
        setPost(postResponse.data);
        setComments(commentsResponse.data);

        if (postResponse.data.categoryName) {
          let categoryName;
          if (Array.isArray(postResponse.data.categoryName)) {
            categoryName = postResponse.data.categoryName[0];
          } else if (typeof postResponse.data.categoryName === 'object') {
            categoryName = Object.values(postResponse.data.categoryName)[0];
          } else {
            categoryName = postResponse.data.categoryName;
          }

          console.log('Fetching posts for category:', categoryName);
          const categoryResponse = await api.get(`/posts/category/name/${categoryName}?size=10`);
          console.log('Category posts:', categoryResponse.data);
          setCategoryPosts(categoryResponse.data.content);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await api.put(`/posts/${id}`, {
        title: editTitle,
        content: editContent,
        categoryIds: post.categoryName.map(name => {
          // You might need to implement a way to get category IDs from names
          // This is just a placeholder
          return name === 'domestic' ? 1 : 2;
        })
      });
      setPost(response.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        console.log('Token before delete request:', token);
        
        const response = await api.delete(`/posts/${id}`);
        console.log('Delete response:', response);
        
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        }
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (newComment.length > MAX_COMMENT_LENGTH) {
      alert(`댓글은 ${MAX_COMMENT_LENGTH}자를 초과할 수 없습니다.`);
      return;
    }
    try {
      const response = await api.post(`/posts/${id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>이런! 해당 게시글이 보이지 않네요!</div>;

  return (
    <Container className="mt-4">
      {post.categoryName && (
        <h2 className="mb-4">
          {Array.isArray(post.categoryName)
            ? post.categoryName.join(', ')
            : typeof post.categoryName === 'object' && post.categoryName !== null
              ? Object.values(post.categoryName).join(', ')
              : post.categoryName}
        </h2>
      )}
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{post.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                작성자 : {post.username} 게시시간 : {new Date(post.createdAt).toLocaleDateString()}
              </Card.Subtitle>
              <Card.Text>{post.content}</Card.Text>
              {user && user.username === post.username && (
                <div>
                  <Button variant="primary" onClick={handleEdit} className="me-2">수정</Button>
                  <Button variant="danger" onClick={handleDelete}>삭제</Button>
                </div>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>댓글</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {comments.map(comment => (
                  <ListGroup.Item key={comment.id}>
                    <p>{comment.content}</p>
                    <small className="text-muted">
                      작성자: {comment.username} |
                      작성시간: {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {user ? (
                <Form onSubmit={handleCommentSubmit} className="mt-3">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요... (최대 500자)"
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small>{newComment.length} / {MAX_COMMENT_LENGTH}</small>
                    <Button type="submit">댓글 작성</Button>
                  </div>
                </Form>
              ) : (
                <p className="mt-3">댓글을 작성하려면 <Link to="/login">로그인</Link>이 필요합니다.</p>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>같은 카테고리의 다른 게시글</Card.Header>
            <ListGroup variant="flush">
              {categoryPosts.length > 0 ? (
                categoryPosts.map(categoryPost => (
                  <ListGroup.Item
                    key={categoryPost.id}
                    className={categoryPost.id === post.id ? 'fw-bold bg-light' : ''}
                  >
                    <Link
                      to={`/posts/${categoryPost.id}`}
                      className={categoryPost.id === post.id ? 'text-muted' : ''}
                    >
                      {categoryPost.title}
                    </Link>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>현재 다른 게시글이 없습니다!</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>게시글 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>내용</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            수정 완료
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PostDetail;