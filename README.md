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

