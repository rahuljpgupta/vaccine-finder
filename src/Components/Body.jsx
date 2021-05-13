import { Select, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody }from '@material-ui/core';
import axios from 'axios';
import { Component } from 'react';

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: null,
      districts: null
    }
  }

  getDateToday = () => {
    const date = new Date();
    return `${date.getDate()+1}-${date.getMonth()}-${date.getFullYear()}`;
  }

  fetchVaccineAvailability = (districts) => {
    const dateToday = this.getDateToday();
    const alldistrictsRequest = districts.map(district =>
      axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${
        district.district_id
      }&date=${dateToday}`));
    Promise.all(alldistrictsRequest)
    .then(res => {
      const sessions = res.map(item => item.data.sessions);
      this.setState({availableSessions: sessions.reduce((sessions, item) => {
        item.forEach(ses => sessions.push(ses));
        return sessions;
      }, [])})
    });
  }

  fetchDistrictsByState = (state) => {
    axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state.state_id}`)
    .then(res => {
      this.setState({
        districts: res.data
      })
      this.fetchVaccineAvailability(res.data.districts);
    })
  }

  handleChange = e => {
    this.setState({selectedState: e.target.value});
    this.fetchDistrictsByState(e.target.value);
  }
    render(){
      const { availableSessions } = this.state;
      console.log('availableSessions', availableSessions)
      const { states } = this.props;
      return (
        <div className="child2">
          <h3>Select State: </h3>
          <Select
            id="demo-mutiple-name"
            onChange={this.handleChange}
          >
            {states && states.map((state) => (
              <MenuItem key={state.state_id} value={state}>
                {state.state_name}
              </MenuItem>
            ))}
          </Select>
          {availableSessions && (
            <div>
          <h5>Availablity: </h5>

          <TableContainer component={Paper}>
            <Table className="" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>District</TableCell>
                  <TableCell align="right">Center Name</TableCell>
                  <TableCell align="right">Available Vaccine</TableCell>
                  <TableCell align="right">Minimum Age Limit</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Available Capacity</TableCell>
                  <TableCell align="right">Fee</TableCell>
                  <TableCell align="right">Address</TableCell>
                  <TableCell align="right">Pin Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableSessions.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.district_name}
                    </TableCell>
                    <TableCell align="right">{row.name}</TableCell>
                    <TableCell align="right">{row.vaccine}</TableCell>
                    <TableCell align="right">{row.min_age_limit}</TableCell>
                    <TableCell align="right">{row.date}</TableCell>
                    <TableCell align="right">{row.available_capacity}</TableCell>
                    <TableCell align="right">{row.fee}</TableCell>
                    <TableCell align="right">{row.address}</TableCell>
                    <TableCell align="right">{row.pincode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </div>)}
        </div>
      );
    }
  }
  
  export default Body;
  