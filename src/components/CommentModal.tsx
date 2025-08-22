import { useState } from "react";

export default function AddComment({ noteId, onAdd }: { noteId: string; onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => { onAdd(text); setText(""); };
  return (
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add comment..."
        className="flex-1 border rounded px-2 py-1"
      />
      <button onClick={submit} className="bg-blue-600 text-white px-2 rounded hover:bg-blue-700">Add</button>
    </div>
  );
}
