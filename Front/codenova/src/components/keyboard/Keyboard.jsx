import Key from './Key'
import num0Img from '../../assets/images/keyboard/0.png'
import num1Img from '../../assets/images/keyboard/1.png'
import num2Img from '../../assets/images/keyboard/2.png'
import num3Img from '../../assets/images/keyboard/3.png'
import num4Img from '../../assets/images/keyboard/4.png'
import num5Img from '../../assets/images/keyboard/5.png'
import num6Img from '../../assets/images/keyboard/6.png'
import num7Img from '../../assets/images/keyboard/7.png'
import num8Img from '../../assets/images/keyboard/8.png'
import num9Img from '../../assets/images/keyboard/9.png'
import aImg from '../../assets/images/keyboard/A.png'
import altImg from '../../assets/images/keyboard/ALT.png'
import altgrImg from '../../assets/images/keyboard/ALTGR.png'
import arrowDownImg from '../../assets/images/keyboard/ARROWDOWN.png'
import arrowLeftImg from '../../assets/images/keyboard/ARROWLEFT.png'
import arrowRightImg from '../../assets/images/keyboard/ARROWRIGHT.png'
import arrowUpImg from '../../assets/images/keyboard/ARROWUP.png'
import bImg from '../../assets/images/keyboard/B.png'
import backSpaceImg from '../../assets/images/keyboard/BACKSPACE.png'
import cImg from '../../assets/images/keyboard/C.png'
import capsImg from '../../assets/images/keyboard/CAPS.png'
import closecurlyImg from '../../assets/images/keyboard/CLOSECURLY.png'
import colonImg from '../../assets/images/keyboard/COLON.png'
import ctrlImg from '../../assets/images/keyboard/CTRL.png'
import dImg from '../../assets/images/keyboard/D.png'
import eImg from '../../assets/images/keyboard/E.png'
import enterImg from '../../assets/images/keyboard/ENTER.png'
import fImg from '../../assets/images/keyboard/F.png'
import gImg from '../../assets/images/keyboard/G.png'
import greaterthanImg from '../../assets/images/keyboard/GREATERTHAN.png'
import hImg from '../../assets/images/keyboard/H.png'
import iImg from '../../assets/images/keyboard/I.png'
import jImg from '../../assets/images/keyboard/J.png'
import kImg from '../../assets/images/keyboard/K.png'
import lImg from '../../assets/images/keyboard/L.png'
import lessthanImg from '../../assets/images/keyboard/LESSTHAN.png'
import mImg from '../../assets/images/keyboard/M.png'
import nImg from '../../assets/images/keyboard/N.png'
import oImg from '../../assets/images/keyboard/O.png'
import opencurlyImg from '../../assets/images/keyboard/OPENCURLY.png'
import pImg from '../../assets/images/keyboard/P.png'
import pipeImg from '../../assets/images/keyboard/PIPE.png'
import plusImg from '../../assets/images/keyboard/PLUS.png'
import qImg from '../../assets/images/keyboard/Q.png'
import questionmarkImg from '../../assets/images/keyboard/QUESTIONMARK.png'
import quoteImg from '../../assets/images/keyboard/QUOTE.png'
import rImg from '../../assets/images/keyboard/R.png'
import sImg from '../../assets/images/keyboard/S.png'
import shiftImg from '../../assets/images/keyboard/SHIFT.png'
import shiftbiggerImg from '../../assets/images/keyboard/SHIFTBIGGER.png'
import spaceImg from '../../assets/images/keyboard/SPACE.png'
import tImg from '../../assets/images/keyboard/T.png'
import tapImg from '../../assets/images/keyboard/TAB.png'
import tilbeImg from '../../assets/images/keyboard/TILDE.png'
import uImg from '../../assets/images/keyboard/U.png'
import underscopeImg from '../../assets/images/keyboard/UNDERSCORE.png'
import vImg from '../../assets/images/keyboard/V.png'
import wImg from '../../assets/images/keyboard/W.png'
import windowsImg from '../../assets/images/keyboard/WINDOWS.png'
import xImg from '../../assets/images/keyboard/X.png'
import yImg from '../../assets/images/keyboard/Y.png'
import zImg from '../../assets/images/keyboard/Z.png'

import clickSound from '../../assets/sound/keyboardSound2.mp3'

import { useEffect, useState, useRef} from 'react'



