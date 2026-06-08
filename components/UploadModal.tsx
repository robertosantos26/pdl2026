"use client";

import { ChangeEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const MAX_IMAGE_WIDTH = 1280;
const MAX_IMAGE_HEIGHT = 1280;
const TARGET_IMAGE_SIZE = 250 * 1024;
const IMAGE_QUALITIES = [0.72, 0.6, 0.48, 0.38, 0.3];
const IMAGE_SCALE_STEPS = [1, 0.85, 0.7, 0.55];

function getCompressedDimensions(width: number, height: number, extraScale = 1) {
  const baseScale = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height, 1);
  const scale = baseScale * extraScale;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function sanitizeStorageName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const normalizedName = nameWithoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalizedName || "imagem";
}

function blobToFile(blob: Blob, originalName: string) {
  return new File([blob], `${sanitizeStorageName(originalName)}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Não foi possível carregar a imagem para compressão."));
      image.src = imageUrl;
    });

    let smallestBlob: Blob | null = null;

    for (const scaleStep of IMAGE_SCALE_STEPS) {
      const { width, height } = getCompressedDimensions(image.width, image.height, scaleStep);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        continue;
      }

      context.drawImage(image, 0, 0, width, height);

      for (const quality of IMAGE_QUALITIES) {
        const compressedBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/webp", quality);
        });

        if (!compressedBlob) {
          continue;
        }

        if (!smallestBlob || compressedBlob.size < smallestBlob.size) {
          smallestBlob = compressedBlob;
        }

        if (compressedBlob.size <= TARGET_IMAGE_SIZE) {
          return blobToFile(compressedBlob, file.name);
        }
      }
    }

    if (!smallestBlob || smallestBlob.size >= file.size) {
      return file;
    }

    return blobToFile(smallestBlob, file.name);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(file: File) {
  if (file.type === "image/webp") {
    return "webp";
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");

  return extension || "jpg";
}

function getStoragePath(file: File) {
  return `${Date.now()}-${sanitizeStorageName(file.name)}.${getFileExtension(file)}`;
}

export default function UploadModal({ onClose, refresh }: any) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState("");

  async function handleUpload() {
    if (!isSupabaseConfigured) {
      alert("Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel antes de publicar.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (file) {
        setCompressionInfo("Comprimindo imagem antes do envio...");
        const uploadFile = await compressImage(file);
        const filename = getStoragePath(uploadFile);

        if (uploadFile.size < file.size) {
          setCompressionInfo(
            `Imagem reduzida de ${formatFileSize(file.size)} para ${formatFileSize(uploadFile.size)}.`
          );
        }

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filename, uploadFile, {
            contentType: uploadFile.type || file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = filename;
      }

      const { error: postError } = await supabase.from("posts").insert({
        image_url: imageUrl,
        caption,
      });

      if (postError) {
        throw postError;
      }

      refresh();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido.";
      alert(`Não foi possível publicar a imagem: ${message}`);
      setCompressionInfo("");
    } finally {
      setLoading(false);
    }
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
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFile(e.target.files?.[0] ?? null);
            setCompressionInfo("");
          }}
          className="mb-3"
        />

        <p className="mb-6 text-xs text-slate-400">
          As imagens são comprimidas no máximo possível antes do envio para reduzir o peso no armazenamento e no banco de dados.
        </p>

        {compressionInfo && (
          <p className="mb-6 rounded-xl bg-slate-800 p-3 text-xs text-slate-300">
            {compressionInfo}
          </p>
        )}

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
            className="flex-1 bg-white text-black rounded-2xl py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
