import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

const App = () => (
  <>
    <AppRoutes />
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
  </>
);

export default App;