const Keyboard = () => {

    const [pressKey, setPressKey] = useState(null); // 현재 눌린키

    const audioRef = useRef(null);

    const keyboardMap = [
        ['tilbe','1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'plus', 'underscore'],
        ['tap','q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'open', 'close', 'pipe'],
        ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'colon', 'quote', 'enter'],
        ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'lessthan', 'greaterthan', 'question', 'shiftbig', 'arrowup'],
        ['ctrl', 'window', 'alt', 'space', 'alt', 'ctrl' , 'arrowleft', 'arrowdown', 'arrowright']
    ]
    // 작은거 너비 19 높이 21
    // TAB ALT 너비 33px
    // caps, ctrl 너비 41px
    // shift, altlarge 너비 49px
    // space 너비 98px

    const keyboardLayout = [
        // 첫번째 줄
        { id: '`', top: 0, left: 0, sprite: tilbeImg },
        { id: '1', top: 0, left: 25, sprite: num1Img },
        { id: '2', top: 0, left: 50, sprite: num2Img },
        { id: '3', top: 0, left: 75, sprite: num3Img },
        { id: '4', top: 0, left: 100, sprite: num4Img },
        { id: '5', top: 0, left: 125, sprite: num5Img },
        { id: '6', top: 0, left: 150, sprite: num6Img },
        { id: '7', top: 0, left: 175, sprite: num7Img },
        { id: '8', top: 0, left: 200, sprite: num8Img },
        { id: '9', top: 0, left: 225, sprite: num9Img },
        { id: '0', top: 0, left: 250, sprite: num0Img },
        { id: '-', top: 0, left: 275, sprite: underscopeImg },
        { id: '=', top: 0, left: 300, sprite: plusImg },
        { id: 'backspace', top: 0, left: 325, sprite: backSpaceImg },

        // 두번째줄
        { id: 'tab', top: 25, left: 0, sprite: tapImg},
        { id: 'q', top: 25, left: 38, sprite: qImg },
        { id: 'w', top: 25, left: 63, sprite: wImg },
        { id: 'e', top: 25, left: 88, sprite: eImg },
        { id: 'r', top: 25, left: 113, sprite: rImg },
        { id: 't', top: 25, left: 138, sprite: tImg },
        { id: 'y', top: 25, left: 163, sprite: yImg },
        { id: 'u', top: 25, left: 188, sprite: uImg },
        { id: 'i', top: 25, left: 213, sprite: iImg },
        { id: 'o', top: 25, left: 238, sprite: oImg },
        { id: 'p', top: 25, left: 263, sprite: pImg },
        { id: '\\', top: 25, left: 288, sprite: pipeImg },
        { id: '[', top: 25, left: 313, sprite: opencurlyImg },
        { id: 'enter', top: 25, left: 338, sprite: enterImg },

        // 세번째줄
        { id: 'capslock', top: 50, left: 0, sprite: capsImg},
        { id: 'a', top: 50, left: 47, sprite: aImg },
        { id: 's', top: 50, left: 72, sprite: sImg },
        { id: 'd', top: 50, left: 97, sprite: dImg },
        { id: 'f', top: 50, left: 122, sprite: fImg },
        { id: 'g', top: 50, left: 147, sprite: gImg },
        { id: 'h', top: 50, left: 172, sprite: hImg },
        { id: 'j', top: 50, left: 197, sprite: jImg },
        { id: 'k', top: 50, left: 222, sprite: kImg },
        { id: 'l', top: 50, left: 247, sprite: lImg },
        { id: ';', top: 50, left: 272, sprite: colonImg },
        { id: '\'', top: 50, left: 297, sprite: quoteImg },
        { id: ']', top: 50, left: 322, sprite: closecurlyImg },

        // 네번째줄
        { id: 'shift', top: 75, left: 0, sprite: shiftImg},
        { id: 'z', top: 75, left: 55, sprite: zImg },
        { id: 'x', top: 75, left: 80, sprite: xImg },
        { id: 'c', top: 75, left: 105, sprite: cImg },
        { id: 'v', top: 75, left: 130, sprite: vImg },
        { id: 'b', top: 75, left: 155, sprite: bImg },
        { id: 'n', top: 75, left: 180, sprite: nImg },
        { id: 'm', top: 75, left: 205, sprite: mImg },
        { id: ',', top: 75, left: 230, sprite: lessthanImg },
        { id: '.', top: 75, left: 255, sprite: greaterthanImg },
        { id: '/', top: 75, left: 280, sprite: questionmarkImg },
        { id: 'shfit', top: 75, left: 305, sprite: shiftbiggerImg },
        { id: 'arrowup', top: 75, left: 372, sprite: arrowUpImg },

         // 다섯번째줄
         // ['ctrl', 'window', 'alt', 'space', 'alt', 'ctrl' , 'arrowleft', 'arrowdown', 'arrowright']
         { id: 'control', top: 100, left: 0, sprite: ctrlImg},
         { id: '0', top: 100, left: 52, sprite: windowsImg}, //윈도우는 안눌러지게
         { id: 'alt', top: 100, left: 82, sprite: altImg },
         { id: ' ', top: 100, left: 126, sprite: spaceImg },
         { id: 'hangulmode', top: 100, left: 235, sprite: altgrImg },
         { id: 'hanjamode', top: 100, left: 295, sprite: ctrlImg },
         { id: 'arrowleft', top: 100, left: 347, sprite: arrowLeftImg },
         { id: 'arrowdown', top: 100, left: 372, sprite: arrowDownImg },
         { id: 'arrowright', top: 100, left: 397, sprite: arrowRightImg }
    ];

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();         // 기존 소리 중단
            audioRef.current.currentTime = 0; // 항상 처음부터 재생
            audioRef.current.play().catch(e => {
                // console.log('오디오 재생 실패', e)
            });
        }
    }

    useEffect(() => {
        audioRef.current = new Audio(clickSound);
        audioRef.current.volume = 0.5;
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // console.log(e.key)
            setPressKey(e.key.toLowerCase());
            playSound();
        };

        const handleKeyUp = () => {
            setPressKey(null);
        };

        window.addEventListener('keydown',handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);


        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }

    },[])


    return (
        <div className = "relative w-[500px] h-[140px] scale-[1.3] origin-top-left">
            {keyboardLayout.map((key, idx) => (
                <Key
                    key={idx}
                    sprite={key.sprite}
                    label={key.id}
                    isPressed={pressKey === key.id}
                    index={0}
                    style={{ top: `${key.top}px`, left: `${key.left}px` }}
                />
            ))}
        </div>
    );
}

export default Keyboard;

