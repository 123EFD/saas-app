import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {cn, getSubjectColor} from "@/lib/utils";
import Link from 'next/link';
import Image from 'next/image';

interface CompanionListProps {
    title: string;
    companions?: Companion[]; // Adjust type as necessary
    classNames?: string;
}

const CompanionsList = ({ title, companions, classNames }: CompanionListProps) => {
    function getSubjectColor(subject: string): string {
        // Map subjects to specific background colors
        const subjectColors: Record<string, string> = {
            math: "#FDE68A",
            science: "#A7F3D0",
            english: "#BFDBFE",
            history: "#FCA5A5",
            art: "#FBCFE8",
            music: "#DDD6FE",
            geography: "#FDBA74",
            // Add more subjects as needed
        };
        // Default color if subject not found
        return subjectColors[subject.toLowerCase()] || "#E5E7EB";
    }

    return (
        <article className={cn('companion-list', classNames)}>
            <h2 className='font-bold text-3xl'>{title}</h2>
            
        <Table>
            <TableHeader>
                <TableRow >
                    <TableHead className="text-lg w-2/3">Lessons</TableHead>
                    <TableHead className='text-lg'>Subject</TableHead>
                    <TableHead className='text-lg text-right'>Duration</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {companions?.map(({id, subject, name, topic, duration}) => (
                    <TableRow key={id}>
                        <TableCell>
                            <Link href={`/companions/${id}`}>
                                <div className="flex items-center gap-2">
                                    <div className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden" style={{ backgroundColor: getSubjectColor(subject) }}>                    
                                        <Image
                                            src={`/icons/${subject}.svg`} 
                                            alt={subject} 
                                            width={35} 
                                            height={35} />
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <p className='font-bold text-2xl'>
                                            {name}</p>
                                        <p className='text-lg'>
                                            {topic}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell>
                            <div className="subject-badge w-fit max-md:hidden">
                                {subject}
                            </div>
                            <div className="flex items-center ustify-center rounded-lg w-fit p-2 md:hidden"
                                            style={{backgroundColor:
                                            getSubjectColor(subject)}}>
                                <Image
                                    src={`/icons/${subject}.svg`} 
                                    alt={subject} 
                                    width={18} 
                                    height={18}
                                    />

                            </div>
                        </TableCell>
                        <TableCell>
                            <div className='flex items-center gap-2 w-full justify-end'>
                                <p className='text-2xl'>
                                    {duration} {' '}
                                    <span className='max-md:hidden'>mins</span>
                                </p>
                                <Image src="/icons/clock.svg" alt="minutes"
                                    width={14} height={14}
                                    className='md:hidden' />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </article>
    )
}

export default CompanionsList;