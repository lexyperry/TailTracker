import Dashboard from "./pages/Dashboard";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import NewTask from "./pages/NewTask";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-task" element={<NewTask />} />
      </Routes>
    </BrowserRouter>
  );
}
