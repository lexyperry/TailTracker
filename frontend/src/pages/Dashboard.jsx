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
    startOfWeek: ((d)=> {
        const date = new Date(d);
        startOfWeek(date, { weekStartsOn: 1 })
    }), 
    getDay, 
    locales: { "en-US": enUS },
});

function iso(date) {
    return date.toISOString(); 
}

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
            endT.setDate(endT.getDate()+1);
            
            const today = tasks
                .filter((t) =>{
                    const d = new Date(t.due_at);
                    return d >= startT && d < endT;
                })
                .sort((a,b) => new Date(a.due_at) - new Date(b.due_at));

            setTodayList(today);
        }   catch (e) {
            setErr(e.message || "Error");
        }   finally {
            setLoading(false);
        }
    }

    useEffect(() => { 
        load();
    }, []);

    return (
        <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl p-[1px]">
                <div className="bg-white/70 backdrop-blur rounded-2xl px-6 py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                        Pet Scheduler
                    </h1>
                    {err && <div className="mb-3 text-red-600">{err}</div>}

                        <div className="grid md:grid-cols-3 gap-4">
                            {/*Today List */}
                            <div className="md:col-span-1">
                                <h2 className="font-semibold mb-2">Today</h2>
                                {loading ? (
                                    <div className="animate-pulse">Loading...</div>
                                    ) : todayList.length === 0 ? (
                                        <div className="text-sm text-gray-500">No tasks today</div>
                                    ) : (
                                    <ul className="space-y-2">
                                        {todayList.map(t => (
                                            <li key={t.id} className="border rounded p-2 flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{t.title}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {new Date(t.due_at).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})} - {t.category}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        const next = t.status === "done" ? "pending" : "done";
                                                        await patchTaskStatus(t.id, next);
                                                        load();
                                                    } }
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        t.status==="done" 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-blue-100 text-blue-700"}`}
                                                    >
                                                    {t.status==="done" ? "Undo" : "Done"}
                                                </button>
                                            </li> 
                                    ))}
                                    </ul>
                                ) }
                    
                                <br />
                                <Link
                                    to="/new-task"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition"
                                    >
                                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                                    New Task
                                </Link>
                            </div>
                        </div>

                        {/* Week Calendar */}
                        <div className="md:col-span-2 h-[600px]">
                            <h2 className="font-semibold mb-2">This Week</h2>
                            <Calendar 
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                defaultView="week"
                                views={["week"]}
                                style={{height:"500px", background:"white"}}
                                onSelectEvent={(e) => 
                                    alert(`${e.title}\n${e.start.toLocaleTimeString()}`)}
                            /> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}