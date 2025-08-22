import { useState } from "react";

type User = { id: string; email: string };
export default function ShareNoteModal({ noteId, isOpen, onClose, onShared, users, onShare }: { noteId: string; isOpen: boolean; onClose: () => void; onShared: () => void; users: User[]; onShare: (noteId: string, userId: string, permission: "READ" | "COMMENT" | "EDIT") => void }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState<"READ" | "COMMENT" | "EDIT">("READ");

  const handleShare = () => {
    if (!selectedUser) return alert("Select a user");
    onShare(noteId, selectedUser, permission);
    onShared();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-80">
        <h3 className="font-bold mb-3">Share Note</h3>
        <select className="w-full border px-2 py-1 mb-2 rounded" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select user</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <select className="w-full border px-2 py-1 mb-4 rounded" value={permission} onChange={(e) => setPermission(e.target.value as any)}>
          <option value="READ">READ</option>
          <option value="COMMENT">COMMENT</option>
          <option value="EDIT">EDIT</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={handleShare} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Share</button>
        </div>
      </div>
    </div>
  );
}