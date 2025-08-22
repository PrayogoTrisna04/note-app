"use client";

import AddComment from "@/components/CommentModal";
import ShareNoteModal from "@/components/ShareNoteModal";
import { useState, useEffect } from "react";

type Note = {
  id: string;
  title: string;
  contentMd: string;
  visibility: "PUBLIC" | "PRIVATE";
  ownerId: string;
  isOwner: boolean;
  comments?: { id: string; contentMd: string }[];
};

type User = { id: string; email: string };

export default function NotesDashboard() {
  const [view, setView] = useState<"public" | "private">("private");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [shareNoteId, setShareNoteId] = useState<string | null>(null);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch notes
  const fetchNotes = async (type: "public" | "private") => {
    setLoading(true);
    const res = await fetch(type === "public" ? "/api/public-notes" : "/api/notes/private");
    const data = await res.json();
    setNotes(data.notes || []);
    setLoading(false);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchNotes(view); }, [view]);
  useEffect(() => { fetchUsers(); }, []);

  const toggleComments = (id: string) => {
    const newSet = new Set(expandedNotes);
    expandedNotes.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedNotes(newSet);
  };

  const logout = () => { window.location.href = "auth/signin"; };

  const addOrEditNote = async (title: string, content: string, visibility: "PUBLIC" | "PRIVATE") => {
    if (editNote) {
      await fetch(`/api/notes/${editNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentMd: content, visibility }),
      });
      setEditNote(null);
    } else {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentMd: content, visibility }),
      });
    }
    setNewNoteOpen(false);
    fetchNotes(view);
  };

  const deleteNote = async (note: Note) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    fetchNotes(view);
  };

  const toggleVisibility = async (note: Note) => {
    if (!note.isOwner) return;
    await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: note.title,
        contentMd: note.contentMd,
        visibility: note.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
      }),
    });
    fetchNotes(view);
  };

  const shareNote = async (noteId: string, userId: string, permission: "READ" | "COMMENT" | "EDIT") => {
    await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, userId, permission }),
    });
    setShareNoteId(null);
    fetchNotes(view);
  };

  const addComment = async (noteId: string, content: string) => {
    if (!content.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, content }),
    });
    fetchNotes(view);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow flex flex-col p-4">
        <div className="flex items-center mb-8 font-bold text-xl">NoteApp</div>
        <button
          onClick={() => setView("public")}
          className={`mb-2 text-left px-2 py-1 rounded hover:bg-gray-200 ${view === "public" ? "bg-gray-300 font-bold" : ""}`}
        >
          Public Notes
        </button>
        <button
          onClick={() => setView("private")}
          className={`mb-2 text-left px-2 py-1 rounded hover:bg-gray-200 ${view === "private" ? "bg-gray-300 font-bold" : ""}`}
        >
          Private Notes
        </button>
        <button onClick={logout} className="mt-auto text-left px-2 py-1 rounded hover:bg-gray-200 text-red-600 font-semibold">
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{view === "public" ? "Public Notes" : "Your Private Notes"}</h1>
          {view === "private" && (
            <button
              onClick={() => setNewNoteOpen(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + New Note
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes available</p>
        ) : (
          <div className="border rounded overflow-hidden">
            {notes.map((note, idx) => (
              <div key={note.id} className={`p-4 flex flex-col gap-2 ${idx % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <p className="text-gray-700">{note.contentMd}</p>
                  </div>

                  {/* Owner controls */}
                  {note.isOwner && view === "private" && (
                    <div className="flex gap-2 text-blue-600">
                      <a onClick={() => toggleVisibility(note)} className="cursor-pointer hover:underline">
                        {note.visibility === "PUBLIC" ? "Make Private" : "Make Public"}
                      </a>
                      <a onClick={() => setShareNoteId(note.id)} className="cursor-pointer hover:underline">Share</a>
                      <a onClick={() => deleteNote(note)} className="cursor-pointer hover:underline text-red-600">Delete</a>
                      <a onClick={() => { setEditNote(note); setNewNoteOpen(true); }} className="cursor-pointer hover:underline">Edit</a>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <a onClick={() => toggleComments(note.id)} className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {expandedNotes.has(note.id) ? "Hide Comments" : `View Comments (${note.comments?.length || 0})`}
                  </a>
                  {expandedNotes.has(note.id) && (
                    <div className="mt-2 flex flex-col gap-1">
                      {note.comments?.map((c) => (
                        <div key={c.id} className="text-gray-800">
                          <strong>Comment:</strong> {c.contentMd}
                        </div>
                      ))}
                      <AddComment noteId={note.id} onAdd={(text) => addComment(note.id, text)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareNoteId && (
        <ShareNoteModal
          noteId={shareNoteId}
          isOpen={!!shareNoteId}
          onClose={() => setShareNoteId(null)}
          onShared={() => fetchNotes(view)}
          users={users}
          onShare={shareNote}
        />
      )}

      {/* New/Edit Note Modal */}
      {newNoteOpen && (
        <NoteModal
          note={editNote}
          onClose={() => { setNewNoteOpen(false); setEditNote(null); }}
          onSave={addOrEditNote}
        />
      )}
    </div>
  );
}

// --- NoteModal ---
function NoteModal({ note, onClose, onSave }: { note: Note | null; onClose: () => void; onSave: (title: string, content: string, visibility: "PUBLIC" | "PRIVATE") => void }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.contentMd || "");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(note?.visibility || "PRIVATE")

  const save = () => onSave(title, content, visibility);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-80">
        <h3 className="font-bold mb-3">{note ? "Edit Note" : "New Note"}</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border px-2 py-1 mb-2 rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full border px-2 py-1 mb-2 rounded"
        />
        <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="w-full border px-2 py-1 mb-4 rounded">
          <option value="PUBLIC">PUBLIC</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// // --- ShareNoteModal ---
// function ShareNoteModal({ noteId, isOpen, onClose, onShared, users, onShare }: { noteId: string; isOpen: boolean; onClose: () => void; onShared: () => void; users: User[]; onShare: (noteId: string, userId: string, permission: "READ" | "COMMENT" | "EDIT") => void }) {
//   const [selectedUser, setSelectedUser] = useState("");
//   const [permission, setPermission] = useState<"READ" | "COMMENT" | "EDIT">("READ");

//   const handleShare = () => {
//     if (!selectedUser) return alert("Select a user");
//     onShare(noteId, selectedUser, permission);
//     onShared();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white p-5 rounded shadow-lg w-80">
//         <h3 className="font-bold mb-3">Share Note</h3>
//         <select className="w-full border px-2 py-1 mb-2 rounded" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
//           <option value="">Select user</option>
//           {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
//         </select>
//         <select className="w-full border px-2 py-1 mb-4 rounded" value={permission} onChange={(e) => setPermission(e.target.value as any)}>
//           <option value="READ">READ</option>
//           <option value="COMMENT">COMMENT</option>
//           <option value="EDIT">EDIT</option>
//         </select>
//         <div className="flex justify-end gap-2">
//           <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
//           <button onClick={handleShare} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Share</button>
//         </div>
//       </div>
//     </div>
//   );
// }
