import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from "./Views/HomePage/HomePage";
import TableView from "./Views/TableView/TableView";

function App() {
  return (
    <>
    <BrowserRouter>
      <Switch>
        <Route path="/" component={HomePage}/>
        <Route path="/table" component={TableView}/>
      </Switch>
    </BrowserRouter>
    </>
  );
}

export default App;
