import { API, Auth, graphqlOperation } from "aws-amplify"
import { Formik } from "formik"
import { Button, Container, Form } from "react-bootstrap"
import { CreatePostInput, Post, UpdatePostInput } from "./API"
import { createPost, updatePost } from "./graphql/mutations"


export type actions = "create" | "update"

export type Props = {
    initialValues: Post;
    action: actions;
    close: () => void;
}

const createPostAction = async (values: CreatePostInput) => {
    try {
        const {username: userID} = await Auth.currentAuthenticatedUser()
        const r = await API.graphql(graphqlOperation(createPost, {
            input: {
                ...values,
                userID
            }}))
        console.log(r)
    } catch (err) {
        console.error(err)
    }
}

const updatePostAction = async (input: UpdatePostInput) => {
    try {
        const r = await API.graphql(graphqlOperation(updatePost, {
            input: input}))
        console.log(r)
    } catch (err) {
        console.error(err)
    }
}

const FForm = ({ initialValues, action, close }: Props) => {

    return (
        <Container>
        <Formik
        initialValues={initialValues}
        onSubmit={(v) => {
            switch (action) {
                case "update":
                    updatePostAction(v)
                    break;
                default:
                    createPostAction(v)
                    break
            }
            close()
        }}
        >
            {({handleChange, values, submitForm}) => {
                return (
                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
                        submitForm()
                    }}
                >
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control 
                        placeholder="Nombre" 
                        defaultValue={values.name}
                        onChange={handleChange("name")}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Link</Form.Label>
                        <Form.Control type="url"
                        placeholder="Link"
                        defaultValue={values.url || ""}
                        onChange={handleChange("url")}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" 
                        placeholder="Email" 
                        defaultValue={values.profEmail || ""}
                        onChange={handleChange("profEmail")}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
                )
            }}
        </Formik>
        </Container>
    )
}

FForm.defaultProps = {
    onSubmit: console.log, 
    initialValues: {
        name: "",
        url: "",
        profEmail: ""
    } as Post
}

export default FForm