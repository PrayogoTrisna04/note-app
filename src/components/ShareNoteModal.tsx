"use client";
import { useState, useEffect } from "react";

type User = { id: string; email: string };
type Props = {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  onShared: () => void;
};

export default function ShareNoteModal({ noteId, isOpen, onClose, onShared }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState<"READ" | "COMMENT" | "EDIT">("READ");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedUser) return alert("Select a user");
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, userId: selectedUser, permission }),
      });
      if (!res.ok) throw new Error("Failed to share");
      onShared();
      onClose();
    } catch (err) {
      alert((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-80">
        <h3 className="font-bold mb-3">Share Note</h3>
        <select
          className="w-full border px-2 py-1 mb-2 rounded"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
        <select
          className="w-full border px-2 py-1 mb-4 rounded"
          value={permission}
          onChange={(e) => setPermission(e.target.value as any)}
        >
          <option value="READ">READ</option>
          <option value="COMMENT">COMMENT</option>
          <option value="EDIT">EDIT</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
