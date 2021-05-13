
const initialState = {
    name: ''
}

export default function employeeReducer(state = initialState, action) {
    switch(action.type){
        case 'set_name':
            return {
                ...state,
                name: action.payload.name
            }
        default: 
            return state;
    }
    
};