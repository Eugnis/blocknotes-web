import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Main from './components/Main';
import NoteView from './components/NoteView';

// export interface IProps {

// }

// export interface IState {

// }

class Routes extends React.Component<{}, {}> {
    constructor(props: {}) {
      super(props);
      this.state = {
      };
    }
  
    // public componentDidMount() {
    // }
  
    public render() {
      return (
        <div>
          <Switch>
            <Route exact={true} path="/" component={Main} />
            <Route path="/:hash" component={NoteView} />
          </Switch>
        </div>
      );
    }
  
  }
  
  export default Routes;