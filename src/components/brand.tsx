/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { StoreSettings } from "@/lib/catalog";
export function Brand({ store }: { store: StoreSettings }) {
  return (
    <Link className="brand" href="/">
      {store.logo_url ? (
        <img src={store.logo_url} alt="" width="36" height="36" />
      ) : (
        <span className="brand-mark" aria-hidden="true">
          M
        </span>
      )}
      <span>{store.display_name}</span>
    </Link>
  );
}
