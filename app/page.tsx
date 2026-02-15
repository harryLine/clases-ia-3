'use client'

import { useEffect, useMemo, useState } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ClassNote } from '@/lib/types'

const STORAGE_KEY = 'domingos-ia-classes'

const getToday = () => new Date().toISOString().split('T')[0]

const createNewClass = (): ClassNote => ({
  id: crypto.randomUUID(),
  date: getToday(),
  title: 'Nueva clase',
  contentHtml: '<p>Escribe el contenido de la clase...</p>',
  resources: [],
  updatedAt: new Date().toISOString()
})

const sortByDateDesc = (classes: ClassNote[]) =>
  [...classes].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.updatedAt.localeCompare(a.updatedAt)
  })

export default function Home() {
  const [classes, setClasses] = useState<ClassNote[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ClassNote[]
        if (parsed.length > 0) {
          const sorted = sortByDateDesc(parsed)
          setClasses(sorted)
          setSelectedId(sorted[0].id)
          setIsLoaded(true)
          return
        }
      } catch {
        // ignore broken state
      }
    }

    const initialClass = createNewClass()
    setClasses([initialClass])
    setSelectedId(initialClass.id)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
  }, [classes, isLoaded])

  const sortedClasses = useMemo(() => sortByDateDesc(classes), [classes])
  const selectedClass = sortedClasses.find((item) => item.id === selectedId) ?? sortedClasses[0]

  useEffect(() => {
    if (selectedClass && selectedId !== selectedClass.id) {
      setSelectedId(selectedClass.id)
    }
  }, [selectedClass, selectedId])

  const updateClass = (updater: (current: ClassNote) => ClassNote) => {
    if (!selectedClass) return
    setClasses((prev) => prev.map((item) => (item.id === selectedClass.id ? updater(item) : item)))
  }

  const addClass = () => {
    const newClass = createNewClass()
    setClasses((prev) => sortByDateDesc([newClass, ...prev]))
    setSelectedId(newClass.id)
  }

  const saveClass = () => {
    if (!selectedClass) return
    updateClass((current) => ({ ...current, updatedAt: new Date().toISOString() }))
    window.alert('Clase guardada')
  }

  const copyEmail = async () => {
    if (!selectedClass) return
    const subject = `Domingos IA: ${selectedClass.date} - ${selectedClass.title}`
    const resourcesHtml = selectedClass.resources.length
      ? `<h3>Recursos</h3><ul>${selectedClass.resources
          .map((r) => `<li><a href="${r.url}">${r.name || r.url}</a></li>`)
          .join('')}</ul>`
      : ''

    const bodyHtml = `<h2>${selectedClass.title}</h2><p><strong>Fecha:</strong> ${selectedClass.date}</p>${selectedClass.contentHtml}${resourcesHtml}`

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([`Asunto: ${subject}\n\n${bodyHtml}`], { type: 'text/plain' }),
        'text/html': new Blob([
          `<p><strong>Asunto:</strong> ${subject}</p>${bodyHtml}`
        ], { type: 'text/html' })
      })
    ])

    window.alert('Email copiado al portapapeles')
  }

  const downloadHtml = () => {
    if (!selectedClass) return

    const resources = selectedClass.resources.length
      ? `<section><h2>Recursos</h2><ul>${selectedClass.resources
          .map(
            (resource) =>
              `<li><a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.name || resource.url}</a></li>`
          )
          .join('')}</ul></section>`
      : ''

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${selectedClass.title}</title>
  </head>
  <body style="font-family: Inter, Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a;">
    <main style="max-width: 860px; margin: 0 auto; padding: 40px 24px; background: #fff; min-height: 100vh;">
      <h1 style="margin-bottom: 8px;">${selectedClass.title}</h1>
      <p style="color: #475569; margin-top: 0;">${selectedClass.date}</p>
      <section>${selectedClass.contentHtml}</section>
      ${resources}
    </main>
  </body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedClass.date}-${selectedClass.title.replace(/\s+/g, '-').toLowerCase()}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!selectedClass) {
    return null
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h1>Clases</h1>
          <button onClick={addClass}>+ Nueva clase</button>
        </div>
        <ul>
          {sortedClasses.map((classItem) => (
            <li key={classItem.id}>
              <button
                className={`class-item ${classItem.id === selectedClass.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(classItem.id)}
              >
                {classItem.date} · {classItem.title || 'Sin título'}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="editor-panel">
        <div className="fields-grid">
          <label>
            Fecha
            <input
              type="date"
              value={selectedClass.date}
              onChange={(event) =>
                updateClass((current) => ({ ...current, date: event.target.value, updatedAt: new Date().toISOString() }))
              }
            />
          </label>

          <label>
            Título
            <input
              type="text"
              value={selectedClass.title}
              onChange={(event) =>
                updateClass((current) => ({ ...current, title: event.target.value, updatedAt: new Date().toISOString() }))
              }
            />
          </label>
        </div>

        <div>
          <h2>Contenido</h2>
          <RichTextEditor
            value={selectedClass.contentHtml}
            onChange={(contentHtml) =>
              updateClass((current) => ({ ...current, contentHtml, updatedAt: new Date().toISOString() }))
            }
          />
        </div>

        <div>
          <div className="resource-head">
            <h2>Recursos</h2>
            <button
              onClick={() =>
                updateClass((current) => ({
                  ...current,
                  resources: [
                    ...current.resources,
                    { id: crypto.randomUUID(), name: '', url: '' }
                  ]
                }))
              }
            >
              Añadir recurso
            </button>
          </div>

          <div className="resources-list">
            {selectedClass.resources.map((resource) => (
              <div key={resource.id} className="resource-row">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={resource.name}
                  onChange={(event) =>
                    updateClass((current) => ({
                      ...current,
                      resources: current.resources.map((item) =>
                        item.id === resource.id ? { ...item, name: event.target.value } : item
                      )
                    }))
                  }
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={resource.url}
                  onChange={(event) =>
                    updateClass((current) => ({
                      ...current,
                      resources: current.resources.map((item) =>
                        item.id === resource.id ? { ...item, url: event.target.value } : item
                      )
                    }))
                  }
                />
                <button
                  className="danger"
                  onClick={() =>
                    updateClass((current) => ({
                      ...current,
                      resources: current.resources.filter((item) => item.id !== resource.id)
                    }))
                  }
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="actions">
          <button onClick={saveClass}>Guardar</button>
          <button onClick={copyEmail}>Copiar email</button>
          <button onClick={downloadHtml}>Descargar HTML</button>
        </div>
      </section>
    </main>
  )
}
