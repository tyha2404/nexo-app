import { supabase } from '../config/supabase';

export async function uploadReceiptImage(
  uri: string,
  userId: string = 'public'
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const fileExt = uri.split('.').pop() || 'jpg';
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
