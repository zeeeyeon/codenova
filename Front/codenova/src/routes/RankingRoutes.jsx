import { Routes, Route} from "react-router-dom" 
import RankingPage from "../pages/ranking/Ranking";

const MyPageRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RankingPage/>}/>
        </Routes>
    );
};

export default MyPageRoutes;