import React from 'react';
import PropTypes from 'prop-types';
import {
  Container, Row, Col, Card, CardBody, CardTitle, CardText, InputGroup, Input, InputGroupAddon, Button,
} from 'reactstrap';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ComposedChart, Area,
} from 'recharts';
import { connect } from 'react-redux';

import {
  startFetchExperiment,
  requestRollout,
  startGetLog,
  changeSliceLeft,
  changeSliceRight,
  changeXFocus,
  focusNextStep,
  focusPrevStep,
  startSaliency,
} from '../actions';

import SummaryCard from '../components/detail/SummaryCard';
import ArgsCard from '../components/detail/ArgsCard';
import EnvironCard from '../components/detail/EnvironCard';

const path = require('path');

/* eslint-disable react/destructuring-assignment */
/* eslint-disable class-methods-use-this */

/* eslint-disable react/forbid-prop-types */


class DetailContainer extends React.Component {
  constructor(props) {
    super(props);

    this.handleFromStepChange = this.handleFromStepChange.bind(this);
    this.handleToStepChange = this.handleToStepChange.bind(this);

    this.lineChart = React.createRef();

    this.state = {
      fromStep: 0,
      toStep: 0,
    };
  }

  componentDidMount() {
    const { projectId, experimentId } = this.props.match.params;
    this.props.startFetchExperiment(projectId, experimentId);
  }

  handleFromStepChange(e) {
    const { value } = e.target;
    this.setState({
      fromStep: value,
    });
  }

  handleToStepChange(e) {
    const { value } = e.target;
    this.setState({
      toStep: value,
    });
  }

