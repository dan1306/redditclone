"use client"

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandInput } from "./ui/command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Subreddit, Prisma } from "@prisma/client";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { User, Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {
    
}
 
const SearchBar: FC<SearchBarProps> = () => {

    const [input, setInput] = useState<string>('')
    const router = useRouter()



    const {data: queryResult, refetch, isFetched, isFetching} = useQuery({
        queryFn: async () => {
            if (!input) return []
            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ['search-query'],
        enabled: false,
    })

    const request = debounce(() => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(() => {
        request()
    }, [])

    const commandRef = useRef<HTMLDivElement>(null)
    const pathName = usePathname()

    // useOnClickOutside(commandRef, () => {
    //     setInput('')
    // })

    // useEffect(() => {
    //     setInput('')
    // }, [pathName])
    return (
        <Command ref={commandRef} className="relative rounded-lg max-w-lg z-50 overflow-visible">
            <CommandInput
                value={input}
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}
                className="outline-none border-none focus:border-none focus:outline-none ring-0"
                placeholder="Search Communities..."
            />

            {input.length > 0 ? (
                <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
                    {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
                    {(queryResult?.length ?? 0) > 0 ? (
                        <CommandGroup heading='Communities'>
                            {queryResult?.map((subreddit) => (
                                <CommandItem key={subreddit.id} value={subreddit.name} onSelect={(e) => {
                                    router.push(`/r/${e}`)
                                    router.refresh()
                                }}>
                                    <div className="">
                                        <Users className="mr-2 h-4 w-4 inline-block" />
                                        <a className="inline-block" href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                                    </div>
         
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            ):(null)}
        </Command>
    );
}
 
export default SearchBar;