import React from "react";

const MainMenu = (): JSX.Element => {
  return (
    <div className="fixed inset-0 z-[-1]">
      <img
        src="/assets/main_menu.jfif"
        alt="Main Menu"
        className="h-screen w-full object-cover"
      />
    </div>
  );
};

export default MainMenu;
