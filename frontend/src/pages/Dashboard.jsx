import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { startOfWeek, endOfWeek, format, parse, getDay, addMinutes, startOfDay} from "date-fns";
import { enUS } from "date-fns/locale";
import { getTasks, patchTaskStatus } from "../api";

const localizer = dateFnsLocalizer({
    format, parse, startOfWeek: (d)=>startOfWeek(d), getDay, 
    locales: { "en-US": enUS}
})

function iso(date) {return date.toISOString(); }

export default function Dashboard() {
    debugger;
    const [events, setEvents] = useState([]); 
    const [loading, setLoading] = useState([]);
    const [err, setErr] = useState("");
    const [todayList, setTodayList] = useState([]);

    const range = useMemo(()=>{
        const start = startOfWeek(new Date(),{ weekStartsOn: 0 });
        const end = endOfWeek(new Date(), { weekStartsOn: 0});
        return {start, end};      
    },[] );

    async function load() {
        try {
            setLoading(true); 
            setErr("");
            const tasks = await getTasks(iso(range.start), iso(range.end));
            const ens = tasks.map(t => ({
                        id: t.id,
                        title: `${t.title}`,
                        start: new Date(t.due_at),
                        end: addMinutes(new Date(t.due_at), 30),
                        resource: t
            }));
            setEvents(ens);
            const startT = startOfDay(new Date());
            const endT = new Date(startT); 
            endT.setDate(endT.getDate()+1);
            const today = tasks
                .filter(t =>{
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

    useEffect(() => { load();}, []);

    return (
        <div className="p-4 max-w-6x1 mx-auto">
            <h1 className="text-2x1 font-bold mb-4">Pet Scheduler</h1>

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
                                        onClick={async ()=>{
                                            const next = t.status === "done" ? "pending" : "done";
                                            await patchTaskStatus(t.id, next);
                                            load();
                                        } }
                                        className={`text-xs px-2 py-1 rounded ${t.status==="done" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                                        >
                                        {t.status==="done" ? "Undo" : "Done"}
                                    </button>
                                </li> 
                        ))}
                        </ul>
                    ) }
                </div>
            </div>

            {/* Week Calendar */}
            <div className="md:col-span-2 h-[600px]">
                <h2 className="font-semibold mb-2">This Week</h2>
                <Calendar localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{height:"500px", background:"white"}}
                    onSelectEvent={(e) => alert(`${e.title}\n${e.start.toLocaleTimeString()}`)}
                   /> 
            </div>
        </div>
    );
}