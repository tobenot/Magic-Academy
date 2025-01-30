import { useState } from "react";
import AuthForm from "./components/AuthForm";
import ChatRoom from "./components/ChatRoom";
import MainMenu from "./components/MainMenu";

const App = (): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = (): void => {
    setIsAuthenticated(true);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {!isAuthenticated ? (
        <>
          <AuthForm onLoginSuccess={handleLoginSuccess} />
          <MainMenu />
        </>
      ) : (
        <ChatRoom />
      )}
    </div>
  );
};

export default App;
