import Dashboard from "./pages/Dashboard";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import NewTask from "./pages/NewTask";
import Pets from "./pages/Pets";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-task" element={<NewTask />} />
        <Route path="/pets" element={<Pets /> }/>
      </Routes>
    </BrowserRouter>
  );
}
