"use client";

import { deleteCompanion } from "@/lib/actions/companion.actions";
import { removeBookmark } from "@/lib/actions/companion.actions";
import { addBookmark } from "@/lib/actions/companion.actions";
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
            <div className="subject-badge">{subject}</div>
            <button className="companion-bookmark" onClick={handleBookmark}>
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

        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm">{topic}</p>

        <div className="flex items-center gap-2">
            <Image
                src="/icons/clock.svg"
                alt="duration"
                width={13.5}
                height={13.5}
            />
            <p className="text-sm">{duration} minutes</p>
        </div>

        <Link href={`/companions/${id}`} className="w-full">
            <button className="btn-primary w-full justify-center">
            Launch Lesson
            </button>
        </Link>
        <button
            type="button"
            className=" btn-secondary w-full justify-center mt-2"
            onClick={handleDelete}
        >
            Delete Companion
        </button>
        </article>
    );
};

export default CompanionCard;