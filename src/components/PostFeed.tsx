"use client"

import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import {useIntersection} from '@mantine/hooks'
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULT } from "@/config";
import axios from "axios";
import { Session } from "inspector";
import { useSession } from "next-auth/react";
import Posts from "./Post";


interface PostFeedProps {
    initialPosts: ExtendedPost[],
    subredditName?: string
}
 
const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
    
    const lastPostRef = useRef<HTMLElement>(null)
    const {ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1,
    })

    const {data: session} = useSession()

    const {data, fetchNextPage, isFetchingNextPage} = useInfiniteQuery(
        ['infinte-query'],
        async ({pageParam = 1}) => {
            const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULT}&page=${pageParam}` + 
                (!!subredditName ? `&subredditName=${subredditName}` : '')
            
            const { data } = await axios.get(query)
            return data as ExtendedPost[]
        }, {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            initialData: {pages: [initialPosts], pageParams: [1]}
        }
    )

    useEffect(() => {

        if (entry?.isIntersecting) {
            fetchNextPage()
        }

    }, [entry, fetchNextPage])

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts


    return ( 
        <ul className="flex flex-col col-span-2 space-y-6">
            {posts.map((post, index) => {
                const votesAmt = post.votes.reduce((acc, vote) => {
                    if (vote.type === 'UP') {
                        return acc + 1
                    }
                    if (vote.type === 'DOWN') {
                        return acc - 1
                    }
                    return acc
                }, 0)
            
                const currentVote = post.votes.find(
                    (vote) => vote.userId === session?.user.id
                )
                    
                if (index === posts.length - 1) {
                    return (
                        <li key={post.id} ref={ref}>
                            <Posts commentAmnt={post.comments.length} subredditName={post.subreddit.name} post={post}
                            currentVote={currentVote} votesAmt={votesAmt}
                            />
                        </li>
                    )
                } else {
                    return (
                        // eslint-disable-next-line react/jsx-key
                        <Posts commentAmnt={post.comments.length} subredditName={post.subreddit.name} post={post}
                        currentVote={currentVote} votesAmt={votesAmt}
                        />
                    )
                }
                })}
        </ul>
     );
}
 
export default PostFeed;