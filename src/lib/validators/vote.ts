import { z } from "zod"

export const PosstVoteValidator = z.object({
    postId: z.string(),
    VoteType: z.enum(['UP', 'DOWN']),
})

export type PosstVoteRequest = z.infer<typeof PosstVoteValidator>

export const CommentVoteValidator = z.object({
    commentId: z.string(),
    VoteType: z.enum(['UP', 'DOWN']),
})

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>