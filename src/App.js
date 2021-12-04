import { NotificationContainer } from "react-notifications"
import Mint from './Mint';
import './App.css';
import 'react-notifications/lib/notifications.css';

function App() {
  return (
    <div className="App">
      <NotificationContainer/>
      <Mint/>
    </div>
  );
}

export default App;
