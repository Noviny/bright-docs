import { PerformanceObserver } from 'perf_hooks';
import createStage from './make-pipeline-stage';

describe('Pipeline stage generator', () => {
  it('creates a run property from the given function', async () => {
    const step = jest.fn();
    step.mockReturnValue(Promise.resolve('result'));

    const runStage = createStage('test-stage', step);
    const stageInput = {};
    const result = await runStage(stageInput);

    expect(step).toHaveBeenCalledWith(stageInput);
    expect(result).toBe('result');
  });

  it('sends a performance measure event to the performance timing API', () => {
    const getPerformanceMetric = new Promise((resolve, reject) => {
      const obs = new PerformanceObserver(items => {
        const entry = items
          .getEntries()
          .find(e => e.name === 'brisk-pipeline-stage-duration:test-stage');
        if (!entry) {
          reject(
            new Error('brisk-pipeline-stage-duration:test-stage entry missing'),
          );
        } else {
          resolve(entry.duration);
        }

        obs.disconnect();
      });
      obs.observe({ entryTypes: ['measure'] });
    });

    const runStage = createStage('test-stage', () => Promise.resolve());
    runStage({});

    return expect(getPerformanceMetric).resolves.toEqual(expect.any(Number));
  });
});
