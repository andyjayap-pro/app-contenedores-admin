'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import { supabase } from '@/lib/supabase'

export default function MangosPage() {

  const [loading, setLoading] =
    useState(false)

  const [rows, setRows] =
    useState<any[]>([])

  const [lote, setLote] =
    useState('')

  const [lotes, setLotes] =
    useState<string[]>([])

  const [loteExportar, setLoteExportar] =
    useState('')

  useEffect(() => {
    obtenerLotes()
  }, [])

  async function obtenerLotes() {

    const {
      data,
      error,
    } = await supabase
      .from('mangos')
      .select('lote')

    if (error) {

      console.log(error)

      return
    }

    const lotesUnicos =
      [
        ...new Set(
          data
            ?.map((item) => item.lote)
            .filter(Boolean)
        ),
      ]

    setLotes(lotesUnicos as string[])
  }

  async function handleFile(
    event: any
  ) {

    try {

      const file =
        event.target.files[0]

      if (!file) return

      const nombreArchivo =
        file.name.replace(
          /\.xlsx$|\.xls$/i,
          ''
        )

      setLote(nombreArchivo)

      const data =
        await file.arrayBuffer()

      const workbook =
        XLSX.read(data)

      const sheetName =
        workbook.SheetNames[0]

      const worksheet =
        workbook.Sheets[sheetName]

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: '',
          }
        )

      if (jsonData.length === 0) {

        alert(
          'El Excel está vacío'
        )

        return
      }

      const columnas =
        Object.keys(jsonData[0] as any)

      const requeridas = [
        'Usuario',
        'Total_Cajas',
        'Total_Revisadas',
        'Completo',
      ]

      const faltantes =
        requeridas.filter(
          (columna) =>
            !columnas.includes(columna)
        )

      if (faltantes.length > 0) {

        alert(
          `Faltan columnas: ${faltantes.join(', ')}`
        )

        return
      }

      setRows(jsonData)

    } catch (error) {

      console.log(error)

      alert(
        'Error leyendo Excel'
      )
    }
  }

  async function subirExcel() {

    try {

      if (rows.length === 0) {

        alert(
          'Primero selecciona un Excel'
        )

        return
      }

      setLoading(true)

      const datos =
        rows.map((item) => ({

          usuario:
            String(
              item.Usuario ||
              item.usuario ||
              ''
            ).trim(),

          total_cajas:
            Number(
              item.Total_Cajas ||
              item.total_cajas ||
              0
            ),

          total_revisadas:
            Number(
              item.Total_Revisadas ||
              item.total_revisadas ||
              0
            ),

          completo:
            item.Completo === true ||
            item.Completo === 'TRUE' ||
            item.Completo === 'true' ||
            item.completo === true,

          lote:
            lote,

        }))

      const {
        error,
      } = await supabase
        .from('mangos')
        .insert(datos)

      if (error) {

        console.log(error)

        alert(error.message)

        return
      }

      await obtenerLotes()

      alert(
        'Excel subido correctamente'
      )

      setRows([])

      setLote('')

    } catch (error) {

      console.log(error)

      alert(
        'Error procesando datos'
      )

    } finally {

      setLoading(false)
    }
  }

  async function exportarExcel() {

    try {

      if (!loteExportar) {

        alert(
          'Selecciona un lote'
        )

        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('mangos')
        .select('*')
        .eq(
          'lote',
          loteExportar
        )

      if (error) {

        console.log(error)

        alert(
          'Error exportando Excel'
        )

        return
      }

      const worksheet =
        XLSX.utils.json_to_sheet(
          data || []
        )

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'MANGOS'
      )

      XLSX.writeFile(
        workbook,
        `${loteExportar}.xlsx`
      )

    } catch (error) {

      console.log(error)

      alert(
        'Error generando Excel'
      )
    }
  }

  async function borrarLote() {

    try {

      if (!loteExportar) {

        alert(
          'Selecciona un lote'
        )

        return
      }

      const continuar =
        confirm(
          `¿Eliminar lote ${loteExportar}?`
        )

      if (!continuar) return

      const {
        error,
      } = await supabase
        .from('mangos')
        .delete()
        .eq(
          'lote',
          loteExportar
        )

      if (error) {

        console.log(error)

        alert(
          'Error eliminando lote'
        )

        return
      }

      await obtenerLotes()

      setLoteExportar('')

      alert(
        'Lote eliminado correctamente'
      )

    } catch (error) {

      console.log(error)

      alert(
        'Error eliminando lote'
      )
    }
  }

  return (

    <main className="min-h-screen bg-slate-950 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-5xl font-black text-white mb-2">
              🥭 MANGOS
            </h1>

            <p className="text-slate-400">
              Panel Administrativo
            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400 mb-2">
              LOTES ACTIVOS
            </p>

            <h2 className="text-4xl font-black text-white">
              {lotes.length}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400 mb-2">
              REGISTROS CARGADOS
            </p>

            <h2 className="text-4xl font-black text-white">
              {rows.length}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400 mb-2">
              ARCHIVO ACTUAL
            </p>

            <h2 className="text-lg font-bold text-yellow-400 truncate">
              {lote || 'NINGUNO'}
            </h2>

          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-white text-2xl font-black mb-6">
              SUBIR EXCEL
            </h2>

            <div className="mb-6">

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="w-full bg-slate-800 text-white p-4 rounded-2xl border border-slate-700"
              />

            </div>

            <button
              type="button"
              onClick={subirExcel}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-700 transition-all text-black px-6 py-4 rounded-2xl font-black"
            >
              {
                loading
                  ? 'SUBIENDO EXCEL...'
                  : 'SUBIR EXCEL'
              }
            </button>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-white text-2xl font-black mb-6">
              GESTIÓN DE LOTES
            </h2>

            <select
              value={loteExportar}
              onChange={(e) =>
                setLoteExportar(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 text-white px-4 py-4 rounded-2xl border border-slate-700 mb-6"
            >

              <option value="">
                Seleccionar lote
              </option>

              {
                lotes.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))
              }

            </select>

            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={exportarExcel}
                className="bg-green-600 hover:bg-green-700 transition-all text-white px-6 py-4 rounded-2xl font-bold"
              >
                EXPORTAR
              </button>

              <button
                type="button"
                onClick={borrarLote}
                className="bg-red-600 hover:bg-red-700 transition-all text-white px-6 py-4 rounded-2xl font-bold"
              >
                BORRAR
              </button>

            </div>

            <div className="mt-8">

              <p className="text-slate-400 mb-3">
                LOTES DISPONIBLES
              </p>

              <div className="flex flex-wrap gap-2">

                {
                  lotes.length > 0
                    ? lotes.map((item) => (

                      <span
                        key={item}
                        className="bg-slate-800 text-slate-300 px-3 py-2 rounded-xl text-sm"
                      >
                        {item}
                      </span>

                    ))
                    : (
                      <span className="text-slate-500">
                        SIN LOTES
                      </span>
                    )
                }

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  )
}