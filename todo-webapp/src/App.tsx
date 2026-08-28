import { Routes, Route } from "react-router-dom";
import CallbackPage from "./pages/Callback";
import ProtectedTodoList from "./pages/ProtectedTodoList";

export default function App() {
  return (
    <Routes>
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/" element={<ProtectedTodoList />} />
    </Routes>
  );
}
