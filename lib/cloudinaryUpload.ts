import { auth } from "@/lib/firebase";

type SignatureResponse = {
  signature?: string;
  timestamp?: string;
  cloudName?: string;
  apiKey?: string;
  folder?: string;
  overwrite?: string;
  uniqueFilename?: string;
  useFilename?: string;
  error?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;

  error?: {
    message?: string;
  };
};

const maximumFileSize =
  5 * 1024 * 1024;

function validateImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Please select a valid image file."
    );
  }

  if (file.size > maximumFileSize) {
    throw new Error(
      "The image must be smaller than 5 MB."
    );
  }
}

async function getUploadSignature() {
  const currentUser =
    auth?.currentUser;

  if (!currentUser) {
    throw new Error(
      "Please log in before uploading images."
    );
  }

  const idToken =
    await currentUser.getIdToken(true);

  const response = await fetch(
    "/api/cloudinary/signature",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${idToken}`,
      },

      cache: "no-store",
    }
  );

  const result =
    (await response.json()) as SignatureResponse;

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Unable to prepare image upload."
    );
  }

  if (
    !result.signature ||
    !result.timestamp ||
    !result.cloudName ||
    !result.apiKey ||
    !result.folder
  ) {
    throw new Error(
      "The image upload configuration is incomplete."
    );
  }

  return {
    signature: result.signature,
    timestamp: result.timestamp,
    cloudName: result.cloudName,
    apiKey: result.apiKey,
    folder: result.folder,

    overwrite:
      result.overwrite || "false",

    uniqueFilename:
      result.uniqueFilename || "true",

    useFilename:
      result.useFilename || "true",
  };
}

export async function uploadBusinessImage(
  file: File
): Promise<string> {
  validateImage(file);

  const uploadSignature =
    await getUploadSignature();

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "api_key",
    uploadSignature.apiKey
  );

  formData.append(
    "timestamp",
    uploadSignature.timestamp
  );

  formData.append(
    "signature",
    uploadSignature.signature
  );

  formData.append(
    "folder",
    uploadSignature.folder
  );

  formData.append(
    "overwrite",
    uploadSignature.overwrite
  );

  formData.append(
    "unique_filename",
    uploadSignature.uniqueFilename
  );

  formData.append(
    "use_filename",
    uploadSignature.useFilename
  );

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${uploadSignature.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadResult =
    (await uploadResponse.json()) as CloudinaryUploadResponse;

  if (
    !uploadResponse.ok ||
    !uploadResult.secure_url
  ) {
    throw new Error(
      uploadResult.error?.message ||
        "Unable to upload the image."
    );
  }

  return uploadResult.secure_url;
}
