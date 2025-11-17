import { useEffect, useRef, useState } from "react";

const presets = [
  { id: "grid-4", name: "2 x 2 Grid", rows: 2, cols: 2 },
  { id: "grid-6", name: "3 x 2 Grid", rows: 3, cols: 2 },
  { id: "grid-9", name: "3 x 3 Grid", rows: 3, cols: 3 },
  { id: "mosaic", name: "Mosaic", rows: 3, cols: 3, mosaic: true },
];

function cellStyle(r, c, rows, cols, mosaic) {
  if (!mosaic) return {};
  // Simple mosaic: make corners bigger
  const big = (r === 0 && c === 0) || (r === rows - 1 && c === cols - 1);
  return big ? { gridRow: "span 2", gridColumn: "span 2" } : {};
}

export default function CollageBuilder() {
  const [layout, setLayout] = useState(presets[0]);
  const [images, setImages] = useState([]);
  const [bg, setBg] = useState("#ffffff");
  const [gap, setGap] = useState(8);
  const canvasRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) handleFiles(files);
  };

  const onFilePick = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) handleFiles(files);
  };

  const handleFiles = (files) => {
    const readers = files.map(
      (file) =>
        new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res({ src: fr.result, name: file.name });
          fr.onerror = rej;
          fr.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((list) => setImages((prev) => [...prev, ...list]));
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "collage.png";
    a.click();
  };

  useEffect(() => {
    // Render onto canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1200; // square output
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const rows = layout.rows;
    const cols = layout.cols;
    const g = gap; // gap in px in final output

    // Compute grid cells
    const totalGapX = g * (cols + 1);
    const totalGapY = g * (rows + 1);
    const cellW = (size - totalGapX) / cols;
    const cellH = (size - totalGapY) / rows;

    // Prepare images elements
    const imgEls = [];
    let loaded = 0;

    const drawAll = () => {
      // Place images in row-major order
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = g + c * (cellW + g);
          const y = g + r * (cellH + g);
          const img = images[i];
          if (img) {
            const el = imgEls[i];
            // Cover strategy: fit image to cover the cell
            const ratioCell = cellW / cellH;
            const ratioImg = el.width / el.height;
            let dw, dh;
            if (ratioImg > ratioCell) {
              dh = cellH;
              dw = ratioImg * dh;
            } else {
              dw = cellW;
              dh = dw / ratioImg;
            }
            const dx = x + (cellW - dw) / 2;
            const dy = y + (cellH - dh) / 2;
            ctx.drawImage(el, dx, dy, dw, dh);
          }
          i++;
        }
      }
    };

    if (!images.length) return; // nothing to draw

    images.slice(0, rows * cols).forEach((img, idx) => {
      const el = new Image();
      el.onload = () => {
        imgEls[idx] = el;
        loaded++;
        if (loaded === Math.min(images.length, rows * cols)) drawAll();
      };
      el.src = img.src;
    });
  }, [images, layout, bg, gap]);

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Layout</h2>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setLayout(p)}
                className={`text-left p-3 rounded-lg border transition ${
                  layout.id === p.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.rows} rows • {p.cols} cols</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Appearance</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Background</span>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Gap</span>
              <input type="range" min="0" max="40" value={gap} onChange={(e)=>setGap(parseInt(e.target.value))} />
            </label>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Images</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-500 hover:border-gray-400"
          >
            Drag & drop images here
          </div>
          <div className="mt-3">
            <input type="file" multiple accept="image/*" onChange={onFilePick} />
          </div>
          {images.length > 0 && (
            <ul className="mt-3 max-h-40 overflow-auto text-sm text-gray-600 space-y-1">
              {images.map((img, i) => (
                <li key={i} className="truncate">{img.name || `Image ${i+1}`}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={downloadPNG}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow"
        >
          Download PNG
        </button>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-center min-h-[420px]">
        <div className="w-full max-w-[640px] aspect-square bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden">
          {/* Visual preview using CSS grid for quick feedback */}
          <div
            className={`grid w-full h-full p-2`}
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              gap: `${gap}px`,
              background: bg,
            }}
          >
            {Array.from({ length: layout.rows * layout.cols }).map((_, idx) => {
              const img = images[idx];
              return (
                <div key={idx} className="bg-white/40 rounded-md overflow-hidden border border-white/40">
                  {img ? (
                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400 text-xs">Drop image</div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Offscreen canvas for export */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
