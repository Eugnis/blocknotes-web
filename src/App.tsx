import * as React from 'react';
import ReactGA from 'react-ga';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Routes from './Routes';

class App extends React.Component {
  public componentDidMount() {
    ReactGA.initialize('UA-127863694-2');
  }
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
