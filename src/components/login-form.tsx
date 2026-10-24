"use client";
import { useActionState } from "react";
import { login } from "@/app/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="stack">
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      {state.error && (
        <p role="alert" className="notice">
          {state.error}
        </p>
      )}
      <button disabled={pending}>{pending ? "Memeriksa…" : "Masuk"}</button>
      <p className="hint">
        Akses khusus akun admin yang diotorisasi pemilik. Belum ada pendaftaran
        member pada Sprint 1.
      </p>
    </form>
  );
}
