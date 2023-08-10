import React from "react";
import {API, withSSRContext} from 'aws-amplify';
import {getPost} from '@/graphql/queries';
import {GetServerSideProps} from 'next';
import {PostDto} from "@/app/posts/PostDto";
import {useRouter} from "next/router";
import styles from "@/styles/Home.module.css";
import {deletePost} from "@/graphql/mutations";
import {handleAmplifyApiError} from "@/app/utils/handleAmplifyApiError";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async ({req, params}) => {
    const SSR = withSSRContext({req});

    if (params == null || !('id' in params)) {
        return Promise.reject(new Error('id is not found'))
    }
    const response = await SSR.API.graphql({
        query: getPost,
        variables: {
            id: params.id
        }
    });
    return {
        props: {
            post: response.data.getPost,
        },
    };
}

const Post = ({post}: { post: PostDto }) => {
    const router = useRouter();
    if (router.isFallback) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Loading&hellip;</h1>
            </div>
        );
    }

    async function handleDelete() {
        try {
            await API.graphql({
                authMode: 'AMAZON_COGNITO_USER_POOLS',
                query: deletePost,
                variables: {
                    input: {id: post.id}
                }
            });

            window.location.href = '/';
        } catch (caught) {
            handleAmplifyApiError(caught);
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{post.title} – Amplify + Next.js</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>{post.title}</h1>

                <p className={styles.description}>{post.content}</p>
            </main>

            <footer className={styles.footer}>
                <button onClick={handleDelete}>💥 Delete post</button>
            </footer>
        </div>
    )
}

export default Post