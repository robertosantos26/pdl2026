
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import UploadModal from "@/components/UploadModal";
import PostCard from "@/components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(3);

  async function loadPosts() {
    if (!isSupabaseConfigured) {
      setPosts([]);
      return;
    }

    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              PDL 2026
            </p>
            <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Mural Empresarial Extraordinário
            </h1>
            <p className="mt-3 max-w-3xl font-serif text-lg italic leading-relaxed tracking-wide text-slate-300 md:text-xl">
              Publique aqui sua Visão extraordinária empresarial com a WMC dentro dos próximos 3 a 5 anos.
            </p>
          </div>

          <select
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
          >
            <option value={1}>1 coluna</option>
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
            <option value={4}>4 colunas</option>
          </select>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel para carregar e publicar posts.
          </div>
        )}

        <div
          className="masonry"
          style={{ columnCount: columns }}
        >
          {posts.map((post) => (
            <div key={post.id} className="masonry-item">
              <PostCard post={post} />
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 bg-white text-black w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition"
        >
          <Plus size={30} />
        </button>

        {open && (
          <UploadModal
            onClose={() => setOpen(false)}
            refresh={loadPosts}
          />
        )}
      </div>
    </main>
  );
}
