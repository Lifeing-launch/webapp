"use client";

import { CldUploadWidget } from "next-cloudinary";
import type {
  CloudinaryUploadWidgetResults,
  CloudinaryUploadWidgetOptions,
} from "next-cloudinary";

const PRIMARY_COLOR = "#805b87";
const MAX_FILE_SIZE = 10000000; // 10MB
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];
const SOURCE_TYPES: CloudinaryUploadWidgetOptions["sources"] = [
  "local",
  "camera",
  "url",
];
const FONT_FAMILY =
  'ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"';

export interface CloudinaryImageData {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

export const UploadWidget = ({
  onUpload,
  ref,
}: {
  onUpload: (image: CloudinaryImageData) => void;
  ref: React.RefObject<(() => void) | null>;
}) => {
  const handleUpload = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info !== "string") {
      const imageData = {
        url: result.info.secure_url,
        public_id: result.info.public_id,
        width: result.info.width,
        height: result.info.height,
      };

      onUpload(imageData);
    }
  };

  return (
    <CldUploadWidget
      onSuccess={handleUpload}
      uploadPreset="profile-pictures"
      options={{
        multiple: false,
        styles: {
          palette: {
            tabIcon: PRIMARY_COLOR,
            link: PRIMARY_COLOR,
            action: PRIMARY_COLOR,
            inProgress: PRIMARY_COLOR,
          },
          fonts: {
            default: FONT_FAMILY,
          },
        },
        text: {
          en: {
            local: {
              browse: "Upload",
              dd_title_single: "Drag and drop your profile picture here",
              drop_title_single: "Drop your profile picture here",
            },
          },
        },
        sources: SOURCE_TYPES,
        clientAllowedFormats: ALLOWED_FORMATS,
        maxFileSize: MAX_FILE_SIZE,
        maxImageFileSize: MAX_FILE_SIZE,
        // croppingAspectRatio: 1,
      }}
    >
      {({ open }: { open: () => void }) => {
        ref.current = open;
        return null;
      }}
    </CldUploadWidget>
  );
};
