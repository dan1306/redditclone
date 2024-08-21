"use client"

import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CommentVoteRequest, PosstVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type PartialVote = Pick<CommentVote, 'type'>

interface CommentVoteClientProps {
    commentId: string
    initialVotesAmt: number
    initialVote: PartialVote | undefined
}
 
const CommentVoteClient: FC<CommentVoteClientProps> = ({
    commentId,
    initialVotesAmt,
    initialVote
}) => {
    const { loginToast } = useCustomToast()
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState<any>(initialVote)
    const prevVote = usePrevious(currentVote)

    
    const { mutate: vote} = useMutation({
        mutationFn: async (VoteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                VoteType
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)
        }, 
        onError: (err, VoteType) => {
            if (VoteType === 'UP') setVotesAmt(prev => prev--)
            else setVotesAmt(prev => prev++)
            
            // RESET CURRENT VOTE
            setCurrentVote(prevVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong',
                description: 'Your vote was not registered, please try again.',
                variant: 'destructive'
            })
        },

        onMutate: (type) => {
            if (currentVote?.type === type) {
                setCurrentVote(undefined)
                if (type === 'UP') setVotesAmt(prev => prev--)
                else if (type === 'DOWN') setVotesAmt(prev => prev++)

            } else {
                setCurrentVote({type})
                if (type === 'UP') setVotesAmt(pre => pre + (currentVote ? 2 : 1))
                else if(type === 'DOWN') setVotesAmt((pre) => pre - (currentVote ? 2 : 1))
            }
        }
    })

    return (
        <div className="flex gap-1">
            <Button onClick={() => vote('UP')} size='sm' variant='ghost' aria-label='upvote'>
                <ArrowBigUp className={cn('h-5 w-5 text-zinc-700', {
                    'text-emerald-500 fil-emerald-500': currentVote?.type === 'UP',
                })} />
            </Button>
    
            <p className="text-center py-2 font-medium text-sm text-zinc-900">
                {votesAmt}
            </p>
    
            <Button onClick={() => vote('DOWN')} size='sm' variant='ghost' aria-label='downvote'>
                <ArrowBigDown className={cn('h-5 w-5 text-zinc-700', {
                    'text-red-500 fil-red-500': currentVote?.type === 'DOWN',
                })} />
            </Button>
        </div>
    );
}
 
export default CommentVoteClient;