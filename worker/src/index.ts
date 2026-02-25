/*
Worker polls companion_jobs and process queued PDF by downloading the file from supabase and 
parses text with pdf-parse and stores the text aswell as chunks text to call HF embeddings and 
inserts into companion_documents + companion_embeddings
*/


import http from "http";
import { createClient } from "@supabase/supabase-js";

import { processAndStoreEmbeddings } from "lib/actions/embeddings.actions.ts";
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 2000); //todo-1
const PORT = Number(process.env.PORT ?? 8080); //todo-2

if (typeof (globalThis as any).fetch === "undefined") {
    (globalThis as any).fetch = fetch;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

//Apply runtime polyfills for pdf-parse (ImageData/DOMMatrix/Path2D)

async function applyPdfPolyfills() {
    try {
        const canvasModule = await import("@" + "napi-rs/canvas").catch((e) => { throw e; });
        const domMatrixModule = await import("dom" + "matrix").catch((e) => { throw e; });
        if (canvasModule && (canvasModule as any).ImageData) {
            (globalThis as any).ImageData = (canvasModule as any).ImageData;
        }
        const maybeDOMMatrix = (domMatrixModule as any)?.DOMMatrix ?? (domMatrixModule as any)?.default ?? (domMatrixModule as any);
        if (maybeDOMMatrix) {
            (globalThis as any).DOMMatrix = maybeDOMMatrix;
        }

        if (typeof (globalThis as any).Path2D === "undefined") {
        (globalThis as any).Path2D = class Path2D {
            constructor(_path?: string | any) {}
            addPath() {}
            arc() {}
            arcTo() {}
            bezierCurveTo() {}
            closePath() {}
            ellipse() {}
            lineTo() {}
            moveTo() {}
            quadraticCurveTo() {}
            rect() {}
            };
        }
        console.log("PDF polyfills applied.");
    }   catch (error) {
        console.error("Failed to apply PDF polyfills:", error);
    }
}

// helper: parse PDF buffer
async function parsePdfBuffer(buffer: Buffer) {
    // dynamic import pdf-parse to avoid surprising bundling in other contexts
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const parsed = await pdfParse(buffer);
    return parsed?.text ?? "";
}

// Process a single job
async function processJob(job: any) {
    console.log("Processing job", job.id, "companion", job.companion_id);
  // fetch companion to get attachment url
    const { data: compRows, error: compErr } = await supabase
        .from("companions")
        .select("attachment_url")
        .eq("id", job.companion_id)
        .limit(1);

    if (compErr) throw compErr;
    const attachment = compRows?.[0]?.attachment_url;
    if (!attachment) throw new Error("No attachment_url for companion " + job.companion_id);

    // download file
    const { data: downloadData, error: downloadErr } = await supabase.storage.from("attachments").download(attachment);
    if (downloadErr || !downloadData) throw downloadErr ?? new Error("Failed to download attachment");

    const arrayBuffer = await downloadData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // parse pdf
    const text = await parsePdfBuffer(buffer);
    console.log("Parsed text length:", text.length);

    //insert document
    const filename  = attachment.split("/").pop() || "unknown.pdf";
    const { data: docData, error: docErr } = await supabase
        .from("companion_documents")
        .insert({ companion_id: job.companion_id, filename: filename, content: text })
        .select();

    if (docErr) throw docErr;
    console.log("Inserted companion_document id:", docData?.[0]?.id);

    try {
        await processAndStoreEmbeddings(job.companion_id, text, { batchSize: 16 });
        console.log("processAndStoreEmbeddings completed for companion:", job.companion_id);
    } catch (err) {
        console.error("processAndStoreEmbeddings failed:", err);
        throw err;
    }

    // mark job done and optionally mark companion ready
    await supabase.from("companion_jobs").update({ state: "done", updated_at: new Date().toISOString() }).eq("id", job.id);
    await supabase.from("companions").update({ embedding_status: "ready" }).eq("id", job.companion_id);
}

async function pollLoop() {
    console.log("Worker started, entering poll loop");
    for (;;) {
    try {
      // fetch a queued job 
        const { data: jobs, error: jobErr } = await supabase
            .from("companion_jobs")
            .select("*")
            .eq("state", "queued")
            .order("created_at", { ascending: true })
            .limit(1);

        if (jobErr) {
            console.error("Error fetching jobs:", jobErr);
            await new Promise((r) => setTimeout(r, 5000));
            continue;
        }

        if (!jobs || jobs.length === 0) {
            await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
            continue;
        }

        const job = jobs[0];
        // mark processing
        await supabase.from("companion_jobs").update({ state: "processing", updated_at: new Date().toISOString() }).eq("id", job.id);

        try {
            await processJob(job);
        } catch (err) {
            console.error("Job processing failed:", err);
            const attempts = (job.attempts || 0) + 1;
            const nextState = attempts >= 3 ? "failed" : "queued";
            await supabase.from("companion_jobs").update({ attempts, state: nextState, error: String(err), updated_at: new Date().toISOString() }).eq("id", job.id);
        }
        } catch (outerErr) {
        console.error("Polling loop error:", outerErr);
        await new Promise((r) => setTimeout(r, 5000));
        }
    }
}

// Start HTTP server + worker after applying polyfills
async function start() {
    await applyPdfPolyfills();

    const server = http.createServer((req, res) => {
        if (req.url === "/health" || req.url === "/") {
            res.writeHead(200, { "Content-Type":  "application/json"});
            res.end(JSON.stringify({ status: "ok", ts:Date.now() }))
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
        }
    });

    server.listen(PORT, () => {
        console.log(`Worker health server listening on port ${PORT}`);
        pollLoop().catch((err) => {
            console.error("Worker crashed:", err);
            process.exit(1);
        });
    });
}

start().catch((err) => {
    console.error("Worker start failed:", err);
    process.exit(1);
});

