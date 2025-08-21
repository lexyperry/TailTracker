import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { startOfWeek, endOfWeek, format, parse, getDay, addMinutes, startOfDay} from "date-fns";
import { enUS } from "date-fns/locale";
import { getTasks, patchTaskStatus } from "../api";
import "react-big-calendar/lib/css/react-big-calendar.css"; 
import { Link } from "react-router-dom";

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: ((d)=> { startOfWeek(new Date(d), { weekStartsOn: 1 })}), 
    getDay, 
    locales: { "en-US": enUS },
});

function iso(date) {
    return date.toISOString(); 
}

// styling for task categories 
const CATEGORY_STYLES = {
  walk:  { pillBg: "bg-green-100",  pillText: "text-green-700",  dot: "bg-green-500",  cal: "#86efac" },
  feed:  { pillBg: "bg-amber-100",  pillText: "text-amber-800",  dot: "bg-amber-500",  cal: "#fde68a" },
  med:   { pillBg: "bg-rose-100",   pillText: "text-rose-700",   dot: "bg-rose-500",   cal: "#fca5a5" },
  groom: { pillBg: "bg-sky-100",    pillText: "text-sky-700",    dot: "bg-sky-500",    cal: "#7dd3fc" },
  vet:   { pillBg: "bg-purple-100", pillText: "text-purple-700", dot: "bg-purple-500", cal: "#c4b5fd" },
  other: { pillBg: "bg-gray-100",   pillText: "text-gray-700",   dot: "bg-gray-400",   cal: "#e5e7eb" },
};
const catStyle = (c) => CATEGORY_STYLES[c] || CATEGORY_STYLES.other;

export default function Dashboard() {
    const [events, setEvents] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [todayList, setTodayList] = useState([]);

    const range = useMemo(()=>{
        const date = new Date();
        const start = startOfWeek(date,{ weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1});
        return {start, end};      
    },[] );

    async function load() {
        try {
            setLoading(true); 
            setErr("");
            const tasks = await getTasks(iso(range.start), iso(range.end));
            const evs = tasks.map(t => ({
                        id: t.id,
                        title: `${t.title}`,
                        start: new Date(t.due_at),
                        end: addMinutes(new Date(t.due_at), 30),
                        resource: t,
            }));
            setEvents(evs);

            const startT = startOfDay(new Date());
            const endT = new Date(startT); 
            endT.setDate(endT.getDate() + 1);
            
            const today = tasks
                .filter((t) =>{
                    const d = new Date(t.due_at);
                    return d >= startT && d < endT;
                })
                .sort((a,b) => new Date(a.due_at) - new Date(b.due_at));

            setTodayList(today);
        } catch (e) {
            setErr(e.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { 
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl p-[1px]">
                        <div className="bg-white/70 backdrop-blur rounded-2xl px-6 py-5">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                                    Pet Scheduler
                                </h1>
                                <Link
                                    to="/pets"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition"
                                >
                                    Pets
                                </Link>
                                <br /> <br />
                                <Link
                                    to="/new-task"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition"
                                >
                                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                                    New Task
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {err && <div className="mb-3 text-red-600">{err}</div>}

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <h2 className="font-semibold mb-2">Today</h2>
                        {loading ? (
                            <div className="animate-pulse">Loading…</div>
                        ) : todayList.length === 0 ? (
                            <div className="text-sm text-gray-500">No tasks today</div>
                        ) : (
                            <ul className="space-y-2">
                                {todayList.map((t) => {
                                    const now = new Date();
                                    const due = new Date(t.due_at);
                                    const isOverdue = t.status === "pending" && due < now;
                                    const cs = catStyle(t.category);
                                    return (
                                        <li
                                            key={t.id}
                                            className={`border rounded-xl p-3 flex items-center justify-between ${
                                                isOverdue
                                                ? "border-red-200 bg-red-50/40"
                                                : "border-gray-200 bg-white"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">{t.title}</div>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cs.pillBg} ${cs.pillText}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${cs.dot}`} />
                                                        {t.category}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-[11px] px-2 py-0.5">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`text-xs ${
                                                        isOverdue ? "text-red-700" : "text-gray-600"
                                                    }`}
                                                >
                                                    {due.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                const next = t.status === "done" ? "pending" : "done";
                                                await patchTaskStatus(t.id, next);
                                                load();
                                                }}
                                                className={`text-xs px-3 py-1 rounded-lg font-semibold ${
                                                t.status === "done"
                                                    ? "bg-green-600 text-white hover:bg-green-500"
                                                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                                                }`}
                                            >
                                                {t.status === "done" ? "Undo" : "Done"}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="md:col-span-2 h-[600px]">
                        <h2 className="font-semibold mb-2">This Week</h2>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView="week"
                            views={["week"]}
                            style={{ height: "550px", background: "white" }}
                            onSelectEvent={(e) =>
                                alert(`${e.title}\n${e.start.toLocaleTimeString()}`)
                            }
                            eventPropGetter={(event) => {
                                const c = catStyle(event?.resource?.category);
                                return {
                                style: {
                                    backgroundColor: c.cal,
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    color: "#111827",
                                },
                                };
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}