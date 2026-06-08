"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const UPLOADS_BUCKET = "uploads";
const PUBLIC_UPLOADS_PATH = `/storage/v1/object/public/${UPLOADS_BUCKET}/`;
const SIGNED_UPLOADS_PATH = `/storage/v1/object/sign/${UPLOADS_BUCKET}/`;

const STORAGE_PATH_MARKERS = [PUBLIC_UPLOADS_PATH, SIGNED_UPLOADS_PATH];

type Post = {
  image_url?: string | null;
  caption?: string | null;
};

function safelyDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(safelyDecode(segment)))
    .join("/");
}

function cleanStoragePath(path: string) {
  return path
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .map((segment) => safelyDecode(segment))
    .join("/")
    .replace(/^\/+/, "");
}

function getStoragePathFromUrl(imageUrl: string) {
  for (const marker of STORAGE_PATH_MARKERS) {
    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex >= 0) {
      return cleanStoragePath(imageUrl.slice(markerIndex + marker.length));
    }
  }

  return "";
}

function getStoragePath(imageUrl?: string | null) {
  if (!imageUrl) {
    return "";
  }

  const trimmedUrl = imageUrl.trim();

  if (!trimmedUrl) {
    return "";
  }

  const storagePathFromUrl = getStoragePathFromUrl(trimmedUrl);

  if (storagePathFromUrl) {
    return storagePathFromUrl;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmedUrl)) {
    return "";
  }

  return cleanStoragePath(trimmedUrl);
}

function getFallbackImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "";
  }

  const trimmedUrl = imageUrl.trim();
  const storagePath = getStoragePath(trimmedUrl);

  if (storagePath) {
    return supabase.storage
      .from(UPLOADS_BUCKET)
      .getPublicUrl(encodeStoragePath(storagePath)).data.publicUrl;
  }

  return trimmedUrl;
}

async function getRenderableImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "";
  }

  const trimmedUrl = imageUrl.trim();
  const storagePath = getStoragePath(trimmedUrl);

  if (!storagePath) {
    return trimmedUrl;
  }

  const encodedPath = encodeStoragePath(storagePath);
  const { data } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .createSignedUrl(encodedPath, 60 * 60);

  return data?.signedUrl || getFallbackImageUrl(storagePath);
}

export default function PostCard({ post }: { post: Post }) {
  const [imageUrl, setImageUrl] = useState(() => getFallbackImageUrl(post.image_url));
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setImageFailed(false);
    setImageUrl(getFallbackImageUrl(post.image_url));

    getRenderableImageUrl(post.image_url).then((resolvedUrl) => {
      if (isMounted) {
        setImageFailed(false);
        setImageUrl(resolvedUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [post.image_url]);

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 hover:scale-[1.01] transition">
      {imageUrl && !imageFailed && (
        <img
          src={imageUrl}
          alt={post.caption || "Imagem publicada"}
          className="w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}

      {imageFailed && (
        <div className="p-4 text-sm text-amber-100 bg-amber-500/10">
          Não foi possível carregar esta imagem. Verifique se o arquivo ainda existe no bucket uploads.
        </div>
      )}

      {post.caption && (
        <div className="p-4 text-sm text-slate-200 leading-relaxed">
          {post.caption}
        </div>
      )}
    </div>
  );
}
