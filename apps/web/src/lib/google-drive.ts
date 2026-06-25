import type { SyncData } from "@packages/agents";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const SYNC_FILENAME = "bookmark-reader-sync.json";
const SYNC_MIME = "application/json";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
}

async function api<T>(
	accessToken: string,
	url: string,
	options: RequestInit = {},
): Promise<T> {
	const res = await fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
	return res.json();
}

async function findSyncFile(accessToken: string): Promise<DriveFile | null> {
	try {
		const params = new URLSearchParams({
			q: `name='${SYNC_FILENAME}' and trashed=false`,
			spaces: "drive",
			fields: "files(id, name, mimeType, modifiedTime)",
			pageSize: "1",
		});
		const data = await api<{ files: DriveFile[] }>(
			accessToken,
			`${DRIVE_API_BASE}/files?${params}`,
		);
		return data.files?.[0] ?? null;
	} catch {
		return null;
	}
}

export async function downloadSyncData(
	token: string,
): Promise<SyncData | null> {
	const file = await findSyncFile(token);
	if (!file) return null;

	try {
		const res = await fetch(`${DRIVE_API_BASE}/files/${file.id}?alt=media`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return null;
		return (await res.json()) as SyncData;
	} catch {
		return null;
	}
}

export async function uploadSyncData(
	token: string,
	data: SyncData,
): Promise<boolean> {
	const existing = await findSyncFile(token);

	try {
		if (existing) {
			const res = await fetch(
				`${DRIVE_UPLOAD_BASE}/files/${existing.id}?uploadType=media`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": SYNC_MIME,
					},
					body: JSON.stringify(data),
				},
			);
			return res.ok;
		}

		const boundary = "drive_sync_boundary";
		const delimiter = `--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;
		const metadata = JSON.stringify({
			name: SYNC_FILENAME,
			mimeType: SYNC_MIME,
		});
		const body =
			delimiter +
			"Content-Type: application/json; charset=UTF-8\r\n\r\n" +
			metadata +
			"\r\n" +
			delimiter +
			`Content-Type: ${SYNC_MIME}\r\n\r\n` +
			JSON.stringify(data) +
			closeDelimiter;

		const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": `multipart/related; boundary=${boundary}`,
			},
			body,
		});
		return res.ok;
	} catch {
		return false;
	}
}
