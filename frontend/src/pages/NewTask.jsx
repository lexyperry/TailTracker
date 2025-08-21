import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getPets } from "../api";
import { createTask } from "../api";

function toISOFromLocal(dateStr, timeStr) {
  // dateStr: "2025-08-21", timeStr: "09:30"
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  return dt.toISOString();
}

export default function NewTask() {
  const nav = useNavigate();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [petId, setPetId] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(Math.round(d.getMinutes() / 5) * 5).padStart(2, "0");
    return `${hh}:${mm}`;
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPets();
        setPets(data);
        if (data.length > 0) setPetId(String(data[0].id));
      } catch (e) {
        setError(e.message || "Failed to load pets");
      } finally {
        setLoadingPets(false);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Please enter a title.");
    if (!petId) return setError("Please select a pet.");
    if (!date || !time) return setError("Please select date and time.");

    try {
      setSubmitting(true);
      const body = {
        pet_id: Number(petId),
        title: title.trim(),
        category,
        due_at: toISOFromLocal(date, time),
        notes: notes.trim(),
      };
      await createTask(body);
      nav("/"); // back to dashboard
    } catch (e) {
      setError(e.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
          New Task
        </h1>
        <p className="text-sm text-gray-500">Create a one-off task for a pet.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingPets ? (
          <div className="animate-pulse text-sm text-gray-500">Loading pets…</div>
        ) : pets.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              No pets found. Seed data first or create a pet via the API.
            </p>
            <Link to="/" className="text-indigo-600 hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="e.g., Morning walk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pet</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="walk">walk</option>
                  <option value="feed">feed</option>
                  <option value="med">med</option>
                  <option value="groom">groom</option>
                  <option value="vet">vet</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                rows="3"
                placeholder="Give with food, check leash, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}