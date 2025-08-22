import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/router";

async function fetchNote(id: string) {
  const res = await fetch(`/api/notes/${id}`);
  return res.json();
}

async function fetchComments(id: string) {
  const res = await fetch(`/api/notes/${id}/comments`);
  return res.json();
}

export default function NoteDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const queryClient = useQueryClient();

  const { data: note } = useQuery({ queryKey: ["note", id], queryFn: () => fetchNote(id), enabled: !!id });
  const { data: comments } = useQuery({ queryKey: ["comments", id], queryFn: () => fetchComments(id), enabled: !!id });

  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async (c: string) => {
      await fetch(`/api/notes/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: c }),
      });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  if (!note) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
      <article className="whitespace-pre-wrap mb-4">{note.content}</article>

      <section>
        <h2 className="font-semibold mb-2">Comments</h2>
        <ul className="space-y-2 mb-4">
          {comments?.items?.map((c: any) => (
            <li key={c.id} className="p-2 rounded bg-gray-100">
              <p className="text-sm">{c.content}</p>
              <p className="text-xs text-gray-500">by {c.user.email}</p>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(comment);
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 border rounded px-2 py-1"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
