# UI for ChainerRL
You can anaylize learned ChainerRL agent's behavior in well visualized way, making debug easier.

## Installation
To install UI for ChainerRL from source.

```sh
$ git clone https://github.com/pfnet/i18-sykwer.git
$ cd i18-sykwer/frontend
$ npm install && npm run build && cd ..
$ pip install -e .
```

## Usage
Just pass `agent` and `env` object to `chainerrlui.launch_visuzlizer` function.
```python
from chainerrlui import launch_visualizer

# Prepare agent and env object here
#

# Prepare dictionary which explains meanings of each action
ACTION_MEANINGS = {
  0: 'hoge',
  1: 'fuga',
  ...
}

launch_visualizer(agent, env, action_meanings=ACTION_MEANINGS)

```
- `agent` object must be instance of [Agent class provided by ChainerRL](https://github.com/chainer/chainerrl/tree/master/chainerrl/agents), which extends `chainerrl.agent.Agent` class.
- `env` object must implement three gym-like methods below.
  - `reset`: Reset the environment to initial state.
  - `step` : Take `numpy.ndarray` action as argument, and proceed enviroment one step.
  - `render` : Return 3D `numpy.ndarray` which represents RGB image describing env state.

## Env object interface
### reset
Reset the environment state and returns initial array-like observation object.
```
Returns:
  - observation (array-like object): agent's observation of the current environment
```

### step
Run the timestep of environment's dynamics.
```
Args:
  - action (numpy.ndarray): ndarray representing next action to take

Returns:
  - observation (array-like object): agent's observation of the current environment
  - reward (float): amount of reward returned after args action taken
  - done (boolean): whether the episode has ended or not
  - info (dict): contains various information helpful for debugging
```

### render
Returns 3d numpy.ndarray which represents RGB image of current environment appearance.
```
Returns:
  - image (3d numpy.ndarray): RGB image of current environment appearance.
```

## Quick start
Follow instructions of each example.
- [CategoricalDQN at seaquest](examples/categorical_dqn_seaquest)
- [A3C at breakout](examples/a3c_breakout)
- [PPO at bipedalwalker-v2](examples/ppo_bipedalwalker_v2)
