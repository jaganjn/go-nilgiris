import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
  }>;
};

type FirestoreAccountResponse = {
  fields?: {
    role?: {
      stringValue?: string;
    };
    status?: {
      stringValue?: string;
    };
  };
};

function createCloudinarySignature(
  parameters: Record<string, string>,
  apiSecret: string
) {
  const parameterString = Object.entries(
    parameters
  )
    .sort(([firstKey], [secondKey]) => {
      if (firstKey < secondKey) {
        return -1;
      }

      if (firstKey > secondKey) {
        return 1;
      }

      return 0;
    })
    .map(
      ([key, value]) =>
        `${key}=${value}`
    )
    .join("&");

  return createHash("sha1")
    .update(
      `${parameterString}${apiSecret}`
    )
    .digest("hex");
}

export async function POST(
  request: Request
) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  const firebaseApiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const firebaseProjectId =
    process.env
      .NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret
  ) {
    return NextResponse.json(
      {
        error:
          "Cloudinary environment variables are missing.",
      },
      {
        status: 500,
      }
    );
  }

  if (
    !firebaseApiKey ||
    !firebaseProjectId
  ) {
    return NextResponse.json(
      {
        error:
          "Firebase environment variables are missing.",
      },
      {
        status: 500,
      }
    );
  }

  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return NextResponse.json(
      {
        error:
          "Authentication is required.",
      },
      {
        status: 401,
      }
    );
  }

  const idToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!idToken) {
    return NextResponse.json(
      {
        error:
          "Invalid authentication token.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const lookupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          idToken,
        }),

        cache: "no-store",
      }
    );

    if (!lookupResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Your login session is invalid or expired.",
        },
        {
          status: 401,
        }
      );
    }

    const lookupData =
      (await lookupResponse.json()) as FirebaseLookupResponse;

    const uid =
      lookupData.users?.[0]?.localId;

    if (!uid) {
      return NextResponse.json(
        {
          error:
            "Unable to identify the logged-in account.",
        },
        {
          status: 401,
        }
      );
    }

    const accountResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/accounts/${uid}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },

        cache: "no-store",
      }
    );

    if (!accountResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Unable to verify your Go Nilgiris account.",
        },
        {
          status: 403,
        }
      );
    }

    const accountData =
      (await accountResponse.json()) as FirestoreAccountResponse;

    const role =
      accountData.fields?.role
        ?.stringValue;

    const status =
      accountData.fields?.status
        ?.stringValue;

    const allowedRole =
      role === "owner" ||
      role === "admin";

    if (
      !allowedRole ||
      status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Only approved owners and administrators can upload business images.",
        },
        {
          status: 403,
        }
      );
    }

    const timestamp = Math.floor(
      Date.now() / 1000
    ).toString();

    const uploadParameters = {
      folder:
        "go-nilgiris/businesses",

      overwrite: "false",

      timestamp,

      unique_filename: "true",

      use_filename: "true",
    };

    const signature =
      createCloudinarySignature(
        uploadParameters,
        apiSecret
      );

    return NextResponse.json({
      signature,
      timestamp,

      cloudName,
      apiKey,

      folder:
        uploadParameters.folder,

      overwrite:
        uploadParameters.overwrite,

      uniqueFilename:
        uploadParameters.unique_filename,

      useFilename:
        uploadParameters.use_filename,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to prepare the image upload.",
      },
      {
        status: 500,
      }
    );
  }
}
