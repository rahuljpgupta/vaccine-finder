import { Select, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, InputLabel, FormControl, Button,
  FormControlLabel, Checkbox }from '@material-ui/core';
import axios from 'axios';
import { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: null,
      districts: null,
      eighteenPlus: false,
      covaxin: true,
      coviShield: true,
      selectedDate: new Date(),
    }
  }

  getParsedDate = (selectedDate) => {
    const date = new Date(selectedDate);

    return selectedDate && `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
  }

  fetchVaccineAvailability = (districts) => {
    const { selectedDate } = this.state;
    const date = this.getParsedDate(selectedDate);

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

  handleDateChange = date => {
    this.setState({selectedDate: date})
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
    let filtererdAvaialableSessions =  cloneDeep(availableSessions);

    if(eighteenPlus) {
      filtererdAvaialableSessions = filtererdAvaialableSessions.filter(session => session.min_age_limit > 17 && session.min_age_limit < 45)
    }

    if(!covaxin) {
      filtererdAvaialableSessions = filtererdAvaialableSessions.filter(session => session.vaccine !== 'COVAXIN')
    }

    if(!coviShield) {
      filtererdAvaialableSessions = filtererdAvaialableSessions.filter(session => session.vaccine !== 'COVISHIELD')
    }

    return filtererdAvaialableSessions;
  }

    render(){
      const { availableSessions, selectedDate } = this.state;
      const { states } = this.props;
      const filtererdAvaialableSessions = this.getFiltererdAvaialableSessions(availableSessions);

      return (
        <div className="body">
          <div className="body-controls">
            <div style={{paddingTop: '16px'}}>
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
            </div>
            <div className="dropdown-wrapper">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className="state-dropdown"
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Select Date"
                value={selectedDate}
                onChange={this.handleDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            </div>
            <div className="search-button-wrapper">
            <Button variant="contained" color="primary" onClick={this.handleSearch} className="dropdown-wrapper" >
              Search
            </Button>
            </div>
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
            <div><a className="cowin-link" href="https://cowin.gov.in" target="_blank" rel="noreferrer">CoWin</a></div>
          </div>
          {filtererdAvaialableSessions && filtererdAvaialableSessions.length > 0 && (
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
                {filtererdAvaialableSessions.map((row, index) => (
                  <TableRow key={`${row.name}-${index}`}>
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
  