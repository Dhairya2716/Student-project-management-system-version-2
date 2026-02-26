import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename to prevent overwrites
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const extension = file.name.split('.').pop();
        const originalName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
        const fileName = `${originalName}-${uniqueSuffix}.${extension}`;

        // Ensure the uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Ignore if directory already exists
        }

        // Save the file
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Return the path relative to public directory for URL access
        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({ url: fileUrl }, { status: 201 });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
