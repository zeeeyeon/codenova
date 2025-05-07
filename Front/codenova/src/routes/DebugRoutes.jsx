import { Routes, Route} from "react-router-dom" 
import DebugPage from "../pages/debug/DebugPage";

const DebugRoutes = () => {
    return (
        <Routes>
            <Route path="/:lang" element={<DebugPage/>}/>
        </Routes>
    );
};

export default DebugRoutes;