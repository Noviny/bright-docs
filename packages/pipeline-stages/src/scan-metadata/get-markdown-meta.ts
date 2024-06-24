import yaml from 'js-yaml';
// @ts-ignore missing types
import frontmatter from 'remark-frontmatter';
// @ts-ignore missing types
import parseMarkdown from 'remark-parse';
import unified from 'unified';
import fs from 'fs';

/**
 * Retrieves metadata frontmatter from a markdown file
 * @param markdownPath path to markdown file
 * @return object
 */
const getMarkdownMeta = (markdownPath: string): object => {
  const tree = unified()
    .use(parseMarkdown)
    .use(frontmatter, ['yaml'])
    .parse(fs.readFileSync(markdownPath, 'utf8'));

  // @ts-ignore
  const frontMatterNode = tree.children[0];
  if (!frontMatterNode || frontMatterNode.type !== 'yaml') {
    return {};
  }

  let meta;

  try {
    meta = yaml.safeLoad(frontMatterNode.value);
  } catch (e) {
    if (e.name === 'YAMLException') {
      throw new Error(`Error parsing frontmatter.\n${e}`);
    }
    throw e;
  }

  return meta;
};

export default getMarkdownMeta;
