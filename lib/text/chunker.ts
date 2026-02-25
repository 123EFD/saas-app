//helper function to split long text from PDF into single string, then call chunkText(text, 1000, 200) to produce array
export function chunkText(text: string, chunkSize = 1000, overlap = 200) {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();
        if (chunk) chunks.push(chunk);
        if (end === text.length) break;
        start = Math.max(0, end - overlap);
    }
    return chunks;
}