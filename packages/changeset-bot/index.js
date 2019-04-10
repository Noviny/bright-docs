module.exports = app => {
  app.log('Yay, the app was loaded!');

  // Get an express router to expose new HTTP endpoints
  // Healthcheck
  const router = app.route('/');
  router.get('/healthcheck', (req, res) => {
    res.send('OK')
  });


  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' });
    return context.github.issues.createComment(issueComment);
  });

  app.on('pull_request.opened', async context => {
    const params = context.issue();

    const getFiles = context.github.pullRequests.listFiles(params)
      .then((files) => {
        const changesetFiles = files.data.filter((file) => file.filename.startsWith('.changeset'));
        return changesetFiles.length > 0;
      });

    const getLatestCommit = context.github.pullRequests.listCommits(params)
      .then((commits) => {
        return commits.data.pop();
      });

    Promise.all([getFiles, getLatestCommit])
      .then(([hasChangeset, latestCommit]) => {
        const user = latestCommit.committer.login;
        let prComment;
        if (!hasChangeset) {
          prComment = context.issue(
            {
              body: `❌ NO CHANGESET PRESENT ❌.\nLatest commit: \`${user}\` committed \`${latestCommit.commit.message}\``
            });
        } else {
          prComment = context.issue(
            {
              body: `✅ This PR has a changeset ✅.\nLatest commit: \`${user}\` committed \`${latestCommit.commit.message}\``
            });
        }

        return context.github.issues.createComment(prComment);
      });
  });


  app.on('pull_request.synchronize', async context => {
    const params = context.issue();

    const getBotComment = context.github.issues.listComments(params)
      .then((comments) => {
        const changesetBotComment = comments.data.filter(
          (comment) => comment.user.login === 'changeset-bot[bot]'
        );
        const { id } = changesetBotComment[0];
        return id;
      });

    const getFiles = context.github.pullRequests.listFiles(params)
      .then((files) => {
        const changesetFiles = files.data.filter((file) => file.filename.startsWith('.changeset'));
        return changesetFiles.length > 0;
      });

    const getLatestCommit = context.github.pullRequests.listCommits(params)
      .then((commits) => {
        return commits.data.pop();
      });

    Promise.all([getBotComment, getFiles, getLatestCommit])
      .then(([commentId, hasChangeset, latestCommit]) => {
        const user = latestCommit.committer.login;
        let prComment;
        if (!hasChangeset) {
          prComment = context.issue(
            {
              comment_id: commentId,
              body: `❌ NO CHANGESET PRESENT ❌.\nLatest commit: \`${user}\` committed \`${latestCommit.commit.message}\``
            });
        } else {
          prComment = context.issue(
            {
              comment_id: commentId,
              body: `✅ This PR has a changeset ✅.\nLatest commit: \`${user}\` committed \`${latestCommit.commit.message}\``
            });
        }

        return context.github.issues.updateComment(prComment);
      });
  });
};
