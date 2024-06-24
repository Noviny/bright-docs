import mockFs from 'mock-fs';
import getMarkdownMeta from './get-markdown-meta';

describe('getMarkdownMeta', () => {
  afterEach(() => {
    mockFs.restore();
  });

  it('should parse and return yaml frontmatter from the supplied markdown filepath', () => {
    mockFs({
      '/tmp/my/markdownFile': `---
title: 'My title'
status: 'Stable'
keywords: 'genius'
---
# Markdown contents
`,
    });

    expect(getMarkdownMeta('/tmp/my/markdownFile')).toEqual({
      title: 'My title',
      status: 'Stable',
      keywords: 'genius',
    });
  });

  it('should return an empty object if no frontmatter exists', () => {
    mockFs({
      '/tmp/my/markdownFile': `# Markdown contents`,
    });

    expect(getMarkdownMeta('/tmp/my/markdownFile')).toEqual({});
  });

  it('should throw if markdown file cannot be resolved', () => {
    expect(() => {
      getMarkdownMeta('/tmp/does/not/exist');
    }).toThrow("ENOENT: no such file or directory, open '/tmp/does/not/exist'");
  });

  it('should throw if markdown frontmatter cannot be parsed correctly', () => {
    expect(() => {
      mockFs({
        '/tmp/my/markdownFile': `---
title 'My title'
status: 'Stable'
keywords: 'genius'
---
# Markdown contents
  `,
      });

      getMarkdownMeta('/tmp/my/markdownFile');
    }).toThrow('Error parsing frontmatter');
  });
});
