const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export async function getPets(){
    const r = await fetch(`${API}/pets`);
    if (!r.ok) throw new Error("Failed to fetch pets");
    return r.json();
}

export async function getTasks(fromISO, toISO) {
    const url = new URL(`${API}/tasks`);
    if (fromISO && toISO){
        url.searchParams.set("from", fromISO);
        url.searchParams.set("to", toISO);
    }
    const r = await fetch(url);
    if (!r.ok) throw new Error("Failed to fetch tasks");
    return r.json();
}

export async function patchTaskStatus(id, status) {
    const r = await fetch(`${API}/tasks/${id}/status`,{
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ status })

    });
    if (!r.ok) throw new Error("Failed to update status");
    return r.json();
    
}
export async function createTask(body){
    const r = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ body })
    });

    if (!r.ok) {
        const text=await r.text();
        throw new Error(text || "Failed to create tasks")
    }
    return r.json();
}
