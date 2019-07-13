sticky
=======

fixed/sticky header and left columns for tables

Look at html/index.html  for usage.

A demo is located here <a href='http://hgsweb.de/sticky/html'>hgsweb.de/sticky</a>

A small JavaScript file implementing sticky table headers and 
sticky left columns to give you the freeze pane functionality 
as you find it in EXCEL-Spreadsheets.

This is achieved by using copies of the table header, all the left columns and
the top left corner, as a header for the left columns.

These elements are then placed on top or to the left of the table, using a style.position
value of 'fixed' or 'absolute' , depending on the element and scroll direction.

For details regarding usage and implementation please see 
files index.html and float.js 

As of  13.07.2019 for :
            
                 Chrome    Opera  FireFox (partialy,  because of bug 1559098) Edge (not yet)
                 

Logic
=====

There are three main block of logic.

<b>The first block</b> is the construction of three containers to build
the header (theHeader) , the top left corner (theLeftCorner) being the left part of theHeader 
and the header for the fixed left columns (theLeftColumns).

<b>The second block</b> keeps track of horizontal and vertical scrolling of the table.
If the original table header, or the left columns (if specified) are about to be moved
out of sight some or all of the above containers will be displayed instead.

When scrolling verticaly the position value for theHeader and theLeftCorner will change to fixed 
so they will stay in view. The position value of theLeftColumns will be set to absolute so it will scroll verticaly. 

When scrolling horizontaly the position value for theLeftColumns and theLeftCorner will change to fixed so 
they will stay in view. The position value of theHeader will be set to absolute so it will scroll horizontaly. 

To visualise this somehow look at an other <a href='http://hgsweb.de/floater/html/demo.html'> demo page</a> trying to show these positional changes

