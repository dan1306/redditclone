import { z } from 'zod'

export const SubredditValidator = z.object({
    name: z.string().min(3).max(21),

})

export const SubredditSubscriptionValidator = z.object({
    subredditId: z.string()
})

// export cons SubscribeToSubredditPayload = z.object({})

export type CreateSubredditPayload = z.infer<typeof SubredditValidator>
export type CreateSubscribeToSubredditPayload = z.infer<typeof SubredditSubscriptionValidator>
