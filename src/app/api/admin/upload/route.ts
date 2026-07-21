import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `nominees/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("nominee-photos")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      {
        error:
          uploadError.message.includes("Bucket not found") ||
          uploadError.message.includes("not found")
            ? "Photo storage is not set up yet. Run supabase/storage.sql in the Supabase SQL Editor."
            : uploadError.message,
      },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("nominee-photos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
