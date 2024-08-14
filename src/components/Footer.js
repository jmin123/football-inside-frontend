import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="mt-4 mb-4">
      <Container fluid>
        <Row className="justify-content-center">
          <Col lg={11}>
            <hr className="border-top border-secondary" />
            <div className="text-muted mt-2">
              <div className="d-inline-block">
                <small>Copyright © www.football-inside.com All rights reserved.</small>
                <hr className="my-2" style={{width: '100%', borderTop: '1px solid #6c757d'}} />
                <small>풋볼 인사이드 운영팀 : help@footballinside.claude</small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;