import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';

// whenever you map through an array and output jsx as a list you need a key
const Alert = ({ alerts }) => {
    return (
        alerts !== null && alerts.length > 0 && alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.alertType}`}>
                {alert.msg}
            </div>
        ))
    )
}

Alert.propTypes = {
    alerts: PropTypes.array.isRequired,
}

const mapStateToProps = state => ({
    alerts: state.alert
})

export default connect(mapStateToProps)(Alert);
