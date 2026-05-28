
export default function PostCard({ post }: any) {
  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 hover:scale-[1.01] transition">
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          className="w-full object-cover"
        />
      )}

      {post.caption && (
        <div className="p-4 text-sm text-slate-200 leading-relaxed">
          {post.caption}
        </div>
      )}
    </div>
  );
}
