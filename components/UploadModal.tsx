
"use client";

import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function UploadModal({ onClose, refresh }: any) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!isSupabaseConfigured) {
      alert("Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel antes de publicar.");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    if (file) {
      const filename = `${Date.now()}-${file.name}`;

      await supabase.storage
        .from("uploads")
        .upload(filename, file);

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filename);

      imageUrl = data.publicUrl;
    }

    await supabase.from("posts").insert({
      image_url: imageUrl,
      caption,
    });

    refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-700">
        <h2 className="text-xl mb-4 font-semibold">Nova publicação</h2>

        <textarea
          placeholder="Escreva algo..."
          className="w-full h-32 bg-slate-800 rounded-2xl p-4 outline-none mb-4"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <input
          type="file"
          onChange={(e: any) => setFile(e.target.files[0])}
          className="mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 rounded-2xl py-3"
          >
            Cancelar
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 bg-white text-black rounded-2xl py-3 font-semibold"
          >
            {loading ? "Enviando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
