
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import UploadModal from "@/components/UploadModal";
import PostCard from "@/components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(3);

  async function loadPosts() {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel Interno</h1>
            <p className="text-slate-400 mt-1">
              Feed anônimo da empresa
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
