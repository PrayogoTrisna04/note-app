"use client";
import Modal from "./Modal";
import { Note } from "@/types/note";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onComment: (noteId: string, content: string) => void;
};

export default function CommentModal({ isOpen, onClose, note, onComment }: Props) {
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!content) return;
    onComment(note.id, content);
    setContent("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-2">{note.title} - Comments</h3>
      <div className="max-h-60 overflow-y-auto mb-2">
        {note.comments?.map(c => (
          <div key={c.id} className="mb-1">
            <strong>{c.author.name || "User"}:</strong> {c.contentMd}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add comment..."
          className="flex-1 border px-2 py-1 rounded"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button onClick={handleAdd} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
          Add
        </button>
      </div>
    </Modal>
  );
}
