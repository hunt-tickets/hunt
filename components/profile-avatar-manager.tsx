"use client";

import { useState, useRef } from "react";
import { User, Upload, Camera } from "lucide-react";
import { toast } from "@/lib/toast";

interface ProfileAvatarManagerProps {
  currentImage: string | null;
  userName: string | null;
}

export function ProfileAvatarManager({
  currentImage,
  userName,
}: ProfileAvatarManagerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImage
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error({ title: "La imagen no debe superar 5MB" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error({ title: "El archivo debe ser una imagen" });
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Aquí iría la lógica para subir la imagen al servidor
      // const formData = new FormData();
      // formData.append("image", file);
      // await uploadProfileImage(formData);

      toast.success({ title: "Imagen actualizada correctamente" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error({ title: "Error al subir la imagen" });
      setImagePreview(currentImage);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex-shrink-0 group">
      {/* Avatar Display */}
      <div
        onClick={handleClick}
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full cursor-pointer transition-all"
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt={userName || "Usuario"}
            className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-[#2a2a2a] group-hover:border-gray-300 dark:group-hover:border-[#3a3a3a] transition-colors"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary/20 dark:to-primary/5 border-2 border-gray-200 dark:border-[#2a2a2a] group-hover:border-gray-300 dark:group-hover:border-[#3a3a3a] flex items-center justify-center transition-colors">
            <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-600 dark:text-primary" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-white mx-auto mb-1" />
            <p className="text-xs text-white font-medium">
              {imagePreview ? "Cambiar" : "Subir"}
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isUploading}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-white/40 text-center mt-2">
        {imagePreview ? "Click para cambiar" : "Click para subir foto"}
      </p>
    </div>
  );
}
