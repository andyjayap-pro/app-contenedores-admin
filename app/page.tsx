"use client";

import Link from "next/link";
import { Container, ShieldCheck, BarChart3 } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#081120] via-[#0F172A] to-[#1E3A8A] flex items-center justify-center px-6">

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

        {/* IZQUIERDA */}
        <div>
          <div className="inline-flex items-center gap-3 bg-blue-600/20 border border-blue-500/30 px-5 py-3 rounded-2xl mb-6">
            <Container className="text-blue-400" size={28} />
            <span className="text-blue-300 font-semibold">
              APP CONTENEDORES
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Centro Operativo y Control Logístico
          </h1>

          <p className="text-gray-300 text-lg mt-6 leading-relaxed">
            Plataforma administrativa para monitoreo de contenedores,
            inspecciones operativas, control de mangos y plátano verde.
          </p>

          <div className="flex gap-4 mt-10">

            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-8 py-4 rounded-2xl text-white font-semibold shadow-xl"
            >
              Entrar al Sistema
            </Link>

          </div>
        </div>

        {/* DERECHA */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-8 shadow-2xl">

          <div className="space-y-6">

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <ShieldCheck className="text-white" size={26} />
              </div>

              <div>
                <h3 className="text-white font-bold text-xl">
                  Seguridad Operativa
                </h3>

                <p className="text-gray-400 mt-2">
                  Sistema centralizado para control y supervisión logística.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <BarChart3 className="text-white" size={26} />
              </div>

              <div>
                <h3 className="text-white font-bold text-xl">
                  Estadísticas en Tiempo Real
                </h3>

                <p className="text-gray-400 mt-2">
                  Visualización de actividad, registros y operaciones activas.
                </p>
              </div>
            </div>

            <div className="border-t border-[#1F2937] pt-6 mt-6 text-center">

              <p className="text-gray-500 text-sm">
                Sistema Corporativo • APP CONTENEDORES © 2026
              </p>

              <p className="text-blue-400 text-sm mt-2 font-medium">
                Desarrollado por Andy J
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}