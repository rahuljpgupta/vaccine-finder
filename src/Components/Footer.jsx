import { connect } from 'react-redux';

function Footer(props) {
    return (
        <div className="footer">
            <h4>{props.username}</h4>
        </div>
    );
}


const mapStateToProps = state => ({
    username: state.employeeReducer.name
})

export default connect(mapStateToProps)(Footer);
