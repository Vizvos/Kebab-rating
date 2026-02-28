import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import MapView from './components/Map';

function App() {
  return (
    <AuthProvider>
       <Navbar />
       <MapView />
    </AuthProvider>
  );
}

export default App;
