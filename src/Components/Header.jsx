
import { setName } from '../Store/Actions/employee.action'
import { connect } from 'react-redux';

function Header(props) {
    props.setEmployeeName('Rahul');
    return (
        <div className="Header">
            <h3>Find Vaccine availability in your State</h3>
        </div>
    );
}

const mapDispatchToProps = dispatch => ({
    setEmployeeName: (name) => dispatch(setName(name))
})
export default connect(null, mapDispatchToProps)(Header);
