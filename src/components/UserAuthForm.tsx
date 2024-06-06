"use client"

import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { useEffect, useState } from "react";
import {signIn} from 'next-auth/react'
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

const UserAuthForm = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()
    
    useEffect(() => {
                console.log(isLoading)

        if (isLoading == true) {
            loginWithGoogle_2()
        }
    }, [isLoading])  // pass `value` as a dependency
    

    const loginWithGoogle_1 = () => {
        setIsLoading(true) 
        // console.log(isLoading)


        
    }

    const loginWithGoogle_2 = async () => {
        try {
            // throw new Error()
            await signIn('google')
        } catch (error) {
            // toast notification
            toast({
                title: "There was a problem.",
                description: "There was an error logging in with google.",
                variant: "destructive"
            })

        } finally {
            setIsLoading(false)
            console.log(isLoading)

        }
    }

    return (
        <div className='flex justify-center'>
            <Button
                onClick={loginWithGoogle_1}
                isLoading={isLoading}
                size='sm'
                className="w-full"
            >
                {isLoading ? null : <Icons.google className="h-4 w-4 mr-2"/>}
                Google
            </Button>
        </div>
    )
}
 
export default UserAuthForm;