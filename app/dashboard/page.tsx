'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const router = useRouter()

  const [contenedores, setContenedores] =
    useState<any[]>([])

  const [mangos, setMangos] =
    useState<any[]>([])

  const [platano, setPlatano] =
    useState<any[]>([])

  /* =========================
     LOAD DASHBOARD
  ========================= */

  async function cargarDashboard() {

    try {

      const [
        contenedoresRes,
        mangosRes,
        platanoRes,
      ] = await Promise.all([

        supabase
          .from('contenedores')
          .select('*'),

        supabase
          .from('mangos')
          .select('*'),

        supabase
          .from('platano_verde')
          .select('*'),

      ])

      setContenedores(
        contenedoresRes.data || []
      )

      setMangos(
        mangosRes.data || []
      )

      setPlatano(
        platanoRes.data || []
      )

    } catch (error) {

      console.log(error)
    }
  }

  /* =========================
     REALTIME
  ========================= */

  useEffect(() => {

    cargarDashboard()

    const channel =
      supabase
        .channel('dashboard-realtime')

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contenedores',
          },
          () => {
            cargarDashboard()
          }
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mangos',
          },
          () => {
            cargarDashboard()
          }
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'platano_verde',
          },
          () => {
            cargarDashboard()
          }
        )

        .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
  }


  /* =========================
     CONTENEDORES
  ========================= */

  const totalContenedores =
    contenedores.length

  const completadosContenedores =
    contenedores.filter(
      (item:any) => {

        const estado =
          String(
            item.estado ||
            item.Estado ||
            ''
          )
            .trim()
            .toUpperCase()

        return (
          estado === 'ABIERTO' ||
          item.completo_1 === true ||
          item.completo_1 === 'TRUE'
        )

      }
    ).length

  const pendientesContenedores =
    contenedores.filter(
      (item:any) => {

        const estado =
          String(
            item.estado ||
            item.Estado ||
            ''
          )
            .trim()
            .toUpperCase()

        return (
          estado === 'PENDIENTE' ||
          item.completo_1 === false ||
          item.completo_1 === 'FALSE' ||
          !item.completo_1
        )

      }
    ).length

  /* =========================
     BARCOS ACTIVOS
  ========================= */

  const barcosUnicos = [
    ...new Set(
      contenedores
        .map((item) => {

          const barco =
            item.Barco ||
            item.barco ||
            item.BARCO ||
            item.nombre_barco ||
            item.Nombre_Barco ||
            item.NOMBRE_BARCO ||
            item.lote ||
            item.Lote ||
            item.LOTE ||
            ''

          return String(barco)
            .trim()
            .toUpperCase()

        })
        .filter(
          (barco) =>
            barco !== ''
        )
    ),
  ]

  const barcosActivos =
    barcosUnicos.length

  /* =========================
     MANGOS
  ========================= */

  const registrosMangos =
    mangos.length

  const totalMangos =
    mangos.reduce(
      (acc, item) =>
        acc +
        Number(
          item.total_cajas || 0
        ),
      0
    )

  const revisadasMangos =
    mangos.reduce(
      (acc, item) =>
        acc +
        Number(
          item.total_revisadas || 0
        ),
      0
    )

  const pendientesMangos =
    totalMangos -
    revisadasMangos

  /* =========================
     PLATANO VERDE
  ========================= */

  const registrosPlatano =
    platano.length

  const totalPlatano =
    platano.reduce(
      (acc, item) =>
        acc +
        Number(
          item.total_cajas || 0
        ),
      0
    )

  const revisadasPlatano =
    platano.reduce(
      (acc, item) =>
        acc +
        Number(
          item.total_revisadas || 0
        ),
      0
    )

  const pendientesPlatano =
    totalPlatano -
    revisadasPlatano


  /* =========================
     ESTADISTICAS NUEVAS
  ========================= */

  const abiertosContenedores =
    contenedores.filter(
      (item:any) => {

        const estado =
          String(
            item.estado ||
            item.Estado ||
            ''
          )
            .trim()
            .toUpperCase()

        return (
          estado === 'ABIERTO'
        )

      }
    ).length

  const sinRegistroContenedores =
    contenedores.filter(
      (item) =>
        !item.Estado ||
        String(item.Estado)
          .toUpperCase()
          .includes('SIN')
    ).length

  const llegadasHoy =
    contenedores.filter(
      (item) => {

        if (!item.Fecha_Llegada)
          return false

        const hoy =
          new Date()
            .toISOString()
            .split('T')[0]

        return String(
          item.Fecha_Llegada
        ).includes(hoy)

      }
    ).length

  const aperturasHoy =
    contenedores.filter(
      (item) => {

        if (!item.Fecha_Apertura)
          return false

        const hoy =
          new Date()
            .toISOString()
            .split('T')[0]

        return String(
          item.Fecha_Apertura
        ).includes(hoy)

      }
    ).length

  const estadisticasInspectores:any = {}

  contenedores.forEach(
    (item) => {

      const inspectorLlegada =
        item.Inspector

      const inspectorApertura =
        item.Inspector_Apertura

      if (inspectorLlegada) {

        if (
          !estadisticasInspectores[
            inspectorLlegada
          ]
        ) {

          estadisticasInspectores[
            inspectorLlegada
          ] = {
            llegadas: 0,
            aperturas: 0,
          }

        }

        estadisticasInspectores[
          inspectorLlegada
        ].llegadas++

      }

      if (inspectorApertura) {

        if (
          !estadisticasInspectores[
            inspectorApertura
          ]
        ) {

          estadisticasInspectores[
            inspectorApertura
          ] = {
            llegadas: 0,
            aperturas: 0,
          }

        }

        estadisticasInspectores[
          inspectorApertura
        ].aperturas++

      }

    }
  )


  return (

    <main className="min-h-screen bg-[#031B2D] overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0 opacity-20">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[180px]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-400 rounded-full blur-[180px]" />

      </div>

      {/* CONTENT */}

      <div className="relative z-10 p-8">

        {/* HEADER */}

        <div className="flex items-start justify-between mb-8">

          <h1 className="text-6xl font-black text-white leading-none tracking-tight">
            CONTENEDORES
          </h1>

          
          <button
            onClick={cerrarSesion}
            className="
              flex items-center gap-3
              border border-white/20
              bg-white/5
              hover:bg-white/10
              text-white
              font-semibold
              px-5 py-3
              rounded-2xl
              transition-all
              duration-300
              backdrop-blur-md
              shadow-lg
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15m-3-3h9m0 0l-3-3m3 3l-3 3"
              />
            </svg>

            Cerrar Sesión

          </button>

          <p className="text-blue-200 mt-3 text-xl">
            Centro Operativo Logístico
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="grid grid-cols-3 gap-5 mb-8">

          {/* CONTENEDORES */}

          <Link
            href="/contenedores"
            className="group bg-[#0B2744]/90 backdrop-blur-xl border border-blue-400/10 rounded-[30px] p-5 hover:border-blue-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
          >

            <div className="bg-blue-500/15 w-16 h-16 rounded-[22px] flex items-center justify-center mb-5 border border-blue-400/20">

              <span className="text-4xl">
                🚢
              </span>

            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Contenedores
            </h2>

            <p className="text-blue-100/70 leading-relaxed text-sm">
              Gestión operativa de contenedores,
              aperturas y llegadas.
            </p>

            <div className="mt-6 bg-blue-600 group-hover:bg-blue-500 transition-all text-white py-3 rounded-2xl text-center font-black text-base shadow-lg shadow-blue-500/20">
              ENTRAR
            </div>

          </Link>

          {/* MANGOS */}

          <Link
            href="/mangos"
            className="group bg-[#0B2744]/90 backdrop-blur-xl border border-orange-400/10 rounded-[30px] p-5 hover:border-orange-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
          >

            <div className="bg-orange-500/15 w-16 h-16 rounded-[22px] flex items-center justify-center mb-5 border border-orange-400/20">

              <span className="text-4xl">
                🥭
              </span>

            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Mangos
            </h2>

            <p className="text-blue-100/70 leading-relaxed text-sm">
              Importación, revisión y exportación
              de registros operativos.
            </p>

            <div className="mt-6 bg-orange-500 group-hover:bg-orange-400 transition-all text-white py-3 rounded-2xl text-center font-black text-base shadow-lg shadow-orange-500/20">
              ENTRAR
            </div>

          </Link>

          {/* GUINEO VERDE */}

          <Link
            href="/platano-verde"
            className="group bg-[#0B2744]/90 backdrop-blur-xl border border-green-400/10 rounded-[30px] p-5 hover:border-green-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
          >

            <div className="bg-green-500/15 w-16 h-16 rounded-[22px] flex items-center justify-center mb-5 border border-green-400/20">

              <span className="text-4xl">
                🍌
              </span>

            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Guineo Verde
            </h2>

            <p className="text-blue-100/70 leading-relaxed text-sm">
              Gestión operativa y control
              de revisión de guineo verde.
            </p>

            <div className="mt-6 bg-green-600 group-hover:bg-green-500 transition-all text-white py-3 rounded-2xl text-center font-black text-base shadow-lg shadow-green-500/20">
              ENTRAR
            </div>

          </Link>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-4 gap-5 mb-5">

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-5">

            <p className="text-blue-200 text-sm mb-3">
              CONTENEDORES
            </p>

            <h3 className="text-5xl font-black text-white">
              {totalContenedores}
            </h3>

            <p className="text-cyan-400 mt-3 text-sm">
              Operaciones registradas
            </p>

          </div>

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-5">

            <p className="text-blue-200 text-sm mb-3">
              MANGOS
            </p>

            <h3 className="text-5xl font-black text-white">
              {registrosMangos}
            </h3>

            <p className="text-orange-400 mt-3 text-sm">
              Registros operativos
            </p>

          </div>

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-5">

            <p className="text-blue-200 text-sm mb-3">
              GUINEO VERDE
            </p>

            <h3 className="text-5xl font-black text-white">
              {registrosPlatano}
            </h3>

            <p className="text-green-400 mt-3 text-sm">
              Registros operativos
            </p>

          </div>

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-5">

            <p className="text-blue-200 text-sm mb-3">
              BARCOS ACTIVOS
            </p>

            <h3 className="text-5xl font-black text-white">
              {barcosActivos}
            </h3>

            <p className="text-cyan-400 mt-3 text-sm truncate">
              {barcosUnicos.join(', ')}
            </p>

          </div>

        </div>

        {/* DETAIL */}

        <div className="grid grid-cols-3 gap-5">

          {/* CONTENEDORES */}

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-6">

            <h3 className="text-white text-2xl font-black mb-5">
              🚢 Contenedores
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Completados
                </span>

                <span className="text-green-400 font-bold">
                  {completadosContenedores}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Pendientes
                </span>

                <span className="text-orange-400 font-bold">
                  {pendientesContenedores}
                </span>

              </div>

            </div>

          </div>

          {/* MANGOS */}

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-6">

            <h3 className="text-white text-2xl font-black mb-5">
              🥭 Mangos
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Total cajas
                </span>

                <span className="text-white font-bold">
                  {totalMangos}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Revisadas
                </span>

                <span className="text-green-400 font-bold">
                  {revisadasMangos}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Pendientes
                </span>

                <span className="text-orange-400 font-bold">
                  {pendientesMangos}
                </span>

              </div>

            </div>

          </div>

          {/* GUINEO */}

          <div className="bg-[#0B2744]/90 border border-white/5 rounded-3xl p-6">

            <h3 className="text-white text-2xl font-black mb-5">
              🍌 Guineo Verde
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Total cajas
                </span>

                <span className="text-white font-bold">
                  {totalPlatano}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Revisadas
                </span>

                <span className="text-green-400 font-bold">
                  {revisadasPlatano}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-blue-100/70">
                  Pendientes
                </span>

                <span className="text-orange-400 font-bold">
                  {pendientesPlatano}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}