import {createStore, combineReducers} from 'redux';
import employeeReducer from './Reducer/emplyee.Reducer';


const rootReducer = combineReducers({employeeReducer})
const store = createStore(rootReducer);

export default store;