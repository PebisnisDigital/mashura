"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="login-shell">
      <section className="panel">
        <h1>Halaman belum dapat dimuat</h1>
        <p>
          Periksa koneksi dan konfigurasi database MASHURA. Data Anda tidak
          diubah.
        </p>
        <button onClick={reset}>Coba lagi</button>
      </section>
    </main>
  );
}
