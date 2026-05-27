import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback
} from "react";

import "./App.css";

import { Editor } from "@monaco-editor/react";

import * as Y from "yjs";

import { SocketIOProvider } from "y-socket.io";

import { MonacoBinding } from "y-monaco";

import Output from "../components/Output";

const App = () => {

  const editorRef = useRef(null);

  const [editorMounted, setEditorMounted] = useState(false);
  const[language,setlanguage]=useState("javascript")
  const[id,setid]=useState(63)

  const [users, setUsers] = useState([]);

  const [username, setUsername] = useState("");

  const [room, setRoom] = useState("");

  const [joined, setJoined] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => {
    return ydoc.getText("monaco");
  }, [ydoc]);
  const handleMount = useCallback((editor) => {

    editorRef.current = editor;

    setEditorMounted(true);

  }, []);
  useEffect(() => {

    if (
      !joined ||
      !editorMounted ||
      !editorRef.current
    ) {
      return;
    }
    const provider = new SocketIOProvider(
      window.location.origin,
      room,
      ydoc,
      {
        autoConnect: true
      }
    );
    provider.awareness.setLocalStateField(
      "user",
      {
        username
      }
    );

    provider.awareness.on("change", () => {

      const states = Array.from(
        provider.awareness.getStates().values()
      );

      const activeUsers = states
        .filter((state) => state.user)
        .map((state) => state.user);

      setUsers(activeUsers);

    });
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
    const handleUnload = () => {

      provider.awareness.setLocalStateField(
        "user",
        null
      );

    };

    window.addEventListener(
      "beforeunload",
      handleUnload
    );

    return () => {

      binding.destroy();

      provider.destroy();

      window.removeEventListener(
        "beforeunload",
        handleUnload
      );

    };

  }, [
    joined,
    editorMounted,
    room,
    username,
  ]);

  const handleJoin = (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);

    const enteredUsername =
      formData.get("username");

    const enteredRoom =
      formData.get("room");

    setUsername(enteredUsername);

    setRoom(enteredRoom);

    setJoined(true);

    // Shareable URL

    window.history.replaceState(
      {},
      "",
      `?room=${enteredRoom}`
    );

  };

  const inviteLink =
    `${window.location.origin}?room=${room}`;
  if (!joined) {

    return (
      <main className="bg-gray-900 h-screen w-full flex justify-center items-center">

        <form
          onSubmit={handleJoin}
          className="bg-gray-800 p-8 rounded-xl flex flex-col gap-5 w-[400px]"
        >

          <h1 className="text-white text-4xl font-bold text-center">
            Collaborative Editor
          </h1>

          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            required
            className="p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <input
            type="text"
            name="room"
            placeholder="Enter Room Code"
            required
            className="p-3 rounded-lg bg-gray-700 text-white outline-none"
          />
          <select
  name="language"
  required
  onChange={(e) => {
    const value = e.target.value;

    setlanguage(value);

    const languageMap = {
      java: 62,
      javascript: 63,
      python: 71,
      cpp: 54,
      c: 50,
    };

    setid(languageMap[value]);
  }}
  className="p-3 rounded-lg bg-gray-700 text-white outline-none"
>
  <option value="">Select Language</option>
  <option value="java">Java</option>
  <option value="javascript">JavaScript</option>
  <option value="python">Python</option>
  <option value="cpp">C++</option>
  <option value="c">C</option>
</select>
          <button
            type="submit"
            className="bg-white text-black p-3 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            Join Room
          </button>

        </form>

      </main>
    );

  }

  return (

    <main className="bg-gray-900 h-screen w-full flex gap-4 p-4">
      <aside className="bg-white rounded-xl h-full w-1/4 p-5 overflow-y-auto">

        <h2 className="text-3xl font-bold mb-6">
          Users
        </h2>

        <div className="mb-5">

          <p className="font-bold mb-2">
            Room:
          </p>

          <div className="bg-gray-200 p-2 rounded">
            {room}
          </div>

        </div>

        <div className="mb-6">

          <p className="font-bold mb-2">
            Invite Link:
          </p>

          <input
            value={inviteLink}
            readOnly
            className="w-full p-2 rounded bg-gray-200 text-sm"
          />

        </div>

        <ul className="flex flex-col gap-3">

          {users.map((user, index) => (

            <li
              key={index}
              className="bg-gray-100 p-3 rounded-lg text-xl capitalize"
            >
              {index + 1}. {user.username}
            </li>

          ))}

        </ul>

      </aside>
      <section className="bg-neutral-800 rounded-xl h-full w-3/4 overflow-hidden">
        <h1 className="text-right px-5 text-xl text-amber-300 capitalize">{language}</h1>
        <Editor
          height="65%"
          language={language}
          defaultValue="// Start coding here..."
          theme="vs-dark"
          onMount={handleMount}
        />
        <Output
          code={editorRef.current?.getValue()}
          id={id}
        />
      </section>

    </main>

  );

};

export default App;