import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from "./Views/HomePage/HomePage";
import TableView from "./Views/TableView/TableView";
import AllEffects from "./Effects/AllEffects/AllEffects";
import HelpBar from './SharedComponents/HelpBar/HelpBar';

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <AllEffects />
        <HelpBar/>
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/table" component={TableView} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
