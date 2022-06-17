import { Route, Switch } from 'react-router-dom';
import './App.css';
import EditProfile from './components/EditProfile';
import UserProfileView from './components/UserProfileView';

function App() {

  return (
    <div className="App">
        <Switch>
          <Route exact path="/">
            <UserProfileView/>
          </Route>
          <Route path="/user/edit/:id">
            <EditProfile/>
          </Route>
        </Switch>
    </div>
  );
}

export default App;
