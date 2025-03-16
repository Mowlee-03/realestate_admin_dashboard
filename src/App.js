import './App.css';
import AppRouting from './Pagerouting/AppRouting';
import { UserProvider } from './Provider/Userprovider';


function App() {
  
  return (
    <div className="App">
      <UserProvider>
        <AppRouting/>
     </UserProvider>
    </div>
  );
}

export default App;
