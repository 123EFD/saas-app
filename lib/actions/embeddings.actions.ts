/**
 * Process parsed text: chunk, embed (batched), and store embeddings in companion_embeddings table.
 * This should be called once after parsing a PDF (in createCompanion).
 */
// processAndStoreEmbeddings() and retrieveRelevantChunks()
import { createServiceSupabaseClient } from "@/lib/supabase-service";
import { chunkText } from "@/lib/chunker";
import { getHfEmbeddingsBatch, getHfEmbedding } from "@/lib/embeddings/hf";

export async function processAndStoreEmbeddings(
    companionId: string,
    text: string,
    opts?:{chunkSize?: number, overlap?: number, batchSize?: number}
) {
    const chunkSize = opts?.chunkSize ?? 1000;
    const overlap = opts?.overlap ?? 200;
    const batchSize = opts?.batchSize ?? 16;

    const service = createServiceSupabaseClient();
    const chunks = chunkText(text, chunkSize, overlap);

    //Insert in batches to reduce requests
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        let embeddings: number[][];
        try {
            embeddings = await getHfEmbeddingsBatch(batch);
        } catch (err) {
            console.error("Embedding batch failed:", err);
            embeddings = [];
            for (const chunk of batch) {
                try {
                    embeddings.push(await getHfEmbedding(chunk));
                } catch (e) {
                    console.error("Single embedding failed, pushing zero vector:", e);
                    embeddings.push(new Array(384).fill(0)); // Push a zero vector of the expected dimensionality
                }
            }
        }

        const rows = batch.map((chunkText, idx) => ({
            companion_id: companionId,
            chunk_index: i + idx,
            content: chunkText,
            embedding: embeddings[idx],
        }));    

        const { error } = await service.from("companion_embeddings").insert(rows);
        if (error) {
            console.error("Failed to insert embedding rows:", error);
        }
    }

    return true;
}

/*retrieve top K chunks for a companion by embedding similarity using SQL RLC function */

export async function retrieveRelevantChunks(companionId: string , query: string, topK = 5) {
    const queryEmbedding = await getHfEmbedding(query);
    const supabase = createServiceSupabaseClient();
    const {data, error} =  await supabase.rpc("match_companion_embeddings", {
        comp_id: companionId,
        query_embedding: queryEmbedding,
        limit_count: topK,
    });

    if (error) {
        console.error("Error calling match_companion_embeddings:", error);
        throw error;
    }

    return data as Array<{id: string, content: string, distance: number}>;
}