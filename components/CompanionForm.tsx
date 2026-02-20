"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"
import { subjects } from "@/constants"
import { Textarea } from "./ui/textarea"
import { createCompanion } from "@/lib/actions/companion.actions"
import React, { useState } from "react"
import { Paperclip, X } from "lucide-react"
import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1, {message: "Username must be at least 2 characters."}),
    subject: z.string().min(1, {message: "Subject must be at least 2 characters."}),
    topic: z.string().min(1, {message: "Topic must be at least 2 characters."}),
    voice: z.string().min(1, {message: "Voice must be at least 2 characters."}),
    style: z.string().min(1, {message: "Style must be at least 2 characters."}),
    duration: z.coerce.number().min(1, {message: "Duration must be at least 2 characters."}),
    attachmentUrl : z.string().optional(),
})

const CompanionForm = () => {
    const {session} = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            subject: "",
            topic: "",
            voice: "",
            style: "",
            duration: 15,
            attachmentUrl: "",
        },
    })

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) setFile(selectedFile);
    };

    const uploadToServer = async (file: File) => {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
        });

        const json = await res.json();
        if (!res.ok) {
            console.error("Upload endpoint response:", json);
            throw new Error(json?.error?.message || json?.error || "Upload failed");
        }
        return json.path as string;
    };

     // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setUploading(true);
        try {
            if (!session) {
                throw new Error("You must be signed in to upload files.");
            }

            let attachmentUrl = "";
            if (file) {
                attachmentUrl = await uploadToServer(file);
            }
                
            const companion = await createCompanion({...values, attachmentUrl});

            if (companion) {
                router.push(`/companions/${companion.id}`);
            }
        } catch (error:any) {
            console.error("Failed to upload", error.message || error);
            try { console.dir(error); } catch (e) {
                console.error("Failed to log error", e);
            }
        } finally {
            setUploading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Companion name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the companion name" {...field} className="input" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    
                                >
                                    <SelectTrigger className="input capitalize">
                                        <SelectValue placeholder="Select the subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem
                                                value={subject}
                                                key={subject} 
                                                className="capitalize"
                                                >
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What should the companion can help with?</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ex. Derivative & Integration"
                                    {...field}
                                    className="input" />
                            </FormControl>
                            <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer bg-secondary px-3 py-2 rounded-md hover:opacity-80 transition">
                                            <Paperclip className="h-4 w-4"/>
                                            <span className="text-sm">Upload PDF or Image</span>
                                            <input 
                                                type="file"
                                                className="hidden"
                                                accept=".pdf, .jpg, .jpeg, .png"
                                                onChange={onUpload}
                                                />
                                        </label>
                                        {file && (
                                            <div className="flex items-center gap-1 text-sm text-indigo-400">
                                                {file.name}
                                                <X className="h-4 w-4 cursor-pointer" onClick={() => setFile(null)} />
                                            </div>
                                        )}
                            </div>      
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Voice</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    
                                >
                                    <SelectTrigger className="input">
                                        <SelectValue placeholder="Select the voice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        
                                            <SelectItem value="male">
                                                    Male
                                            </SelectItem>
                                            
                                            <SelectItem value="female">
                                                    Female
                                            </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Style</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    
                                >
                                    <SelectTrigger className="input">
                                        <SelectValue placeholder="Select the style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        
                                            <SelectItem value="formal">
                                                    Formal
                                            </SelectItem>
                                            
                                            <SelectItem value="casual">
                                                    Casual
                                            </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estimation session duration in minutes</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Enter the duration"
                                    {...field}
                                    className="input"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button 
                    type="submit" 
                    className="w-full cursor-pointer bg-indigo-500"
                    >
                        {uploading ? "Uploading..." : "Build Your Own Companion"}
                </Button>
            </form>
        </Form>
    )
}

export default CompanionForm