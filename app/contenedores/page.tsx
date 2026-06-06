'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import { supabase } from '@/lib/supabase'

export default function ContenedoresPage() {

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
      .from('contenedores')
      .select('lote')

    if (error) {
      console.log(error)
      return
    }

    const lotesUnicos =
      [
        ...new Set(
          data
            .map((item) => item.lote)
            .filter(Boolean)
        ),
      ]

    setLotes(lotesUnicos)
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
          /\.xlsx|\.xls/i,
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
          worksheet
        )

      setRows(jsonData)

    } catch (error) {

      console.log(error)

      alert(
        'Error leyendo Excel'
      )
    }
  }

  async function importarDatos() {

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

          contenedor:
            item.Contenedor || '',

          candado:
            item.Candado || '',

          contenido:
            item.Contenido || '',

          fecha_llegada:
            item.Fecha_Llegada || '',

          inspector:
            item.Inspector || '',

          completo:
            item.Completo || false,

          fecha_apertura:
            item.Fecha_Apertura || '',

          inspector_apertura:
            item.Inspector_Apertura || '',

          completo_1:
            item.Completo_1 || false,

          estado:
            item.Estado || 'PENDIENTE',

          lote:
            lote,

        }))

      const {
        error,
      } = await supabase
        .from('contenedores')
        .upsert(
          datos,
          {
            onConflict:
              'contenedor,candado,lote',
          }
        )

      if (error) {

        console.log(error)

        alert(
          'Error al subir Excel'
        )

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
        .from('contenedores')
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
          data
        )

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'CONTENEDORES'
      )

      XLSX.writeFile(
        workbook,
        `${loteExportar}.xlsx`
      )

      setLoteExportar('')

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

      const {
        data: pendientes,
        error: errorPendientes,
      } = await supabase
        .from('contenedores')
        .select('*')
        .eq(
          'lote',
          loteExportar
        )
        .or(
          'completo_1.is.null,completo_1.eq.false'
        )

      if (errorPendientes) {

        console.log(errorPendientes)

        alert(
          'Error verificando lote'
        )

        return
      }

      if (
        pendientes &&
        pendientes.length > 0
      ) {

        const continuar =
          confirm(
            `⚠️ Atención:\n\nFaltan ${pendientes.length} contenedores por abrir en ${loteExportar}.\n\n¿Deseas eliminar el lote de todas formas?`
          )

        if (!continuar) return

      } else {

        const continuar =
          confirm(
            `✅ Todos los contenedores fueron abiertos.\n\n¿Eliminar lote ${loteExportar}?`
          )

        if (!continuar) return
      }

      const {
        error,
      } = await supabase
        .from('contenedores')
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

      <div className="max-w-6xl mx-auto">


        <h1 className="text-4xl font-bold text-white mb-2">
          CONTENEDORES
        </h1>

        <p className="text-slate-400 mb-2">
          Panel Administrativo
        </p>

        <p className="text-blue-400 mb-10">
          Archivo seleccionado:
          {' '}
          {lote || 'NINGUNO'}
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          {/* SUBIR EXCEL */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-white text-xl font-bold mb-4">
              SUBIR EXCEL
            </h2>

            <div className="flex items-center gap-4 mb-6">

              <label className="flex items-center gap-4 flex-1">

                <span className="bg-slate-700 hover:bg-slate-600 transition-all text-white px-4 py-3 rounded-xl cursor-pointer font-semibold">
                  SELECCIONAR EXCEL
                </span>

                <span className="text-slate-400 truncate">
                  {
                    lote
                      ? `${lote}.xlsx`
                      : 'Ningún archivo seleccionado'
                  }
                </span>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  className="hidden"
                />

              </label>

              {
                lote && (
                  <button
                    type="button"
                    onClick={() => {

                      setLote('')

                      setRows([])

                    }}
                    className="bg-red-600 hover:bg-red-700 transition-all text-white w-12 h-12 rounded-xl font-bold text-xl"
                  >
                    ×
                  </button>
                )
              }

            </div>

            <button
              type="button"
              onClick={() => importarDatos()}
              disabled={
                loading
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              {
                loading
                  ? 'SUBIENDO...'
                  : 'SUBIR EXCEL'
              }
            </button>

            <div className="mt-6">

              <p className="text-slate-400 mb-2">
                Registros cargados:
                {' '}
                {rows.length}
              </p>

            </div>

          </div>

          {/* GESTIÓN LOTES */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-white text-xl font-bold mb-4">
              GESTIÓN DE LOTES
            </h2>

            <select
              value={loteExportar}
              onChange={(e) =>
                setLoteExportar(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 mb-6"
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

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => exportarExcel()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                EXPORTAR
              </button>

              <button
                type="button"
                onClick={() => borrarLote()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                BORRAR
              </button>

            </div>

            <div className="mt-6">

              <p className="text-slate-400">
                Barcos activos:
                {' '}
                {
                  lotes.length > 0
                    ? lotes.join(', ')
                    : 'NINGUNO'
                }
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}