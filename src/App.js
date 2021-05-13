import './App.css';
import Header from './Components/Header';
import Body from './Components/Body';
import Footer from './Components/Footer';
import { Provider } from 'react-redux';
import store from './Store/store';
import { Component } from 'react';
import axios from 'axios';


class App extends Component {
  constructor(props) {
    super(props);
    this.state= {
      statesDate: null
    }
  }

  fetchStates = () => {
    axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/states')
    .then(res => {
      this.setState({stateData: res.data.states})
    })
  }
  componentDidMount() {
    this.fetchStates();
  }
  render() {
    const { stateData } = this.state;
    console.log(stateData)
    return (
      <Provider store={store}>
        <div className="App">
          <Header />
          <Body states={stateData}/>
          <Footer />
        </div>
      </Provider>
    );
  }
}
 export default App;
