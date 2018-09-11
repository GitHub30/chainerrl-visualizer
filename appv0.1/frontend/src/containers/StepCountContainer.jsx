import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card, CardBody,
} from 'reactstrap';

const StepCountContainer = ({ step, reward }) => (
  <div>
    <Card>
      <CardBody style={{ padding: '0.25rem', paddingLeft: '20px' }}>
        {
          reward > 0 ? (
            <p style={{ margin: 0, textAlign: 'center' }}>
              step
              {' '}
              <span style={{ fontSize: '30px', marginRight: '20px' }}>
                {step}
              </span>
              reward
              {' '}
              <strong style={{ fontSize: '30px' }}>
                {reward}
              </strong>
            </p>
          ) : (
            <p style={{ margin: 0, textAlign: 'center' }}>
              step
              {' '}
              <span style={{ fontSize: '30px', marginRight: '20px' }}>
                {step}
              </span>
              reward
              {' '}
              <span style={{ fontSize: '30px' }}>
                {reward}
              </span>
            </p>
          )
        }
      </CardBody>
    </Card>
  </div>
);

StepCountContainer.propTypes = {
  step: PropTypes.number.isRequired,
  reward: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  step: state.plotRange.focusedStep,
  reward: state.log.logDataRows.length > 0 ? state.log.logDataRows[state.plotRange.focusedStep].reward : 0,
});

export default connect(mapStateToProps, null)(StepCountContainer);
