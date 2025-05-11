import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App'
import { Provider } from 'react-redux'
import { store, persistor } from "./redux/store.js"
import { PersistGate } from 'redux-persist/integration/react';
import { SocketProvider } from './socket/SocketContext.jsx';
window.global=window;
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </PersistGate>
  </Provider>
)
