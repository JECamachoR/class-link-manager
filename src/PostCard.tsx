import { API, graphqlOperation } from 'aws-amplify'
import { Row, Card, Col, Button } from 'react-bootstrap'
import { Post } from './API'
import { deletePost } from './graphql/mutations'

type PostCardProp = {
    post: Post | null;
    setUpdate: (v: any) => void
}

function PostCard({ post, setUpdate }: PostCardProp) {
    return (
        <Row>
          <Card>
            <Card.Header>{post?.name}</Card.Header>
            <Card.Body>
              <Row>
              <Col>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(post?.url || "")
                  }}
                >
                  Join Class
                </Button>
              </Col>
              <Col>
                <Button
                    onClick={() => {
                        window.location.href = "mailto:" + post?.profEmail
                    }}
                >
                  Email Professor
                </Button>
              </Col>
              <Col>
                <Button
                variant="danger"
                onClick={() => {
                  API.graphql(graphqlOperation(deletePost, {input: {id: post?.id}}))
                }}
                >
                  delete
                </Button>
                <Button
                variant="warning"
                onClick={() => setUpdate(post)}
                >
                  update
                </Button>
              </Col>
              </Row>
            </Card.Body>
          </Card>
        </Row>
      )
}

export default PostCard
