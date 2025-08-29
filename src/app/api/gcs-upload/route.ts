import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google Cloud Storage
const storage = new Storage({
  credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY || '{}'),
  projectId: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY || '{}').project_id,
});

const bucketName = process.env.GCS_BUCKET_NAME;

export async function POST(request: Request) {
  if (!bucketName) {
    return NextResponse.json({ error: 'GCS_BUCKET_NAME environment variable not set' }, { status: 500 });
  }

  const { filename, contentType } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
  }

  const uniqueFileName = `${uuidv4()}-${filename}`;
  const file = storage.bucket(bucketName).file(uniqueFileName);

  const options = {
    version: 'v4' as 'v4',
    action: 'write' as 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: contentType,
  };

  try {
    const [url] = await file.getSignedUrl(options);
    return NextResponse.json({ url, filename: uniqueFileName });
  } catch (error) {
    console.error('Error generating GCS signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
