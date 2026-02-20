//call HuggingFace embeddings API with batch and single helpers, using POST an array to embed multiple texts in batch

export async function getHfEmbeddingsBatch(text: string[], model = "sentence-transformers/all-MiniLM-L6-v2"): Promise<number[][]> {
    const HF_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_KEY) throw new Error("Missing HUGGINGFACE_API_KEY env var");

    const res = await fetch(`https://api-inference.huggingface.co/embeddings/${encodeURIComponent(model)}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HuggingFace embeddings request failed: ${res.status} ${body}`);
    }

    const json = await res.json();
    // HF returns { embeddings: [...] } or directly array depending on model; normalize:
    // Example response: { "embedding": [...]} or { "data": [{ "embedding": [...] }] } - check your model's response format
    // The inference embeddings endpoint typically returns { "embedding": [...] } or {"embeddings":[...]}
    if (Array.isArray(json.embedding)) return json.embedding as number[][];
    if (Array.isArray(json)) return json.map((item: any) => item.embedding ?? item);
    if (Array.isArray(json[0]?.embedding)) return json.map((item: any) => item.embedding as number[]);
    if (Array.isArray(json.data)) return json.map((d: any) => d.embedding);
    if (Array.isArray(json.embedding)) return [json.embedding as number[]];

    throw new Error("Unexpected Hugging Face embeddings response shape: " + JSON.stringify(json).slice(0, 200));
}

export async function getHfEmbedding(text: string, model = "sentence-transformers/all-MiniLM-L6-v2") {
    const results = await getHfEmbeddingsBatch([text], model);
    return results[0];
}