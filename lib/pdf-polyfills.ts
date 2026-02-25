// lib/pdf-polyfills.ts
// Server-only runtime polyfills for pdf-parse/pdfjs when running in Node.
// Install: npm install @napi-rs/canvas dommatrix
export async function PdfPolyfills(): Promise<void> {
    // don't run in browser or during client bundling
    if (typeof window !== "undefined") return;

    // Use non-static import strings so bundlers can't resolve at build-time
    let napiCanvasModule: any = null;
    let domMatrixModule: any = null;

    try {
        // Trick bundlers by splitting the package name into parts
        napiCanvasModule = await import("@" + "napi-rs/canvas").catch((e) => { throw e; });
    } catch (err) {
        console.warn("Optional dependency @napi-rs/canvas not available at runtime:", err);
    }

    try {
        // dommatrix sometimes exports default or named; use dynamic import similarly
        domMatrixModule = await import("dom" + "matrix").catch((m) => m);
    } catch (err) {
        console.warn("Optional dependency dommatrix not available at runtime:", err);
    }

    if (napiCanvasModule && (napiCanvasModule as any).ImageData) {
        (globalThis as any).ImageData = (napiCanvasModule as any).ImageData;
    }

    const maybeDOMMatrix =
        domMatrixModule?.DOMMatrix ??
        domMatrixModule?.default ??
        domMatrixModule?.matrix ??
        domMatrixModule;

    if (maybeDOMMatrix) {
        (globalThis as any).DOMMatrix = maybeDOMMatrix;
    }

    if (typeof (globalThis as any).Path2D === "undefined") {
        (globalThis as any).Path2D = class Path2D {
            constructor(_path?: string | any) { }
            addPath() { }
            arc() { }
            arcTo() { }
            bezierCurveTo() { }
            closePath() { }
            ellipse() { }
            lineTo() { }
            moveTo() { }
            quadraticCurveTo() { }
            rect() { }
        };
    }
}