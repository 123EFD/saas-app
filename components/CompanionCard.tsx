"use client";

import  { useState }  from "react";
import { deleteCompanion } from "@/lib/actions/companion.actions";
import { removeBookmark } from "@/lib/actions/companion.actions";
import { addBookmark } from "@/lib/actions/companion.actions";
import { Notebook, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CompanionCardProps {
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked: boolean;
}

const CompanionCard = ({
    id,
    name,
    topic,
    subject,
    duration,
    color,
    bookmarked,
}: CompanionCardProps) => {
    const pathname = usePathname();
    const [isLaunching, setIsLaunching] = useState(false);

    // Function to determine if a color is dark or light
    const isDarkColor = (color: string) => {
        // If color is in hex format
        if (color.startsWith('#') && color.length === 7) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            // Calculate brightness using the formula: (R*299 + G*587 + B*114) / 1000
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128;
        }
        // Default to true for other color formats (assume dark)
        return true;
    };

    const isDarkBackground = isDarkColor(color);
    const textColorClass = isDarkBackground ? 'text-white' : 'text-gray-900';
    const textMutedClass = isDarkBackground ? 'text-gray-200' : 'text-gray-700';

    const handleBookmark = async () => {
        if (bookmarked) {
            await removeBookmark(id, pathname);
        } else {
            await addBookmark(id, pathname);
        }
    };

    const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this companion?");
    if (!confirmDelete) return;

    try {
        await deleteCompanion(id, pathname);
        alert("Companion deleted successfully.");
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete companion.");
    }
  };

    return (
        <article className="companion-card" style={{ backgroundColor: color }}>
        <div className="flex justify-between items-center">
            <div className={`subject-badge ${textColorClass}`} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>{subject}</div>
            <button
                className="companion-bookmark bg-background/30 backdrop-blur-sm"
                onClick={handleBookmark}
                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
            <Image
                src={
              bookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
                alt="bookmark"
                width={12.5}
                height={15}
            />
            </button>
        </div>

        <h2 className={`text-2xl font-bold ${textColorClass}`}>{name}</h2>
        <p className={`text-sm ${textMutedClass}`}>{topic}</p>

        <div className="flex items-center gap-2">
            <Image
                src="/icons/clock.svg"
                alt="duration"
                width={13.5}
                height={13.5}
            />
            <p className={`text-sm ${textMutedClass}`}>{duration} minutes</p>
        </div>

        <Link href={`/companions/${id}`} className="w-full">
            <button 
                disabled={isLaunching}
                onClick={() => setIsLaunching(true)}
                className={`btn-primary w-full justify-center ${isDarkBackground ? 
                    'bg-white text-gray-900' : 'bg-gray-900 text-white'}
                        ${isLaunching ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLaunching ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            <span>Launching...</span>
                        </>
                    ) : (
                        "Launch Lesson"
                    )}
            </button>
        </Link>
        <button
            className="w-full justify-center mt-2 py-2 rounded-lg border border-red-400 bg-gradient-to-r from-red-500 via-pink-500 to-red-400 text-white font-semibold shadow-lg hover:scale-105 hover:bg-gradient-to-l transition-all duration-200 flex items-center gap-2"
            onClick={handleDelete}
        >
            Delete Companion
        </button>
        <div className="flex justify-between items-center mt-4">
            <Link href={`/companions/${id}`} className="...">
                Chat
            </Link>

            <Link 
                href={`/notes?subject=${subject}`} // Deep link to filtered notes!
                className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1"
            >
                <Notebook size={14} />
                View Notes
            </Link>
        </div>
        </article>
    );
};

export default CompanionCard;