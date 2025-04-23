import multibg from "../../assets/images/multi_background.png";
import Header from "../../components/common/Header";

const MainPage = () => {
    return (
      <div
        className="h-screen w-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${multibg})` }}>
          <Header/>
      </div>
    );
  };
  
  export default MainPage;
  