"use server";
import { supabase } from "./supabase";

export async function uploadImageToSupabase(buffer: Buffer, imageName: string) {
  const { error } = await supabase.storage
    .from("intership-shopping-project")
    .upload(imageName, buffer, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  // build public url
  const { data: publicUrl } = supabase.storage
    .from("intership-shopping-project")
    .getPublicUrl(imageName);
  return publicUrl.publicUrl;
}
