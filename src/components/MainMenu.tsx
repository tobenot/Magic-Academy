import AssetLoader from "../utils/AssetLoader";

const MainMenu = (): JSX.Element => {
  const imagePath =
    AssetLoader.getInstance().getSceneImagePath("main_menu.jfif");

  return (
    <div className="fixed inset-0 z-[-1]">
      <img
        src={imagePath}
        alt="Main Menu"
        className="h-screen w-full object-cover"
      />
    </div>
  );
};

export default MainMenu;
