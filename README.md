# Actions-AddNewIssueToColumn

Github Action that is meant to automatically add a newly created issue to a specific column in a project. Example YAML workflow that will run whenever a new issue has been opened. The new issue that causes the workflow to run will be added to the specified column:

```name: "New Issue Automation"
on:
  issues:
    types: [opened]
jobs:
  Add_New_Issue_To_Project:
    runs-on: ubuntu-latest
    steps:
    - uses: konradpabjan/actions-add-new-issue-to-column@master
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        column-id: "6443961"
 ```
        
The column-id parameter can be found by using the github API: https://developer.github.com/v3/projects/columns/

You can also get the column-id by navigating to a project in your browser and clicking "inspect-element". The column-id matches a property called "data-id"

If you are attempting to automatically move a new issue to a project that is in an org with a linked repository, you have to use a custom token that has repo access. You can add that as a secret under the settings and use that instead of `secrets.GITHUB_TOKEN`. The token that is normally passed in is only scoped to the repository and it doesn't have access to any projects that it may be linked to so it will fail with a `Resource not accessible by integration` error.
