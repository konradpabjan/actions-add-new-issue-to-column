const github = require('@actions/github');
const core = require('@actions/core');

async function test() {
    const myToken = core.getInput('repo-token');
    const columnId = core.getInput('column-id');
    const octokit = new github.GitHub(myToken);
    const context = github.context;

    await octokit.projects.createCard({
        column_id: columnId,
        content_id: context.payload.issue.id,
        content_type: "Issue"
    });
    return context.payload.issue.id;
}

test()
    .then(
        (issueId) => { console.log(`Created a card for issueId # ${issueId}`) },
        (err)  => { console.log(err) }
    )
    .then(
        () => { process.exit() }
     )