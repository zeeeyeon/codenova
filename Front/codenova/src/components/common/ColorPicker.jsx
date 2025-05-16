const ColorPicker = ({ label, value, onChange}) => {
    return (
        <div className="flex w-full h-full justify-between items-center pl-8 pr-2">
                <div>{label}: </div>
                <div className="relative w-[30%] h-[70%]">
                    <input
                    type="color"
                    className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                    value={value}
                    onChange={onChange}
                />
                    {/* 예쁘게 보일 박스 */}
                    <div
                        className=" w-full h-full rounded border-2"
                        style={{ 
                            backgroundColor: value, 
                            borderColor: value,
                        }}
                    ></div>
                </div>
                

            </div>
    )
}

export default ColorPicker;