import React from 'react';
import {
    BrowserRouter as Router,
    HashRouter,
    Route,
    Switch,
    Link,
    Redirect
} from "react-router-dom"

import IndexPage from './Pages/Index.jsx';
import AboutPage from './Pages/About.jsx';

function App() {
  return (
    <div className="App">

      <div style={{textAlign:"center"}}>
          <Router basename="/">
              <Switch>
                  <Route exact path="/"><IndexPage/></Route>
                  <Route path="/about"><AboutPage/></Route>
              </Switch>

          </Router>
      </div>
    </div>
  );
}

export default App;
