"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Correo o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#081120] via-[#0F172A] to-[#1E3A8A] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-10 shadow-2xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <ShieldCheck className="text-white" size={40} />
          </div>
        </div>

        {/* TITULO */}
        <h1 className="text-3xl font-extrabold text-center text-white">
          Centro Operativo
        </h1>

        <p className="text-gray-400 text-center mt-3 mb-8">
          Acceso administrativo privado
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Correo
            </label>

            <div className="flex items-center bg-[#1F2937] border border-[#374151] rounded-2xl px-4">
              <Mail className="text-gray-400" size={18} />

              <input
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none px-3 py-4 text-white"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Contraseña
            </label>

            <div className="flex items-center bg-[#1F2937] border border-[#374151] rounded-2xl px-4">
              <Lock className="text-gray-400" size={18} />

              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none px-3 py-4 text-white"
              />
            </div>
          </div>

          {/* BOTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 py-4 rounded-2xl text-white font-semibold shadow-xl"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          APP CONTENEDORES © 2026
        </div>

      </div>

    </main>
  );
}