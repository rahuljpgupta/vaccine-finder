import { Select, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, InputLabel, FormControl, Button,
  FormControlLabel, Checkbox }from '@material-ui/core';
import axios from 'axios';
import { Component } from 'react';

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: null,
      districts: null,
      eighteenPlus: false,
      covaxin: true,
      coviShield: true
    }
    this.dates = [
      {value: 0, name: 'Today'},
      {value: 1, name: 'Tomorrow'},
      {value: 2, name: 'Day after Tomorrow'}
    ]
  }

  getDateToday = (selectedDate) => {
    const date = new Date();

    return selectedDate && `${date.getDate() + selectedDate.value}-${date.getMonth()}-${date.getFullYear()}`;
  }

  fetchVaccineAvailability = (districts) => {
    const { selectedDate } = this.state;
    const date = this.getDateToday(selectedDate);

    const alldistrictsRequest = date && districts && districts.map(district =>
      axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${
        district.district_id
      }&date=${date}`));
      alldistrictsRequest && Promise.all(alldistrictsRequest)
    .then(res => {
      const sessions = res.map(item => item.data.sessions);
      this.setState({availableSessions: sessions.reduce((sessions, item) => {
        item.forEach(ses => sessions.push(ses));
        return sessions;
      }, [])})
    })
    .catch(error => {
      alert("Too many requests. Please try after 5 minutes.")
      // console.log(error)
    });
  }

  fetchDistrictsByState = (state) => {
    state && axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state.state_id}`)
    .then(res => {
      this.setState({
        districts: res.data
      })
      this.fetchVaccineAvailability(res.data.districts);
    })
  }

  handleChange = e => {
    this.setState({[e.target.name]: e.target.value});
  }

  handleCheckboxChange = e => {
    this.setState({[e.target.name]: e.target.checked});
  }

  handleSearch = () => {
    const { selectedState } = this.state;
    this.fetchDistrictsByState(selectedState);
  }

  getFiltererdAvaialableSessions = availableSessions => {
    if(!availableSessions) return;
    const { eighteenPlus, covaxin, coviShield } = this.state;
    let filtererdAvaialableSessions = availableSessions;

    if(eighteenPlus) {
      filtererdAvaialableSessions = availableSessions.filter(session => session.min_age_limit > 17 && session.min_age_limit < 45)
    }

    if(!covaxin) {
      filtererdAvaialableSessions = filtererdAvaialableSessions.filter(session => session.vaccine !== 'COVAXIN')
    }

    if(!coviShield) {
      filtererdAvaialableSessions = filtererdAvaialableSessions.filter(session => session.vaccine !== 'COVISHIELD')
    }
    // console.log(filtererdAvaialableSessions)
    return filtererdAvaialableSessions
  }

    render(){
      const { availableSessions } = this.state;
      const { states } = this.props;
      const filtererdAvaialableSessions = this.getFiltererdAvaialableSessions(availableSessions);

      return (
        <div className="body">
          <div className="body-controls">
            <FormControl className="dropdown-wrapper">
              <InputLabel id="state-simple-select-label">Select State</InputLabel>
              <Select
                id="state-simple-select"
                onChange={this.handleChange}
                className="state-dropdown"
                labelId="state-simple-select-label"
                name="selectedState"
              >
                {states && states.map((state) => (
                  <MenuItem key={state.state_id} value={state}>
                    {state.state_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="dropdown-wrapper">
              <InputLabel id="date-simple-select-label">Select Date</InputLabel>
              <Select
                id="date-simple-select"
                onChange={this.handleChange}
                className="state-dropdown"
                labelId="date-simple-select-label"
                name="selectedDate"
              >
                {this.dates.map((date) => (
                  <MenuItem key={date.value} value={date}>
                    {date.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={this.handleSearch} className="dropdown-wrapper" >
              Search
            </Button>
            <div className="state-dropdown"></div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.eighteenPlus}
                  onChange={this.handleCheckboxChange}
                  name="eighteenPlus"
                  color="primary"
                />
              }
              label="Only 18+"
            />
            <div className="dropdown-wrapper"></div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.covaxin}
                  onChange={this.handleCheckboxChange}
                  name="covaxin"
                  color="primary"
                />
              }
              label="Covaxin"
            />
            <div className="dropdown-wrapper"></div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.coviShield}
                  onChange={this.handleCheckboxChange}
                  name="coviShield"
                  color="primary"
                />
              }
              label="Covishield"
            />
            <div><a className="cowin-link" href="https://cowin.gov.in" target="_blank">CoWin</a></div>
          </div>
          {filtererdAvaialableSessions && (
          <div>
          <h4 style={{textAlign: 'left', marginLeft:'1rem'}}>Vaccine availablity: </h4>

          <TableContainer component={Paper}>
            <Table className="" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>District</TableCell>
                  <TableCell align="center">Center Name</TableCell>
                  <TableCell align="center">Available Vaccine</TableCell>
                  <TableCell align="center">Minimum Age Limit</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Available Capacity</TableCell>
                  <TableCell align="center">Fee</TableCell>
                  <TableCell align="center">Address</TableCell>
                  <TableCell align="center">Pin Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtererdAvaialableSessions.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.district_name}
                    </TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.vaccine}</TableCell>
                    <TableCell align="center">{row.min_age_limit}</TableCell>
                    <TableCell align="center">{row.date}</TableCell>
                    <TableCell align="center">{row.available_capacity}</TableCell>
                    <TableCell align="center">{row.fee}</TableCell>
                    <TableCell align="center">{row.address}</TableCell>
                    <TableCell align="center">{row.pincode}</TableCell>
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
  