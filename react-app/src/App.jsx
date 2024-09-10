
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FormPage from "./pages/FormPage";
import HomePage from "./pages/HomePage";
import SharedLayout from "./components/SharedLayout";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SharedLayout />}>
                <Route path="/forms" element={<FormPage/>}></Route>
                <Route index element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>

    </div>
  );
}

export default App;
