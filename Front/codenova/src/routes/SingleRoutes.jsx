import { Routes, Route } from "react-router-dom";
import SingleLanguageSelectPage from "../pages/single/SingleLanguageSelectPage";
import CsSelectPage from "../pages/single/CsSelectPage";
import SinglePage from "../pages/single/SinglePage";
import CsFinishPage from "../pages/single/modal/CsFinishPage";

const SingleRoutes = () => {
  return (
    <Routes>
        {/* 예시임 그냥 */}
      {/* <Route path="game" element={<SinglePage />} /> */}
      <Route path="select/language" element={<SingleLanguageSelectPage/>} />
      <Route path="select/cs" element={<CsSelectPage/>} />
      <Route path="game" element={<SinglePage/>} />
      <Route path="game/cs/finish" element={<CsFinishPage/>}/>
    </Routes>
  );
};

export default SingleRoutes;
