import { CachedPost } from './../../../../../types/reddis.d';
import { Vote } from '@prisma/client';
import { Session } from 'next-auth';
import { PosstVoteValidator } from "@/lib/validators/vote"
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Potta_One } from 'next/font/google';
import { redis } from '@/lib/redis';
import { z } from 'zod';

const CACHE_AFTER_UPVOTE = 1

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const { postId, VoteType} = PosstVoteValidator.parse(body)
        
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId
            }
        })

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                author: true,
                votes: true
            },
        })

        if (!post){ 
            return new Response('Post not found', {
                status: 404
            })
        }

        if (existingVote) {
            if (existingVote.type === VoteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId,
                            userId: session.user.id
                        },
                    },
                })
                return new Response('OK')
            }

            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id
                    },
                },
                data: {
                    type: VoteType,
                },
            })

            // recount the votes
            const votesAmt = post.votes.reduce((acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            if (votesAmt >= CACHE_AFTER_UPVOTE) {
                const cachePayload: CachedPost = {
                    authorUsername: post.author.username ?? '',
                    content: JSON.stringify(post.content),
                    id: post.id,
                    title: post.title,
                    currentVote: VoteType,
                    createdAt: post.createdAt
                }

                await redis.hset(`post:${postId}`, cachePayload)
            }

            return new Response('OK')
        }

        await db.vote.create({
            data: {
                type: VoteType,
                userId: session.user.id,
                postId
            }
        })

        const votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        if (votesAmt >= CACHE_AFTER_UPVOTE) {
            const cachePayload: CachedPost = {
                authorUsername: post.author.username ?? '',
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: VoteType,
                createdAt: post.createdAt
            }

            await redis.hset(`post:${postId}`, cachePayload)

        }

        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", {status:422})
        }

        console.log(error)

        return new Response('Could not register your vote, please try again later', {status: 500})
    };
    
}
