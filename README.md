# Actions-AddNewIssueToColumn

Create a card in any project column for a newly added issue. The project can be configured at the repository level or at the org level. This allows for new types of automations that are not currently supported with boards/issues.

### Demo

This demo shows a new issue called "Demo Issue" that automatically gets added to column in a project after being created.

![](demo.gif)

### Description

Github Action that is meant to automatically add a newly created issue to a specific column in a project. Example YAML workflow that will run whenever a new issue has been opened. The new issue that causes the workflow to run will be added to the specified column:

### Create a PAT with the appropriate permissions

You have to use a custom token that has repo access. You can add that as a secret under the settings and use that instead of `secrets.GITHUB_TOKEN`. The token that is normally passed in does not have permissions to search projects to get the appropriate column id so it will fail with a `Resource not accessible by integration` error. If the project is setup at the org level (linked), it must also have `org:read` permissions to read projects at the org level.

- Create a new personal access token with the appropriate permissions at https://github.com/settings/tokens
- Add the personal access token to your repository secrets: https://github.com/organization_name/repository_name/settings/secrets (for an organization), https://github.com/repository_owner/repository_name/settings/secrets (for a standard repository), and remember the name
- Use the newly saved token in your YAML file as input for `action-token`. In the example above, it is called `Access_token`

### YAML

```name: "New Issue Automation"
on:
  issues:
    types: [opened]
jobs:
  Add_New_Issue_To_Project:
    runs-on: ubuntu-latest
    steps:
    - uses: konradpabjan/actions-add-new-issue-to-column@v1.1
      with:
        action-token: "${{ secrets.Access_token }}"
        project-url: "https://github.com/orgs/github/projects/1"
        column-name: "New issues should show up here"
 ```

The project-url can be a repository project with a format like: `https://github.com/konradpabjan/example/projects/1` or a project linked at the org level with the following format: `https://github.com/orgs/exampleOrg/projects/1`

