const PUBLIC_UPLOADS_PATH = "/storage/v1/object/public/uploads/";

type Post = {
  image_url?: string | null;
  caption?: string | null;
};

function safelyDecode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(safelyDecode(segment)))
    .join("/");
}

function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "";
  }

  const trimmedUrl = imageUrl.trim();

  const publicUploadsIndex = trimmedUrl.indexOf(PUBLIC_UPLOADS_PATH);

  if (publicUploadsIndex >= 0) {
    const storagePathStart = publicUploadsIndex + PUBLIC_UPLOADS_PATH.length;

    return `${trimmedUrl.slice(0, storagePathStart)}${encodeStoragePath(
      trimmedUrl.slice(storagePathStart)
    )}`;
  }

  try {
    const url = new URL(trimmedUrl);
    const uploadPathIndex = url.pathname.indexOf(PUBLIC_UPLOADS_PATH);

    if (uploadPathIndex >= 0) {
      const storagePathStart = uploadPathIndex + PUBLIC_UPLOADS_PATH.length;
      const rawStoragePath = url.pathname.slice(storagePathStart);
      url.pathname = `${url.pathname.slice(0, storagePathStart)}${encodeStoragePath(rawStoragePath)}`;
    }

    return url.toString();
  } catch {
    return encodeStoragePath(trimmedUrl);
  }
}

export default function PostCard({ post }: { post: Post }) {
  const imageUrl = getImageUrl(post.image_url);

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 hover:scale-[1.01] transition">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={post.caption || "Imagem publicada"}
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
