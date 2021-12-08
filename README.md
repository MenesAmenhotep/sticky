sticky
=======

fixed/sticky header and left columns for tables

Look at html/index.html  for usage.

A demo is located here <a href='https://www.hgsweb.de/sticky/index.html'>www.hgsweb.de/sticky</a>

A small JavaScript file implementing sticky table headers and 
sticky left columns to give you the freeze pane functionality 
as you find it in EXCEL-Spreadsheets.

This is achieved by using copies of the table header, all the left columns and
the top left corner, as a header for the left columns.

These elements are then placed on top or to the left of the table, using a style.position
value of 'fixed' or 'absolute' , depending on the element and scroll direction.

For details regarding usage and implementation please see 
files index.html and stickyHead.js 

**27.11.2021**

Still some minor glitches when using sticky left column, sometimes offsets by 1 pixel in Chrome  
can't figure out what causes this.
Works also for table in div with overflow:scroll

**18.11.2021**

added code to support resize and reload events.

**14.05.2020**

Chrome, Opera, FireFox (with workaround for bug 1559098), Edge

API
===
For a table, create sticky header, top left corner and sticky left columns

```
sth=stickyHead(id, config)
```

- **id**    
- if string, the id for the table  
- if object, the table itself  

- **config**  
    is a an object with four attributes.
    ```
    {ncpth: [1, 2], nccol: 2, topDif: 'topDif', leftDif: 'leftDif'}
    ```
- **ncpth**  
    ncpth.length is the number of header rows from top of table  
    ncpth[i] is the number of columns from left to take from row i of topLeftCorner  
- **nnccol**  
number of colmns from left for theLeftColumn  
- **topfdif**  
    if number, then pixels from top of document to set header sticky  

    if string, the id of an object where the client heigt is the number of  pixels from top of document to set header sticky  

    if object, the absolute y position of object, plus the objects client height is the number of  pixels from top of document to set header sticky  
- **leftdif**  
    if number, then pixels from left of document to set left columns  sticky  

    if string, the id of an object where the client width is the number of  pixels from left of document to set left columns sticky  

    if object, the absolute x position of object, plus the objects client width is the number of pixels from left of 
    document to set left column sticky  

```
sth = stickyHead('t1', {ncpth: [1, 2], nccol: 2, topDif: 'topDif', leftDif: 'leftDif'});`
```
The return value for `stickyHead` is an object revealing functions inside `stickyHead`.  
You need to call these functions only when content has changed within the table.
```
{
    sync: sync,
    scrollBody: scrollBody,
    newRow: newRow,
    deleteRow: deleteRow
};
```

- `sync`
```
    sync(rowIndex,cellIndex)
```
   Call this function if content of cell at rowIndex,cellIndex has changed, to keep geometry  
   of sticky parts in sync with table

- `newRow`
```
    newRow(rowIndex)
```
   Call this function if at rowIndex, a new row row has been inserted


- `deleteRow`
```
    deleteRow(rowIndex)
```
   Call this function if the row at rowIndex, has been deleted




Logic
=====

There are two main blocks of logic.

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

