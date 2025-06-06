import { Routes, Route } from "react-router-dom";
import SingleLanguageSelectPage from "../pages/single/SingleLanguageSelectPage";
import CsSelectPage from "../pages/single/CsSelectPage";
import SinglePage from "../pages/single/SinglePage";
import FinishPage from "../pages/single/modal/FinishPage";
import CsWordSelectPage from "../pages/single/modal/CsWordSelectPage"

const SingleRoutes = () => {
  return (
    <Routes>
        {/* 예시임 그냥 */}
      {/* <Route path="game" element={<SinglePage />} /> */}
      <Route path="select/language" element={<SingleLanguageSelectPage/>} />
      <Route path="select/cs" element={<CsSelectPage/>} />
      <Route path="game/:lang" element={<SinglePage/>} />
      <Route path="game/finish" element={<FinishPage/>}/>
      <Route path="game/select/word" element={<CsWordSelectPage/>}/>
    </Routes>
  );
};

export default SingleRoutes;
