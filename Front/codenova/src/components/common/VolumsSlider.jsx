const VolumeSlider = ({ label, value, onChange }) => {
    return (
        <div className="flex items-center gap-4 w-[full] h-[50%] text-white">
            <div className="w-[60%] text-right text-xl">{label}</div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={onChange}
                className="w-full"
            />
            <span className="w-12 text-left">{value}%</span>
        </div>
    );
};

export default VolumeSlider