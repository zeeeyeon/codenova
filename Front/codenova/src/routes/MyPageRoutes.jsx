import { Routes, Route} from "react-router-dom" 
import MyPage from "../pages/mypage/MyPage";
import MyReport from "../pages/mypage/MyReport";

const MyPageRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MyPage/>}/>
            <Route path="report" element={<MyReport/>}/>
        </Routes>
    );
};

export default MyPageRoutes;