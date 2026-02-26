'use client';

import { useEffect, useRef, useState } from 'react'
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from '@/lib/actions/companion.actions';
import { Send } from 'lucide-react';
import { Paperclip, X, Loader2 } from 'lucide-react';
import { processChatAttachment } from '@/lib/actions/file-processing.actions';

interface SavedMessage {
    role: string;
    content: string;
}

interface CompanionComponentProps {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName: string;
    userImage: string;
    style: string;
    voice: string;
    messages: SavedMessage[];
    setMessages: React.Dispatch<React.SetStateAction<SavedMessage[]>>;
}

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED'
}

const CompanionComponent = ({ companionId, subject, topic, name, userName,
    userImage, style, voice, messages, setMessages }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false)
    const [textInput, setTextInput] = useState("");
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [attachment, setAttachment] = useState<{ path: string, type: string, name: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.path) {
                setAttachment({ path: result.path, type: file.type, name: file.name });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
    };



    useEffect(() => {
        if (lottieRef) {
            if (isSpeaking) {
                lottieRef.current?.play()
            } else {
                lottieRef.current?.stop()
            }
        }
    }, [isSpeaking, lottieRef])


    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            addToSessionHistory(companionId)
        }

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages((prev: any) => [newMessage, ...prev])
            }
        }

        const onSpeechStart = () => setIsSpeaking(true)

        const onSpeechEnd = () => setIsSpeaking(false)

        const onError = (error: Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        }
    }, [setMessages]);

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted);
    }

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)

        const assistantOverrides = {
            variableValues: {
                subject, topic, style
            },
            clientMessages: ["transcript"],
            serverMessages: [],
        }

        vapi.start(configureAssistant(voice, style), assistantOverrides)
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED)
        vapi.stop()
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || callStatus !== CallStatus.ACTIVE) return;

        let contextText = "";
        if (attachment) {
            const content = await processChatAttachment(attachment.path, attachment.type);
            contextText = `[File Attached: ${attachment.name}]\nContent/Description: ${content}\n\n`;
        }

        const fullMessage = `${contextText}${textInput}`;
        vapi.send({
            type: 'add-message',
            message: {
                role: 'user',
                content: fullMessage,
            },
        });

        setMessages((prev: any) => [{ role: 'user', content: fullMessage }, ...prev]);
        setTextInput("");
        setAttachment(null);
    };

    const renderMessage = (text: string) => {
        const keywords = topic.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        return text.split(/\s+/).map((word, i) => {
            const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
            const isKeyword = keywords.includes(cleanWord);
            return (
                <span key={i}>
                    {isKeyword ? <strong className='font-extrabold'>{word}</strong> : word}
                    {' '}
                </span>
            );
        });
    };

    return (
        <section className="flex flex-col h-full">
            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject) }}>
                        <div
                            className={
                                cn(
                                    'absolute transition-opacity duration-1000', callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-1001' : 'opacity-0', callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse'
                                )
                            }>
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit" />
                        </div>

                        <div className={cn('absolute transition-opacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0')}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                className='companion-lottie'
                            />

                        </div>
                    </div>
                    <p className='font-bold text-2xl'>{name}</p>
                </div>
                <div className='user-section'>
                    <div className='user-avatar'>
                        <Image src={userImage} alt={userName} width={170}
                            height={90} className='rounded-lg' />
                        <p className='font-bold text-2xl'>{userName}</p>
                    </div>
                    {callStatus === CallStatus.ACTIVE && (
                        <div className="flex flex-col gap-2 bg-slate-700 rounded-lg w-full p-2">
                            {attachment && (
                                <div className="flex items-center gap-2 bg-slate-600 px-2 py-1 rounded text-xs text-violet-200 w-fit">
                                    <span className="truncate max-w-[150px]">
                                        {attachment.name}
                                    </span>
                                    <button onClick={() => setAttachment(null)} className="hover:text-white">
                                        <X size={14}/>
                                    </button>
                                </div>
                            )}
                            <form
                            onSubmit={handleSendMessage}
                            className='flex items-center gap-2 bg-slate-700 w-full'>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                className='hidden'
                                accept="application/pdf,image/*"
                            />
                                
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className='p-2 text-slate-400 hover:text-cyan-400 transition-colors'
                                disabled={isUploading}
                                title='Send file'
                            >
                                {isUploading ? <Loader2 size={18} className='animate-spin'/>
                                    : <Paperclip size={18} />}
                            </button>

                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder='Type a message...'
                                className='bg-transparent flex-1 outline-none text-violet-300 text-sm px-2'
                            />
                            <button
                                type='submit'
                                className='p-2 bg-cyan-500 hover:bg-cyan-200 rounded-lg transition-all active:scale-95'
                                disabled={(!textInput.trim() && !attachment) || isUploading}
                                title='Send message'
                            >
                                <Send size={16} className='text-violet-400'/>

                            </button>
                            </form>
                        </div>

                    )}
                    <button className='btn-mic' onClick={toggleMicrophone} disabled={callStatus !== CallStatus.ACTIVE}>
                        <Image src={isMuted ? '/icons/mic-off.svg' :
                            '/icons/mic-on.svg'} alt='mic' width={36} height={36} />
                        <p className='max-sm:hidden'>
                            {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                        </p>
                    </button>
                    <button className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white',
                        callStatus === CallStatus.ACTIVE ? 'bg-cyan-400' : 'bg-primary', callStatus === CallStatus.CONNECTING && 'animate-pulse')}
                        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}>
                        {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting'
                                : 'Start Session'
                        }
                    </button>
                </div>
            </section>

            <section className='transcript'>
                <div className='transcript-message no-scrollbar'>
                    {messages.map((message, index) => {
                        if (message.role === 'assistant') {
                            return (
                                <p key={index} className='max-sm:text-sm'>
                                    {
                                        name.split(' ')[0]
                                    }: {renderMessage(message.content)}
                                </p>
                            )
                        } else {
                            return <p key={index} className='text-primary max-sm:text-sm'>
                                {userName} : {message.content}
                            </p>
                        }
                    })}
                </div>

                <div className='transcript-fade'></div>
            </section>
        </section>
    )
}

export default CompanionComponent