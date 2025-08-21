import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPets, createPet, updatePet, deletePet } from "../api";

export default function Pets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // new pet form
    const [name, setName] = useState("");
    const [species, setSpecies] = useState("dog");
    const [notes, setNotes] = useState("");

    // state for edits
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editSpecies, setEditSpecies] = useState("dog");
    const [editNotes, setEditNotes] = useState("");

    async function load() {
    try {
        setLoading(true);
        setErr("");
        const data = await getPets();
        setPets(data);
    } catch (e) {
        setErr(e.message || "Failed to load pets");
    } finally {
        setLoading(false);
    }
    }

    useEffect(() => {
    load();
    }, []);

    async function onCreate(e) {
        e.preventDefault();
        if (!name.trim()) return setErr("Please enter a pet name.");
        try {
            await createPet({ 
                name: name.trim(), 
                species,
                notes: notes.trim()
                });
            setName(""); setSpecies("dog");
            setNotes("");
            load();
        } catch (e) {
            setErr(e.message || "Failed to create pet");
        }
    }

    function startEdit(p) {
        setEditId(p.id);
        setEditName(p.name);
        setEditSpecies(p.species || "dog");
        setEditNotes(p.notes || "");
        setErr("");
    }

    async function onSaveEdit(e) {
        e.preventDefault();
        if (!editName.trim()) return setErr("Please enter a pet name.");
        try {
            await updatePet(editId, {
                name: editName.trim(),
                species: editSpecies,
                notes: editNotes.trim(),
            });
            setEditId(null);
            load();
        } catch (e) {
            setErr(e.message || "Failed to update pet");
        }
    }

    async function onDelete(id) {
        if (!confirm("Delete this pet? This also deletes its tasks.")) {
            return;
        }
        try {
            await deletePet(id);
            load();
        } catch (e) {
            setErr(e.message || "Failed to delete pet");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl p-[1px]">
                        <div className="bg-white/70 backdrop-blur rounded-2xl px-6 py-5">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                                    Pets
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/"
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition"
                                    >
                                        Dashboard
                                    </Link>
                                    <br /><br />
                                    <Link
                                        to="/new-task"
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition"
                                    >
                                        New Task
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {err && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {err}
                    </div>
                    )}

                    {/* new pet form */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
                        <h2 className="font-semibold mb-3">Add a Pet</h2>
                        <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="Pet name (e.g., Bella)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <select
                                className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}>
                                <option value="dog">dog</option>
                                <option value="cat">cat</option>
                                <option value="bird">bird</option>
                                <option value="other">other</option>
                            </select>
                            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                                <input
                                    className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    placeholder="Notes (optional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)} />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-indigo-500"
                                >
                                    Add Pet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* pet list */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="animate-pulse text-sm text-gray-500">Loading pets…</div>
                        ) : pets.length === 0 ? (
                            <div className="text-sm text-gray-600">
                                No pets yet. Add one above to get started.
                            </div>
                        ) : (
                            pets.map((p) =>
                                editId === p.id ? (
                                    <form
                                        key={p.id}
                                        onSubmit={onSaveEdit}
                                        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
                                        >
                                        <input
                                            className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                            <select
                                                className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                                value={editSpecies}
                                                onChange={(e) => setEditSpecies(e.target.value)}
                                            >
                                                <option value="dog">dog</option>
                                                <option value="cat">cat</option>
                                                <option value="bird">bird</option>
                                                <option value="other">other</option>
                                            </select>
                                        <input
                                            className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                            value={editNotes}
                                            placeholder="Notes (optional)"
                                            onChange={(e) => setEditNotes(e.target.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="submit"
                                                className="rounded-xl bg-green-600 px-3 py-2 text-white font-semibold hover:bg-green-500"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditId(null)}
                                                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div
                                        key={p.id}
                                        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center justify-between"
                                    >
                                    <div>
                                        <div className="font-semibold">{p.name}</div>
                                        <div className="text-xs text-gray-600">
                                            {p.species || "other"} {p.notes ? "• " + p.notes : ""}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(p)}
                                            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(p.id)}
                                            className="rounded-xl bg-rose-600 px-3 py-2 text-white font-semibold hover:bg-rose-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
