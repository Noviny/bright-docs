import { makePipelineStage } from '@brisk-docs/pipeline-stages';

// @ts-ignore: Importing non-ts file with no definition
import createGatsbyServer from './gatsby-server';

interface StageInput {
  command: string;
  configPath?: string;
  pkgRoot: string;
  rootPath: string;
  gatsbyOptions?: string[];
}

// Boilerplate, uncomment when used
// interface StageConfig {}

export default makePipelineStage(
  'run-gatsby',
  async (input: StageInput): Promise<void> => createGatsbyServer(input),
);
