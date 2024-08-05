import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Form, Button, Modal, Alert } from 'react-bootstrap';
import api from '../components/api';
import { useUser } from '../components/UserContext';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const MAX_COMMENT_LENGTH = 500;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [hasRecommended, setHasRecommended] = useState(false);
  const [recommendError, setRecommendError] = useState('');
  const { id } = useParams();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`)
        ]);

        setPost(postResponse.data);
        setComments(commentsResponse.data);
        setRecommendationCount(postResponse.data.recommendationCount);
        setIsAuthor(user && user.username === postResponse.data.username);

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
  }, [id, user]);

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
        await api.delete(`/posts/${id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (newComment.length > MAX_COMMENT_LENGTH) {
      setError(`댓글은 ${MAX_COMMENT_LENGTH}자를 초과할 수 없습니다.`);
      return;
    }
    try {
      console.log('Submitting comment with token:', user.token);
      const response = await api.post(`/posts/${id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
      setError('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      if (err.response && err.response.status === 403) {
        setError('인증에 실패했습니다. 다시 로그인해 주세요.');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        setError('댓글 작성 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCommentEdit = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleCommentUpdate = async (commentId) => {
    try {
      const response = await api.put(`/posts/${id}/comments/${commentId}`, {
        content: editCommentContent
      });
      setComments(comments.map(comment =>
        comment.id === commentId ? response.data : comment
      ));
      setEditingCommentId(null);
      setCommentError('');
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error.response && error.response.status === 403) {
        setCommentError('댓글을 수정할 권한이 없습니다.');
      } else {
        setCommentError('댓글 수정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await api.delete(`/posts/${id}/comments/${commentId}`);
        setComments(comments.filter(comment => comment.id !== commentId));
        setCommentError('');
      } catch (error) {
        console.error('Error deleting comment:', error);
        if (error.response && error.response.status === 403) {
          setCommentError('댓글을 삭제할 권한이 없습니다.');
        } else {
          setCommentError('댓글 삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const handleRecommend = async () => {
    if (!user) {
      setRecommendError('추천하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await api.post(`/posts/${id}/recommend`);
      setRecommendationCount(response.data.recommendationCount);
      setHasRecommended(true);
      setRecommendError('');
    } catch (error) {
      console.error('Error recommending post:', error);
      if (error.response && error.response.status === 403) {
        setRecommendError('자신의 게시글은 추천할 수 없습니다.');
      } else if (error.response && error.response.status === 400) {
        setRecommendError('이미 이 게시글을 추천하셨습니다.');
      } else {
        setRecommendError('게시글 추천 중 오류가 발생했습니다.');
      }
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
                작성자: {post.username} | 게시 시간: {new Date(post.createdAt).toLocaleDateString()}
              </Card.Subtitle>
              <Card.Text>{post.content}</Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  추천 수: {recommendationCount}
                  <Button variant="outline-primary" onClick={handleRecommend} className="ms-2">
                    추천하기
                  </Button>
                  {hasRecommended && <span className="ms-2 text-success">추천완료</span>}
                </div>
                {user && user.username === post.username && (
                  <div>
                    <Button variant="primary" onClick={handleEdit} className="me-2">수정</Button>
                    <Button variant="danger" onClick={handleDelete}>삭제</Button>
                  </div>
                )}
              </div>
              {recommendError && <Alert variant="danger" className="mt-2">{recommendError}</Alert>}
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>댓글</Card.Header>
            <Card.Body>
              {commentError && <Alert variant="danger">{commentError}</Alert>}
              <ListGroup variant="flush">
                {comments.map(comment => (
                  <ListGroup.Item key={comment.id}>
                    {editingCommentId === comment.id ? (
                      <Form onSubmit={(e) => {
                        e.preventDefault();
                        handleCommentUpdate(comment.id);
                      }}>
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            maxLength={MAX_COMMENT_LENGTH}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end mt-2">
                          <Button variant="secondary" onClick={() => setEditingCommentId(null)} className="me-2">
                            취소
                          </Button>
                          <Button type="submit" variant="primary">
                            수정 완료
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <p>{comment.content}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            작성자: {comment.username}
                            {comment.username === post.username && <strong> - 작성자</strong>} |
                            작성시간: {new Date(comment.createdAt).toLocaleString()}
                          </small>
                          {user && user.username === comment.username && (
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleCommentEdit(comment.id, comment.content)}
                                className="me-2"
                              >
                                수정
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCommentDelete(comment.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
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