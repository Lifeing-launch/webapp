"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "../ui/button";
import Image from "next/image";
import { CloudinaryImageData, UploadWidget } from "./upload-widget";
import { FallbackAvatar } from "./fallback-avatar";

interface IProfilePicture {
  currentUrl?: string;
  userInitials: string;
  onUpload?: (url?: string) => void;
}

export const ProfilePicture = ({
  currentUrl,
  userInitials,
  onUpload,
}: IProfilePicture) => {
  const [profileImage, setProfileImage] = useState<CloudinaryImageData | null>(
    null
  );
  const uploadWidgetRef = useRef<(() => void) | null>(null);

  const handleUpdateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (uploadWidgetRef.current) {
      uploadWidgetRef.current();
    }
  };

  const handleImageUpload = (imageData: CloudinaryImageData) => {
    setProfileImage(imageData);
    onUpload?.(imageData.url);
  };

  function renderImage() {
    if (profileImage) {
      return (
        <CldImage
          src={profileImage.url}
          width="100"
          height="100"
          alt="sample"
          crop={{
            type: "auto",
            source: true,
          }}
        />
      );
    } else if (currentUrl) {
      return <Image src={currentUrl} alt="" layout="fill" objectFit="cover" />;
    } else {
      return <FallbackAvatar userInitials={userInitials} />;
    }
  }

  return (
    <div>
      <div className="relative w-24 h-24 rounded-full overflow-hidden">
        {renderImage()}
      </div>

      <Button
        variant={"link"}
        onClick={handleUpdateClick}
        className="text-sm p-0 cursor-pointer"
      >
        Update photo
      </Button>
      <UploadWidget onUpload={handleImageUpload} ref={uploadWidgetRef} />
    </div>
  );
};
