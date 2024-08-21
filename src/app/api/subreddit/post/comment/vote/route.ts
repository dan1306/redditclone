import { Vote } from '@prisma/client';
import { Session } from 'next-auth';
import { CommentVoteValidator, PosstVoteValidator } from "@/lib/validators/vote"
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Potta_One } from 'next/font/google';
import { redis } from '@/lib/redis';
import { z } from 'zod';

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const { commentId, VoteType} = CommentVoteValidator.parse(body)
        
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const existingVote = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId
            }
        })

        if (existingVote) {
            if (existingVote.type === VoteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id
                        },
                    },
                })
                return new Response('OK')
            } else {
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id
                        },
                    },
                    data: {
                        type: VoteType,
                    },
                })
            }
            return new Response('OK')
        }

        await db.commentVote.create({
            data: {
                type: VoteType,
                userId: session.user.id,
                commentId
            }
        })


        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", {status:422})
        }

        console.log(error)

        return new Response('Could not register your vote, please try again later', {status: 500})
    };
    
}
