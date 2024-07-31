import { INFINITE_SCROLLING_PAGINATION_RESULT } from "@/config";
import { db } from "@/lib/db";
import { FC } from "react";
import PostFeed from "./PostFeed";
import { Session } from "inspector";
import { getAuthSession } from "@/lib/auth";

interface GeneralFeed {
    
}
 
const GeneralFeed = async () => {
    const session = await getAuthSession()
    
    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        }, 
        include: {
            subreddit: true
        }
    })
    const posts = await db.post.findMany({

        where: {
            subreddit: {
                name: {
                    in: followedCommunities.map(({subreddit}) => subreddit.id)
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULT
    })
    return ( <PostFeed  initialPosts={posts}/> );
}
 
export default GeneralFeed;