  render() {
    const {
      toStep,
      fromStep,
    } = this.state;

    const {
      experiment,
      rolloutDir,
      log,
      renderImagePath,
      stat,
      sliceLeft,
      sliceRight,
      xFocus,
    } = this.props;

    let chart;
    if (['SeaquestNoFrameskip-v4', 'BreakoutNoFrameskip-v4'].includes(experiment.env_name)) {
      chart = (
        <LineChart
          width={1000}
          height={800}
          data={log}
          margin={{
            top: 5, right: 30, left: 0, bottom: 5,
          }}
          ref={this.lineChart}
          onMouseMove={() => {
            this.props.changeXFocus(this.lineChart.current.state.activeLabel);
          }}
        >
          {
            log.length > 0 && log[0].qvalues && log[0].qvalues.map((qvalue, idx) => (
              <Line
                type="monotone"
                dot={false}
                dataKey={(v) => v.qvalues[idx]}
                key={idx} /* eslint-disable-line react/no-array-index-key */
              />
            ))
          }
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="steps" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <ReferenceLine x={xFocus} stroke="green" />
        </LineChart>
      );
    } else {
      log.forEach((row) => {
        /* eslint-disable-next-line no-param-reassign */
        row.trustRange = [parseFloat(row.action_means[0] - row.action_vars[0]), parseFloat(row.action_means[0]) + row.action_vars[0]];
      });

      chart = (
        <ComposedChart
          width={1000}
          height={800}
          data={log}
          margin={{
            top: 5, right: 30, left: 0, bottom: 5,
          }}
          ref={this.lineChart}
          onMouseMove={() => {
            this.props.changeXFocus(this.lineChart.current.state.activeLabel);
          }}
          stackOffset="silhouette"
        >
          <Line
            yAxisId="left"
            type="monotone"
            dot={false}
            dataKey={(v) => v.actions[0]}
          />
          <Line yAxisId="left" type="monotone" stroke="gray" strokeDasharray="3 4 5 2" dataKey={(v) => v.action_means[0]} />
          <Area yAxisId="left" dataKey="trustRange" stroke="yellow" fill="yellow" />
          <Line yAxisId="right" type="monotone" stroke="red" dataKey="state_value" />
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="steps" />
          <YAxis yAxisId="left" domain={['dataMin', 'dataMax']} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <ReferenceLine yAxisId="left" x={xFocus} stroke="green" />
        </ComposedChart>
      );
    }

    return (
      <div>
        <br />
        <Container fluid>
          <Row>
            <Col>
              <SummaryCard experiment={experiment} />
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <ArgsCard experiment={experiment} />
            </Col>
            <Col>
              <EnvironCard experiment={experiment} />
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <Container>
                    <Row>
                      <Col xs="6">
                        <Card>
                          <CardBody>
                            <CardTitle>Rollout 1 episode</CardTitle>
                            <CardText>
                              <strong>
                                (Rollout path)
                                {' '}
                              </strong>
                              {rolloutDir}
                            </CardText>
                            <Button onClick={() => {
                              this.props.requestRollout(experiment);
                            }}
                            >
Rollout
                            </Button>
                            &nbsp;
                            <Button onClick={() => {
                              this.props.startGetLog(path.join(rolloutDir, 'rollout_log.jsonl'));
                            }}
                            >
Get Log
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xs="6">
                        <Card>
                          <CardBody>
                            <CardTitle>Create saliency map</CardTitle>
                            <InputGroup>
                              <InputGroupAddon addonType="prepend">from step</InputGroupAddon>
                              <Input type="number" step="10" value={fromStep} onChange={this.handleFromStepChange} />
                            </InputGroup>
                            <br />
                            <InputGroup>
                              <InputGroupAddon addonType="prepend">to step</InputGroupAddon>
                              <Input type="number" step="10" value={toStep} onChange={this.handleToStepChange} />
                            </InputGroup>
                            <br />
                            <Button onClick={() => {
                              this.props.startSaliency(experiment.id, fromStep, toStep, 0);
                            }}
                            >
Create
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </Container>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col>
              {chart}
            </Col>
            <Col>
              <Card>
                <CardBody>
                  <CardTitle>env render</CardTitle>
                  <CardText>
                    {`step: ${xFocus},  `}
                    <strong>{`reward: ${stat.reward || 0}`}</strong>
                  </CardText>
                  {
                    renderImagePath && (
                      <img
                        src={`http://localhost:5001/images?image_path=${renderImagePath}`}
                        alt="env render"
                        height={400}
                      />
                    )
                  }
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  <CardTitle>Qvalues</CardTitle>
                  {
                    log.length > 0 && log[xFocus - sliceLeft] && (
                      log[xFocus - sliceLeft].qvalues.map((qvalue, idx) => (
                        { [experiment.action_meanings[idx]]: qvalue }
                      )).sort((a, b) => (
                        Object.values(b)[0] - Object.values(a)[0]
                      )).map((entry) => (
                        <span>
                          <strong>{`${Object.keys(entry)[0]}: `}</strong>
                          {`${Object.values(entry)[0]}`}
                          <br />
                        </span>
                      ))
                    )
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">left</InputGroupAddon>
                    <Input
                      type="number"
                      step="10"
                      value={sliceLeft}
                      onInput={(e) => {
                        this.props.changeSliceLeft(parseInt(e.target.value, 10));
                      }}
                    />
                  </InputGroup>
                  <br />
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">right</InputGroupAddon>
                    <Input
                      type="number"
                      step="10"
                      value={sliceRight}
                      onInput={(e) => {
                        this.props.changeSliceRight(parseInt(e.target.value, 10));
                      }}
                    />
                  </InputGroup>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  <CardTitle>prev step / next step</CardTitle>
                  <Button onClick={() => {
                    this.props.focusPrevStep();
                  }}
                  >
-1
                  </Button>
                  {'  '}
                  <Button onClick={() => {
                    this.props.focusNextStep();
                  }}
                  >
+1
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

DetailContainer.propTypes = {
  match: PropTypes.any.isRequired, /* eslint-disable-line react/forbid-prop-types */
  experiment: PropTypes.object.isRequired,
  rolloutDir: PropTypes.string.isRequired,
  log: PropTypes.arrayOf(
    PropTypes.any
  ).isRequired,
  renderImagePath: PropTypes.string.isRequired,
  stat: PropTypes.any.isRequired,
  sliceLeft: PropTypes.number.isRequired,
  sliceRight: PropTypes.number.isRequired,
  xFocus: PropTypes.number.isRequired,
  startFetchExperiment: PropTypes.func.isRequired,
  requestRollout: PropTypes.func.isRequired,
  startGetLog: PropTypes.func.isRequired,
  changeSliceRight: PropTypes.func.isRequired,
  changeSliceLeft: PropTypes.func.isRequired,
  changeXFocus: PropTypes.func.isRequired,
  focusPrevStep: PropTypes.func.isRequired,
  focusNextStep: PropTypes.func.isRequired,
  startSaliency: PropTypes.func.isRequired,
};


const exstractStat = (log, xFocus) => {
  const isFocused = (elem) => (
    parseInt(elem.steps, 10) === xFocus
  );

  const data = log.filter(isFocused)[0];
  if (data === undefined) {
    return {};
  }

  return data;
};


const mapStateToProps = (state) => ({
  experiment: state.experiment,
  rolloutDir: state.rolloutDir,
  log: state.log.slice(state.sliceLeft, state.sliceRight + 1),
  renderImagePath: state.log.length > 0 ? state.log[state.xFocus].image_path : '',
  stat: exstractStat(state.log, state.xFocus),
  sliceLeft: state.sliceLeft,
  sliceRight: state.sliceRight,
  xFocus: state.xFocus,
});

export default connect(mapStateToProps, {
  startFetchExperiment,
  requestRollout,
  startGetLog,
  changeSliceRight,
  changeSliceLeft,
  changeXFocus,
  focusPrevStep,
  focusNextStep,
  startSaliency,
})(DetailContainer);