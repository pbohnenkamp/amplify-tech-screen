import React from "react";
import {Authenticator} from '@aws-amplify/ui-react';
import {Amplify, API, Auth, withSSRContext} from 'aws-amplify';
import Head from 'next/head';
import awsExports from '@/aws-exports';
import {createPost} from '@/graphql/mutations';
import {listPosts} from '@/graphql/queries';
import styles from '../styles/Home.module.css';
import {GetServerSideProps} from 'next';
import {CreatePostMutation, CreatePostMutationVariables} from "@/API";
import {GRAPHQL_AUTH_MODE} from "@aws-amplify/auth";
import {PostDto} from "@/app/posts/PostDto";
import {handleAmplifyApiError} from "@/app/utils/handleAmplifyApiError";

Amplify.configure({...awsExports, ssr: true});

export const getServerSideProps: GetServerSideProps = async ({req}) => {
    const SSR = withSSRContext({req});

    try {
        const response = await SSR.API.graphql({query: listPosts, authMode: 'API_KEY'});
        return {
            props: {
                posts: response.data.listPosts.items,
            },
        };
    } catch (err) {
        console.log(err);
        return {
            props: {},
        };
    }
}

const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    try {
        const variables: CreatePostMutationVariables = {
            input: {
                title: String(form.get('title')),
                content: String(form.get('content')),
            },
        }
        const result = await API.graphql({
            authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            query: createPost,
            variables: variables,
        })
        if ('data' in result && result.data) {
            const data = result.data as CreatePostMutation
            window.location.href = `/posts/${data.createPost!.id}`
        } else {
            return Promise.reject(new Error('data error'))
        }
    } catch (caught) {
        handleAmplifyApiError(caught);
    }
}

const Home = ({posts = []}: { posts: PostDto[] }) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Amplify + Next.js</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Amplify + Next.js</h1>

                <p className={styles.description}>
                    <code className={styles.code}>{posts.length}</code>
                    posts
                </p>

                <div className={styles.grid}>
                    {posts.map((post) => (
                        <a className={styles.card} href={`/posts/${post.id}`} key={post.id}>
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                        </a>
                    ))}

                    <div className={styles.card}>
                        <h3 className={styles.title}>New Post</h3>

                        <Authenticator>
                            <form onSubmit={handleCreatePost}>
                                <fieldset>
                                    <legend>Title</legend>
                                    <input
                                        defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                                        name="title"
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Content</legend>
                                    <textarea
                                        defaultValue="I built an Amplify project with Next.js!"
                                        name="content"
                                    />
                                </fieldset>

                                <button>Create Post</button>
                                <button type="button" onClick={() => Auth.signOut()}>
                                    Sign out
                                </button>
                            </form>
                        </Authenticator>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Home