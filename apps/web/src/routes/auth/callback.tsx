import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackComponent,
});

const CODE_VERIFIER_KEY = "oauth_code_verifier";
const REDIRECT_AFTER_KEY = "oauth_redirect_after";
const TOKEN_KEY = "google_drive_tokens";

interface StoredTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
	email: string | null;
	name: string | null;
}

function getClientId(): string {
	return import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? "";
}

function getRedirectUri(): string {
	return `${window.location.origin}/auth/callback`;
}

function exchangeCodeForTokens(
	code: string,
	codeVerifier: string,
): Promise<StoredTokens | null> {
	const clientId = getClientId();
	const redirectUri = getRedirectUri();

	return fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			code_verifier: codeVerifier,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
		}),
	})
		.then((res) => (res.ok ? res.json() : null))
		.then((data) =>
			data
				? {
						accessToken: data.access_token,
						refreshToken: data.refresh_token ?? null,
						expiresAt: Date.now() + data.expires_in * 1000,
						email: null,
						name: null,
					}
				: null,
		);
}

function AuthCallbackComponent() {
	const [status, setStatus] = useState<"exchanging" | "success" | "error">(
		"exchanging",
	);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const error = params.get("error");

		if (error) {
			setStatus("error");
			setErrorMsg(params.get("error_description") ?? error);
			return;
		}

		if (!code) {
			setStatus("error");
			setErrorMsg("No authorization code received");
			return;
		}

		const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
		sessionStorage.removeItem(CODE_VERIFIER_KEY);

		if (!codeVerifier) {
			setStatus("error");
			setErrorMsg("Session expired. Please try connecting again.");
			return;
		}

		exchangeCodeForTokens(code, codeVerifier).then((tokens) => {
			if (tokens) {
				localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
				setStatus("success");
				const redirectTo =
					sessionStorage.getItem(REDIRECT_AFTER_KEY) || "/settings";
				sessionStorage.removeItem(REDIRECT_AFTER_KEY);
				setTimeout(() => {
					window.location.href = redirectTo;
				}, 1500);
			} else {
				setStatus("error");
				setErrorMsg("Failed to exchange authorization code for tokens");
			}
		});
	}, []);

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4 p-6">
			{status === "exchanging" && (
				<>
					<Loader2 className="size-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Completing sign-in...</p>
				</>
			)}
			{status === "success" && (
				<>
					<CheckCircle2 className="size-12 text-green-500" />
					<p className="font-medium">Connected!</p>
					<p className="text-sm text-muted-foreground">Redirecting back...</p>
				</>
			)}
			{status === "error" && (
				<>
					<XCircle className="size-12 text-destructive" />
					<p className="font-medium">Connection failed</p>
					<p className="text-sm text-muted-foreground">{errorMsg}</p>
					<a
						href="/settings"
						className="text-sm text-primary underline underline-offset-4"
					>
						Back to settings
					</a>
				</>
			)}
		</div>
	);
}
