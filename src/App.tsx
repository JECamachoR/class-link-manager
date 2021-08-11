import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react'
import { Button, Container } from 'react-bootstrap';
import FForm, { actions } from './Form';
import { ListPostsQuery, Post } from './API';
import { useEffect, useState } from 'react';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { listPosts } from './graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { onCreatePost, onDeletePost, onUpdatePost } from './graphql/subscriptions';
import PostCard from './PostCard';

function App() {

  const [list, setList] = useState<(Post | null)[]>([])
  const [formAction, setFormAction] = useState<null | actions>(null)
  const [update, setUpdate] = useState<Post | null>(null)

  useEffect(() => {
    const initialLoad = async () => {
      try {
        const {username: userID} = await Auth.currentAuthenticatedUser()
        const r = await API.graphql(graphqlOperation(listPosts, {
          filter: {userID: {eq: userID}}
        })) as GraphQLResult<ListPostsQuery>
        setList(r.data?.listPosts?.items || [])
      } catch (err) {
        console.error(err)
      }
    }
    initialLoad()

    //@ts-ignore
    const creation = API.graphql(graphqlOperation(onCreatePost, {})).subscribe({
      next: async ({value}: any) => {
        const {username: userID} = await Auth.currentAuthenticatedUser()
        if (value.data.onCreatePost.userID === userID) {
          setList(prev => [...prev, value.data.onCreatePost])
        }
      },
      error: (err: any) => console.error(err)
    })

    //@ts-ignore
    const deletion = API.graphql(graphqlOperation(onDeletePost, {})).subscribe({
      next: async({value}: any) =>  {
        const {username: userID} = await Auth.currentAuthenticatedUser()
        if (value.data.onDeletePost.userID === userID) {
          setList(prev => {
            return prev.filter((p) => p?.id !== value.data.onDeletePost.id)
          })
        }
      },
      error: (err: any) => console.error(err)
    })

    
    //@ts-ignore
    const mutation = API.graphql(graphqlOperation(onUpdatePost, {})).subscribe({
      next: async({value}: any) =>  {
        const {username: userID} = await Auth.currentAuthenticatedUser()
        if (value.data.onUpdatePost.userID === userID) {
          setList(prev => {
            return prev.map((p) => {
              if (p?.id === value.data.onUpdatePst.id){
                return value.data.onUpdatePost
              } else return p
            })
          })
        }
        console.log(value)
      },
      error: (err: any) => console.error(err)
    })

    
    return () => {
      creation.unsubscribe()
      deletion.unsubscribe()
      mutation.unsubscribe()
    }
  }, [])

  return (
    <Container>
      <Button
        onClick={() => {
          setUpdate(null)
          setFormAction(formAction || update ? null : "create")
        }}
      >
        {formAction || update ? "close" : "add"}
      </Button>
      {
        formAction || update ? 
        <FForm action={formAction || "create"} close={() => setFormAction(null)} {...(update ? {initialValues: update} : {})} />
        :
        list.map((post: Post | null, i) => <PostCard post={post} setUpdate={setUpdate} key={i} />)
      }
    </Container>
  );
}

export default withAuthenticator(App)