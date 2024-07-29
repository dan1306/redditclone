import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from 'zod';

export async function GET(req: Request) {
    const url = new URL(req.url)

    const session = await getAuthSession()
    
    let followedCommuntiesIds: string[] = []

    if (session) {
        let followedCommunties  = await db.subscription.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                subreddit: true
            }
        })

        followedCommuntiesIds = followedCommunties.map((arg) => arg.subreddit.id)
        
    }

    try {
        const { limit, page, subreddiName} = z.object({
            limit: z.string(),
            page: z.string(),
            subreddiName: z.string().nullish().optional()
        }).parse({
            subreddiName: url.searchParams.get(`subredditName`),
            page: url.searchParams.get(`page`),
            limit: url.searchParams.get(`limit`),

        })

        let whereClause = {}
        
        if (subreddiName) {
            whereClause = {
                subreddit: {
                    name: subreddiName
                }
            }
        } else if (session) {
            whereClause = {
                subreddit: {
                    id: {
                        in: followedCommuntiesIds
                    }
                }
            }
        }

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                createdAt : 'desc'
            },
            include: {
                subreddit: true,
                votes: true,
                comments: true,
                author: true
            },
            where : whereClause
        })

        return new Response(JSON.stringify(posts))
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", {status:422})
        }

        return new Response('Could not fetch your posts', {status: 500})
    }
}