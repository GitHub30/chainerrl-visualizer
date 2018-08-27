import numpy as np
import os
import random
import string

from scipy.ndimage.filters import gaussian_filter
from scipy.misc import imresize
from scipy.misc import imsave

from chainerrlui.tasks.restore_objects import get_env, get_agent


def get_mask(center, size, radius):
    y, x = np.ogrid[-center[0]:size[0] - center[0], -center[1]:size[1] - center[1]]
    keep = (x * x + y * y) / (x * x + y * y).max() >= 0.01
    msk = np.zeros(size)
    msk[keep] = 1  # select a circle of pixels
    msk = gaussian_filter(msk, sigma=radius)  # blur circle of pixels
    return msk


def occlude(img, msk):
    return img * msk + gaussian_filter(img, sigma=3) * (1 - msk)


def score_frame(agent, input_array, radius=5, density=5, size=(4, 84, 84)):
    channel_num = size[0]
    height = size[1]
    width = size[2]

    scores = np.zeros((int(height / density) + 1, int(width / density) + 1))
    qvalues = agent.model(agent.batch_states([input_array], agent.xp, agent.phi)).q_values.data

    for i in range(0, 80, density):
        for j in range(0, 80, density):
            mask = get_mask([i, j], size=[height, width], radius=radius)
            perturbed_img = occlude(input_array, mask)
            perturbated_qvalues = agent.model(agent.batch_states([perturbed_img], agent.xp, agent.phi)).q_values.data
            scores[int(i / density), int(j / density)] = np.power(qvalues - perturbated_qvalues, 2).sum()
    pmax = scores.max()
    scores = imresize(scores, size=[size[1], size[2]], interp="bilinear").astype(np.float32)
    return pmax * scores / scores.max()

    return scores


def saliency_on_atari_frame(saliency, atari, fudge_factor, size=[210, 160], channel=2, sigma=0):
    pmax = saliency.max()
    S = imresize(saliency, size=[210, 160], interp="bilinear").astype(np.float32)
    S = S if sigma == 0 else gaussian_filter(S, sigma=sigma)
    S -= S.min()
    S = fudge_factor * pmax * S / S.max()
    I = atari.astype("uint16")
    I[:, :, channel] += S.astype("uint16")
    I = I.clip(1, 255).astype("uint8")
    return I


def create_saliency_images(from_step, to_step, experiment_path, rollout_dir, env_name, agent_class, seed):
    env = get_env(env_name, seed)
    agent = get_agent(env, experiment_path, agent_class)

    obs = env.reset()
    image = env.render(mode="rgb_array")
    test_r = 0
    t = 0

    obs_list = []
    image_list = []

    if from_step == 0:
        obs_list.append(obs)
        image_list.append(image)

    while t <= to_step:
        a = agent.act(obs)
        obs, r, done, info = env.step(a)
        image = env.render(mode="rgb_array")
        obs_list.append(obs)
        image_list.append(image)
        test_r += r
        t += 1

    agent.stop_episode()

    image_paths = []

    for step in range(from_step, to_step + 1):
        output = saliency_on_atari_frame(score_frame(agent, np.asarray(obs_list[step])), image_list[step], 50,
                                         channel=0)
        image_path = os.path.join(rollout_dir, 'images',
                                  ''.join([random.choice(string.ascii_letters + string.digits) for _ in
                                           range(11)]) + '.png')

        image_paths.append(image_path)
        imsave(image_path, output)

    return image_paths

