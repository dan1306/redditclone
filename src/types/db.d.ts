import { Subreddit, Vote, User, Post, Comment } from "@prisma/client"

export type ExtendedPost = Post & {
    subreddit: Subreddit,
    votes: Vote[], 
    author: User,
    comments: Comment[]
}