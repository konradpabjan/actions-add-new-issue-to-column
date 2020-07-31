const github = require("@actions/github");
const core = require("@actions/core");
const graphql = require("@octokit/graphql");

async function run() {
    const myToken = core.getInput("action-token");
    const projectUrl = core.getInput("project-url");
    const columnName = core.getInput("column-name");
    const octokit = new github.GitHub(myToken);
    const context = github.context;
    const contentType = context.payload.issue !== undefined ? "Issue" : "PullRequest";
    const contentId = contentType === "Issue" ? context.payload.issue.id : context.payload.pull_request.id;
    const contentNumber = contentType === "Issue" ? context.payload.issue.number : context.payload.pull_request.number;

    console.log(`Action triggered by #${contentType} ${contentNumber}, ID: ${contentId}`);

    var info = await getColumnAndIssueInformation(columnName, projectUrl, myToken, contentId, contentType);
    console.log(info)
    if (info.cardId != null){
        return `No action being taken. A card already exists in the project for the issue. Column:${info.currentColumnName}, cardId:${info.cardId}.`;
    } else if(info.columnId != null) {
        return await createNewCard(octokit, info.columnId, contentId, contentType);
    } else {
        throw `Unable to find a columnId for the column ${columnName}, with Url:${projectUrl}`;
    }
}

async function createNewCard(octokit, columnId, issueId, contentType){
    console.log(`Attempting to create a card in column ${columnId}, for an issue with the corresponding id #${issueId}`);
    await octokit.projects.createCard({
        column_id: columnId,
        content_id: issueId,
        content_type: contentType
    });
    return `Successfully created a new card in column #${columnId} for an issue with the corresponding id:${issueId} !`;
}

async function getColumnAndIssueInformation(columnName, projectUrl, token, contentDatabaseId, contentType){
    var columnId = null;
    var cardId = null;
    var currentColumnName = null;
    var splitUrl = projectUrl.split("/");
    var projectNumber = parseInt(splitUrl[6], 10);

    // check if repo or org project
    if(splitUrl[3] == "orgs"){
        // Org url will be in the format: https://github.com/orgs/github/projects/910
        var orgLogin = splitUrl[4];
        console.log(`This project is configured at the org level. Org Login:${orgLogin}, project #${projectNumber}`);
        var orgInformation = await getOrgInformation(orgLogin, projectNumber, token, contentType);
        orgInformation.organization.project.columns.nodes.forEach(function(columnNode){
            if(columnNode.name == columnName){
                columnId = columnNode.databaseId;
            }
            // check each column if there is a card that exists for the issue
            columnNode.cards.edges.forEach(function(card){
                // card level
                if (card.node.content != null){
                    // only issues and pull requests have content
                    if(card.node.content.databaseId == contentDatabaseId){
                        cardId = card.node.databaseId;
                        currentColumnName = columnNode.name;
                    }
                }
            });
        });
    } else {
        // Repo url will be in the format: https://github.com/bbq-beets/konradpabjan-test/projects/1
        var repoOwner = splitUrl[3];
        var repoName = splitUrl[4];
        console.log(`This project is configured at the repo level. Repo Owner:${repoOwner}, repo name:${repoName} project #${projectNumber}`);
        var repoColumnInfo = await getRepoInformation(repoOwner, repoName, projectNumber, token, contentType);
        repoColumnInfo.repository.project.columns.nodes.forEach(function(columnNode){
            if(columnNode.name == columnName){
                columnId = columnNode.databaseId;
            }
            // check each column if there is a card that exists for the issue
            columnNode.cards.edges.forEach(function(card){
                // card level
                if (card.node.content != null){
                    // only issues and pull requests have content
                    if(card.node.content.databaseId == contentDatabaseId){
                        cardId = card.node.databaseId;
                        currentColumnName = columnNode.name;
                    }
                }
            });
        });
    }

    return { columnId: columnId,
        cardId: cardId,
        currentColumnName: currentColumnName};
}

async function getOrgInformation(organizationLogin, projectNumber, token, contentType){
    // GraphQL query to get all of the cards in each column for a project
    // https://developer.github.com/v4/explorer/ is good to play around with
    const response = await graphql(
        `query ($loginVariable: String!, $projectVariable: Int!){
            organization(login:$loginVariable) {
                name
                project(number:$projectVariable) {
                    databaseId
                    name
                    url
                    columns(first:100){
                        nodes{
                            databaseId
                            name
                            cards {
                                edges {
                                    node {
                                    databaseId
                                        content {
                                            ... on ${contentType} {
                                                    databaseId
                                                    number
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }`, {
            loginVariable: organizationLogin,
            projectVariable: projectNumber,
            headers: {
                authorization: `bearer ${token}`
            }
        });
    return response;
}

async function getRepoInformation(repositoryOwner, repositoryName, projectNumber, token, contentType){
    // GraphQL query to get all of the columns in a project that is setup at that org level
    // https://developer.github.com/v4/explorer/ is good to play around with
    const response = await graphql(
        `query ($ownerVariable: String!, $nameVariable: String!, $projectVariable: Int!){
            repository(owner:$ownerVariable, name:$nameVariable) {
                project(number:$projectVariable){
                    id
                    number
                    databaseId
                    name
                    url
                    columns(first:100){
                        nodes{
                            databaseId
                            name
                            cards {
                                edges {
                                    node {
                                        databaseId
                                        content {
                                            ... on ${contentType} {
                                                databaseId
                                                number
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }        
            }`, {
            ownerVariable: repositoryOwner,
            nameVariable: repositoryName,
            projectVariable: projectNumber,
            headers: {
                authorization: `bearer ${token}`
            }
        });
    return response;
}

run()
    .then(
        (response) => { console.log(`Finished running: ${response}`); },
        (error) => { 
            console.log(`#ERROR# ${error}`);
            process.exit(1); 
        }
    );
