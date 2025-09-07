import Protected from "./components/Auth/Protected";
import Home from "./components/Todo/Home";
import AuthProvider from "./context/AuthContext";
import DataProvider from "./context/DataContext";

const App = () => {
  return (
    <AuthProvider>
      <Protected>
        <DataProvider>
          <Home />
        </DataProvider>
      </Protected>
    </AuthProvider>
  );
};

export default App;
