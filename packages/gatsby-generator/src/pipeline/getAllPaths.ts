import path from 'path';
import pkgDir from 'pkg-dir';
import getConfiguration from './stages/get-configuration/handle-config';

const getPathData = async (configPath?: string) => {
  const cwd = process.cwd();
  const config = getConfiguration(cwd, configPath);

  const pkgRoot = await pkgDir(__dirname);
  if (!pkgRoot) throw new Error('could not resolve pkg root');
  const wrappersPath = path.resolve(
    pkgRoot,
    `./un-src/components/page-templates`,
  );
  const pagesPath = path.resolve(pkgRoot, `./pages`);
  const defaultPagesPath = path.join(pkgRoot, 'default-pages');

  return {
    rootPath: cwd,
    wrappersPath,
    pagesPath,
    pkgRoot,
    config,
    defaultPagesPath,
  };
};
export default getPathData;
