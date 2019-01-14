import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Routes from './Routes';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <ToastContainer />
        <Routes />
      </div> 
    );
  }
}

export default App;
