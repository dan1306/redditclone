import { Post, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
    postId: string
    initialVoteAmt?: number
    initialVote?: undefined | null | VoteType
    getData?: ()=> Promise<(Post & {votes: Vote[]}) | null>
}
 
const PostVoteServer = async ({
    postId,
    initialVoteAmt,
    initialVote,
    getData
}: PostVoteServerProps) => {

    const session = await getServerSession()

    let _votesAmt: number = 0
    let _currentVote: undefined | null | VoteType = undefined

    if (getData) {
        const post = await getData()
        if (!post) return notFound()
        
        _votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc++
            if (vote.type === 'DOWN') return acc--
            return acc
        }, 0)

        _currentVote = post.votes.find((vote) => vote.userId === session?.user.id)?.type
    } else {
        _votesAmt = initialVoteAmt!
        _currentVote = initialVote
    }
    return <PostVoteClient
        postId={postId}
        initialVotesAmt={_votesAmt}
        initialVote={_currentVote ?? null}
    />
}
 
export default PostVoteServer;