// Google Drive API client — thin wrapper for reading/writing the sync file.
// Uses the auth agent to get access tokens.

import type { IAuthAgent, SyncData } from "@packages/agents";
import { DRIVE_SYNC_FILENAME, DRIVE_SYNC_MIME } from "./auth-config";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
}

async function request(
	accessToken: string,
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	return fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Find the sync file in Google Drive.
 * Searches specifically for files created by this app (drive.file scope).
 */
async function findSyncFile(
	accessToken: string,
): Promise<DriveFile | null> {
	const params = new URLSearchParams({
		q: `name='${DRIVE_SYNC_FILENAME}' and trashed=false`,
		spaces: "drive",
		fields: "files(id, name, mimeType, modifiedTime)",
		pageSize: "1",
	});

	const res = await request(
		accessToken,
		`${DRIVE_API_BASE}/files?${params}`,
	);
	if (!res.ok) return null;

	const data = await res.json();
	return data.files?.[0] ?? null;
}

/**
 * Read the sync file from Google Drive.
 */
async function readSyncFile(
	accessToken: string,
	fileId: string,
): Promise<SyncData | null> {
	try {
		const res = await request(
			accessToken,
			`${DRIVE_API_BASE}/files/${fileId}?alt=media`,
		);
		if (!res.ok) return null;
		const text = await res.text();
		return JSON.parse(text) as SyncData;
	} catch {
		return null;
	}
}

/**
 * Create a new sync file in Google Drive.
 */
async function createSyncFile(
	accessToken: string,
	data: SyncData,
): Promise<DriveFile | null> {
	try {
		const boundary = "drive_sync_boundary";
		const delimiter = `--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;

		const metadata = JSON.stringify({
			name: DRIVE_SYNC_FILENAME,
			mimeType: DRIVE_SYNC_MIME,
		});
		const fileContent = JSON.stringify(data);

		const body =
			delimiter +
			"Content-Type: application/json; charset=UTF-8\r\n\r\n" +
			metadata +
			"\r\n" +
			delimiter +
			`Content-Type: ${DRIVE_SYNC_MIME}\r\n\r\n` +
			fileContent +
			closeDelimiter;

		const res = await fetch(
			`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": `multipart/related; boundary=${boundary}`,
				},
				body,
			},
		);

		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}

/**
 * Update an existing sync file in Google Drive.
 */
async function updateSyncFile(
	accessToken: string,
	fileId: string,
	data: SyncData,
): Promise<boolean> {
	try {
		const res = await request(
			accessToken,
			`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": DRIVE_SYNC_MIME,
				},
				body: JSON.stringify(data),
			},
		);
		return res.ok;
	} catch {
		return false;
	}
}

/**
 * Upload (create or update) the sync file in Google Drive.
 */
export async function uploadSyncData(
	authAgent: IAuthAgent,
	data: SyncData,
): Promise<boolean> {
	const token = await authAgent.getAccessToken();
	if (!token) return false;

	const existing = await findSyncFile(token);
	if (existing) {
		return updateSyncFile(token, existing.id, data);
	}
	const created = await createSyncFile(token, data);
	return created !== null;
}

/**
 * Download the sync file from Google Drive.
 */
export async function downloadSyncData(
	authAgent: IAuthAgent,
): Promise<SyncData | null> {
	const token = await authAgent.getAccessToken();
	if (!token) return null;

	const existing = await findSyncFile(token);
	if (!existing) return null;

	return readSyncFile(token, existing.id);
}
