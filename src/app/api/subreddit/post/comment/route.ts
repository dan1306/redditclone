import { Comment } from '@prisma/client';
import { Session } from 'next-auth';
import { CommentValidator } from "@/lib/validators/comment"
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from "zod";
import { bo } from '@upstash/redis/zmscore-22fd48c7';

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        console.log(body)

        const { postId, text, replyToId } = CommentValidator.parse(body)
        
        const Session = await getAuthSession()

        if (!Session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        await db.comment.create({
            data: {
                text,
                postId,
                authorId: Session.user.id,
                replyToId
            }
        })

        return new Response('OK')
    }  catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", {status:422})
        }

        console.log(error)

        return new Response('Could not create comment, please try again later', {status: 500})
    };
    
}