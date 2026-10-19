# Local AI Workbench

A browser-based local-AI configuration calculator and tutor. Both modes estimate VRAM and explain the tradeoffs between weight precision, model capacity, context, KV cache, offload, overhead, and headroom.

## Run

Open `dist/index.html` in a browser, or serve `dist` with any static web server. No package install or build step is needed: the files in `dist` are both the editable source and the runnable build. Calculations run in the browser; no model is downloaded or executed. Settings are saved in browser local storage.

## Verify

With Node.js installed, run `node test.cjs`. The checks cover memory formulas and fit boundaries. For syntax checks, run `node --check dist/app.js` and `node --check dist/engine.js`.

## Files

- `dist/index.html`: interface and educational content
- `dist/style.css`: responsive design
- `dist/engine.js`: memory calculations
- `dist/app.js`: controls and GPU recommendation sampling
- `test.cjs`: calculation checks

## Assumptions

Planning estimates for one dense, text-only sequence with a generic full-attention architecture. The advanced controls expose the assumed layer count, KV heads, head dimension, cache precision, and runtime overhead. Model-specific metadata and actual runtime measurements should replace generic assumptions. No quality score or throughput benchmark is predicted. See the app's methodology section for formulas, limitations, and references.

Q4/Q8 denote approximate weight bit precision; 4K/8K context denotes token counts. The quantization control simulates a model file choice rather than converting a model.

## Publishing

GitHub is the project source record. The existing private Sites deployment uses a separate source mirror and hosting identity. Commit changes here and synchronize the same application files to that mirror before publishing. Hosting identity and credentials are intentionally excluded from this repository; no automatic GitHub-to-Sites deployment is configured.

## Live Hugging Face discovery

The discovery panel searches public GGUF repositories through the Hugging Face Hub API, sorted by downloads with pagination. Searches and metadata requests go directly from the browser to Hugging Face, without credentials. No model weight downloads occur inside the calculator. Internet access and Hugging Face CORS availability are required; manual calculator controls remain usable offline.

Inspecting a repository lists supported, complete GGUF files and combines split-shard sizes. Projectors and incomplete split sets are excluded. Other quantizations can use published file size without inventing an effective bits-per-weight value. Selecting a file uses its published byte size for weight memory. Dense full-attention Llama/Qwen2 configurations can supply cache dimensions; other architectures or missing metadata retain the current cache assumptions and are marked provisional. GGUF presence alone is not runtime compatibility verification. The selected file metadata and calculator controls are saved in browser local storage. The former six-model catalog is no longer exposed in the interface; Hugging Face search is the single model-selection flow.

## Comparing search results

Search expands each page (12 repositories) into model-file configurations with three concurrent metadata readers. Results update as repositories finish. File choices are deduplicated by repository and file. Fit is the default sort: Comfortable, Tight, Spill likely, Uncertain fit, with larger parameter counts first within each band. Parameter-count sorting groups size ranges; VRAM sorting shows lowest estimated use first. All sorts apply only to loaded pages. Unknown cache architectures, missing parameter counts or context limits, and selected context above the reported limit receive Uncertain fit. GPU, context, offload, cache precision, overhead, and reserve changes update results immediately. No throughput or reasoning-quality ranking is implied.

Run `node test-discovery.cjs` for discovery interaction checks with a simulated Hugging Face response.

## Memory fit versus confidence

Fit bands always describe estimated memory: Comfortable, Tight, Spill likely. Confidence is separate: Moderate for supported full-attention architectures with dimensions and context metadata; Low for unknown/hybrid/windowed architectures, missing fields, or context above the reported limit. Low-confidence Comfortable estimates are labeled Likely comfortable. Moderate does not mean measured or guaranteed. Supported profiles include Llama, Qwen2, dense Qwen3, Qwen3 MoE, and non-windowed Mistral/Phi3 configurations. MoE uses full published file sizes for weights, never active parameter count. Expert runtime buffers remain approximate. Hybrid models remain low confidence. Search requests text-generation GGUF repositories and excludes repositories explicitly marked as unrelated tasks when inspecting them.

## Hardware report import

Drop or choose a Windows DxDiag `.txt` or macOS System Information XML `.spx` report. Parsing runs in the browser; report content is not uploaded or stored. Dedicated GPU memory is read from graphics fields, not system RAM or shared-memory fields. With multiple reported dedicated GPUs, the largest is selected and stated in the status. Current slider rounding/clamping (2 GiB steps, 2�128 GiB) is disclosed when it affects the result. Apple silicon reports are recognized and leave settings unchanged until a unified-memory budget is implemented. Binary property-list exports are not supported in this version; XML exports are required.

Run `node test-spx.cjs` and `node test-dxdiag.cjs` for import parsing checks. No personal system report fixtures are included in the repository.
