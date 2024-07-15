"use client"

import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize"
import {useForm} from 'react-hook-form'
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import {zodResolver} from "@hookform/resolvers/zod"
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { tr } from "date-fns/locale";

interface Editor {
    subredditId: string
}
 
const Editor: FC<Editor> = ({subredditId}) => {
    
    const {
        register,
        handleSubmit,
        formState: { errors },
     } = useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: '',
            content: null
    }
     })
    
    const ref = useRef<EditorJS>()
    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMounted(true)
        }
    }, [])
    
    const initalizeEditor = useCallback(async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default

        if (!ref.current) {
            const editor = new EditorJS({
              holder: 'editor',
              onReady() {
                ref.current = editor
              },
              placeholder: 'Type here to write your post...',
              inlineToolbar: true,
              data: { blocks: [] },
              tools: {
                header: Header,
                linkTool: {
                  class: LinkTool,
                  config: {
                    endpoint: '/api/link',
                  },
                },
                image: {
                  class: ImageTool,
                  config: {
                    uploader: {
                      async uploadByFile(file: File) {
                        // upload to uploadthing
                        try {
                          const files = [file]
                          const uploadThing = await uploadFiles('imageUploader', {
                            files,
                          })
                          console.log("uploadThing: ", uploadThing)
                          return {
                            success: 1,
                            file: {
                              url: uploadThing[0].url,
                            },
                          }
                        } catch (err) {
                          console.log('err: ', err)
                        }
                      },
                    },
                  },
                },
                list: List,
                code: Code,
                inlineCode: InlineCode,
                table: Table,
                embed: Embed,
              },
            })
          }
        }, [])

    useEffect(() => {
        const init = async () => {
            await initalizeEditor()

            setTimeout(() => {
                
            })
        }

        if(isMounted){
            init()
            return () => {}
        }
        
    }, [isMounted, initalizeEditor])

    return (
        <div className="w-full p-4 bg-zinv-50 rounded-lg border border-zinc-200">
            <form
                className="w-fit"
                onSubmit={() => {
                    
                }}
                id="subreddit-post-form"
            >
                <div className="prose prose-stone dark:prose-invert">
                    <TextareaAutosize placeholder="Title"
                        className="w-full resize-none appearance-none 
                        overflow-hidden bg-transparent text-5rxl font-bold focus:outline-none"
                    />
                    <div id='editor' className="min-h-[500px]" />
                
                </div>
            </form>
        </div>
    );
}
 
export default Editor;