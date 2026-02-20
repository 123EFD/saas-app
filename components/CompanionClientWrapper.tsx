"use client";

import { useState } from "react";
import CompanionComponent from "./CompanionComponent";
import SessionNoteWrapper from "./sessionNoteWrapper";

export default function CompanionClientWrapper({ companion, user }: any) {
    // This state is now shared between both components
    const [messages, setMessages] = useState<any[]>([]);

    return (
        <>
            <CompanionComponent
                {...companion}
                companionId={companion.id}
                userName={user.name}
                userImage={user.imageUrl}
                messages={messages}
                setMessages={setMessages}
            />

            <SessionNoteWrapper
                companionId={companion.id}
                companionName={companion.name}
                subject={companion.category || "General"}
                messages={messages}
            />
        </>
    );
}