import box from '../../assets/images/board1.jpg';


const Board2Container = ({children}) => {

    return (
        <div className='relative w-[50vw] h-[35vw] max-w-5xl py-12 px-6 flex flex-col items-center gap-6 rounded-2xl'
                style={{
                  backgroundImage: `url(${box})`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat'
                }}
              >
            {children}
        </div>
    )
};

export default Board2Container;
