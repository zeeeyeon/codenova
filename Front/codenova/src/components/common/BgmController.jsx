import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import mainBgm from "../assets/sounds/mainBGM.mp3";
import gameBgm from "../assets/sounds/meteoBGM.mp3";

const BgmController = () => {

    const location = useLocation();
    const audioRef = useRef(new Audio());
    const [currentBgm, setCurrentBgm] = useState("");
}

export default BgmController;