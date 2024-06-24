import { performance } from 'perf_hooks';

export type PipelineStage<StageInput, StageOutput> = (
  input: StageInput,
) => Promise<StageOutput>;

/**
 * Creates a stage for the website build pipeline with performance profiling
 * built in.
 */
export default <StageInput, StageOutput>(
  id: string,
  buildStep: (input: StageInput) => Promise<StageOutput>,
): PipelineStage<StageInput, StageOutput> => {
  return async (input: StageInput): Promise<StageOutput> => {
    const perfBeginId = `brisk-pipeline-stage-begin:${id}`;
    const perfEndId = `brisk-pipeline-stage-end:${id}`;

    performance.mark(perfBeginId);

    const result = await buildStep(input);

    performance.mark(perfEndId);
    performance.measure(
      `brisk-pipeline-stage-duration:${id}`,
      perfBeginId,
      perfEndId,
    );

    return result;
  };
};
