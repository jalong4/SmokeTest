# SmokeTest

This code is a Google app script with supporting html files used with a tradefed based Host test.

The Smoke Host Test Module (TvtsSmokeTestCases) takes JSON input files exported from:
<ul>
  <li>the Smoke Test spreadsheet using the app scripts and html code in this repro</li>
</ul>


It adds the following menu to the google sheet (TVTS menu on the far right):

![ScreenShot](https://raw.github.com/jalong4/SmokeTest/main/images/tvts-menu.png)

Once all the test results have been logged, select the TVTS menu and then select Export.  This will result in the following dialog:

![ScreenShot](https://raw.github.com/jalong4/SmokeTest/main/images/export-dialog.png)

There is also a Help option in the TVTS menu, below is a screen show of the Help Dialog:

![ScreenShot](https://raw.github.com/jalong4/SmokeTest/main/images/help-dialog.png)
