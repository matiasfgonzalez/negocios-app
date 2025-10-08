// app/page.tsx (client component)
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/businesses").then((r) => setBusinesses(r.data));
  }, []);
  return (
    <main>
      <h1>Negocios</h1>
      <div className="grid">
        {businesses.map((b) => (
          <div key={b.id} className="card">
            <h3>{b.name}</h3>
            <p>{b.rubro}</p>
            <Link href={`/business/${b.slug}`}>Ver productos</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
