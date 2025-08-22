"use client";
import Modal from "./Modal";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}


export default function NewNoteModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");

  const handleCreate = () => {
    if (!title || !contentMd) return;
    onSave(title, contentMd);
    setTitle("");
    setContentMd("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-2">New Note</h3>
      <input
        type="text"
        placeholder="Title"
        className="w-full mb-2 border px-2 py-1 rounded"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content"
        className="w-full mb-2 border px-2 py-1 rounded"
        value={contentMd}
        onChange={e => setContentMd(e.target.value)}
      />
      <button
        onClick={handleCreate}
        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Create
      </button>
    </Modal>
  );
}
