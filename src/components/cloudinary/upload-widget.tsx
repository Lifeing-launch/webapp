"use client";

import { CldUploadWidget } from "next-cloudinary";
import type {
  CloudinaryUploadWidgetResults,
  CloudinaryUploadWidgetOptions,
} from "next-cloudinary";

export interface CloudinaryImageData {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

export type CloudinaryUploadConfig = {
  uploadPreset: string;
  dragDropTitle: string;
  dropTitle: string;
  crop?: {
    cropping: boolean;
    croppingAspectRatio?: number;
    croppingShowDimensions?: boolean;
  };
};

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

export const CLOUDINARY_UPLOAD_CONFIG: Record<string, CloudinaryUploadConfig> =
  {
    profilePicture: {
      uploadPreset: "profile-pictures",
      dragDropTitle: "Drag and drop your profile picture here",
      dropTitle: "Drop your profile picture here",
    },
    dashboardBanner: {
      uploadPreset: "dashboard-banner",
      dragDropTitle: "Drag and drop your custom cover image here",
      dropTitle: "Drop your custom cover image here",
      crop: {
        cropping: true,
        croppingAspectRatio: 5.6,
        croppingShowDimensions: true,
      },
    },
  };

export const UploadWidget = ({
  onUpload,
  ref,
  config,
}: {
  onUpload: (image: CloudinaryImageData) => void;
  ref: React.RefObject<(() => void) | null>;
  config: CloudinaryUploadConfig;
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
      uploadPreset={config.uploadPreset}
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
              dd_title_single: config.dragDropTitle,
              drop_title_single: config.dropTitle,
            },
          },
        },
        sources: SOURCE_TYPES,
        clientAllowedFormats: ALLOWED_FORMATS,
        maxFileSize: MAX_FILE_SIZE,
        maxImageFileSize: MAX_FILE_SIZE,
        ...(config.crop || {}),
      }}
    >
      {({ open }: { open: () => void }) => {
        ref.current = open;
        return null;
      }}
    </CldUploadWidget>
  );
};
