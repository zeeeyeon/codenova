import { useEffect, useState } from 'react'


const Key = ({ sprite , label = '', index = 0, className = '', isPressed= false ,style = {} }) => {
    const [keyWidth, setKeyWidth] = useState(0);
    const [keyHeight, setKeyHeight] = useState(0);

    useEffect(() => {

        const img = new Image();
        img.src = sprite;
        img.onload = () => {
            setKeyWidth(img.width /3); // 실제 키 하나의 너비
            setKeyHeight(img.height) 
        };
    }, [sprite]);

    if (!keyWidth || !keyHeight) {
        return null;
    }

    return (
        <div
            className= {`absolute ${className}`}
            style={{
                width: `${keyWidth}px`,
                height: `${keyHeight}px`,
                backgroundImage: `url(${sprite})`,
                // backgroundPosition: `-${index * keyWidth}px 0`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${keyWidth * 3}px ${keyHeight}px`, //전체 이미지 크기 
                backgroundPosition: `-${(isPressed ? 1 : 0) * keyWidth}px 0`,
                ...style,
            }}
            title={label}
        />
    );
};

export default Key;