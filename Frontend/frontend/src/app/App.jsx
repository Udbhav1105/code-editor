import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import './App.css'
import { Editor } from '@monaco-editor/react'
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'
import { MonacoBinding } from 'y-monaco'
import Output from '../components/Output'

const App = () => {

  const editorRef = useRef(null)
  const [editorMounted, setEditorMounted] = useState(false)

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])
  const handleMount = useCallback((editor) => {
    editorRef.current = editor
    setEditorMounted(true) 
  }, [])

  useEffect(() => {
    if (!username || !editorRef.current) return

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true }
    )

    provider.awareness.setLocalStateField("user", { username })
    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(
        states
          .filter(state => Boolean(state.user))
          .map(state => state.user)
      )
    })

    const handleUnload = () => {
      provider.awareness.setLocalStateField("user", null)
    }

    window.addEventListener("beforeunload", handleUnload)
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
    return () => {
      binding.destroy()
      provider.destroy()
      window.removeEventListener("beforeunload", handleUnload)
    }

  }, [editorMounted, username])       

  const handleJoin = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get("username")
    setUsername(name)
    window.history.pushState({}, "", "?username=" + name)
  }

  if (!username) {
    return (
      <main className='bg-gray-900 h-screen w-full flex gap-4 p-4 justify-center items-center'>
  
        <div className='h-[60vh] w-[60vw] flex justify-center items-center'>
          <form onSubmit={handleJoin} className='flex gap-5 flex-col'>
          <input
            type="text"
            placeholder='Enter username'
            name="username"
            required
            className='p-2 rounded-lg bg-gray-800 text-white text-2xl h-[10vh]'
          />
          <button
            type="submit"
            className='p-2 rounded-lg bg-amber-50 text-gray-950  text-xl font-bold'
          >
            Join
          </button>
        </form>
        </div>
      </main>
    )
  }

  return (
    <main className='bg-gray-900 h-screen w-full flex gap-4 p-4'>
      <aside className='bg-amber-50 rounded-lg h-full w-1/4 p-2'>
        <h2 className='text-5xl font-bold mb-10'>Users</h2>
        <ul className='flex flex-col gap-2 justify-center'>
          {users.map((user,i=0) => (
            <li key={user.username} className='px-5 capitalize text-3xl text-gray-600'>
              {i+1}.{user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className='bg-neutral-800 rounded-lg h-full w-3/4'>
        <Editor
          height='65%'
          defaultLanguage='javascript'
          defaultValue='// some comments'
          theme='vs-dark'  
          onMount={handleMount}
        />
        <Output code={editorRef.current?.getValue()} id={63}/>
      </section>
    </main>
  )
}

export default App