function stickyHead(tableId, headConfig) {

//***************************************
// make sure the table is allready rendered
// and displayed on screen before 
// calling this function
// *************************************/
    var
            myTable,
            theHead,
            topLeftCorner = {},
            theLeftColumn = {},
            hasLeftColumns = false,
            flo = {},
            tableAttributes,
            headHeight,
            tableParent,
            scrollParent,
            scrollFunction,
            fireFoxOffset = 0,
            tHeight, tWidth;
    //***************************************
    // locate table
    // *************************************/
    if (typeof tableId === 'string') {
        myTable = document.getElementById(tableId);
    } else if (typeof tableId === 'object') {
        myTable = tableId;
    }
    if (myTable === null) {
        return;
    }

//********************************************
//  test if we scroll within a div
//*******************************************
    tableParent = document.getElementById(myTable.id + '_parent');
    if (tableParent !== null) {
        tableParent.style.position = 'relative';
        scrollParent = tableParent;
        scrollFunction = scrollDiv;
    } else {
        tableParent = document.body;
        scrollParent = window;
        scrollFunction = scrollBody;
    }
//******************************************
//  remove any existing sticky header for this table
//*****************************************

    theHead = document.getElementById('float_' + myTable.id);
    if (theHead) {
        document.body.removeChild(theHead.topLeftCorner);
        document.body.removeChild(theHead.theLeftColumn);
        document.body.removeChild(theHead);
    } else {
        rotate90(myTable); // rotate header cell if any ..
    }
    headConfig = getHeadConfig(headConfig);
    //********************************************
    //  below is work around for FireFox bug
    //*******************************************
    fireFoxOffset = 0;
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        fireFoxOffset = 1; // because of  FF bug 1559098
    }

//***************************************
// make required headers
// *************************************/
    makeHead();
    makeTopLeftCorner();
    makeLeftColumns();
//***************************************
// save pointers to myself
// *************************************/
    theHead.topLeftCorner = topLeftCorner;
    theHead.theLeftColumn = theLeftColumn;
    theLeftColumn.topLeftCorner = topLeftCorner;
    theHead.id = 'float_' + myTable.id;
    theHead.myTable = myTable;
//******************************************
//  set geomterie of original table and sticky header
//*****************************************
    flo = setFlo(flo);
    setTableHeadGeometry();
    setLeftColumnGeometry(headConfig);
    setTopLeftCornerGeometry();
//******************************************
//  assign event listener for scrolling
//*****************************************
    theHead.scroll = scrollFunction;
    scrollParent.addEventListener('scroll', theHead.scroll, false);
    window.addEventListener('resize', resizeStart, false);
    function resizeStart()
    {
        window.removeEventListener('resize', resizeStart, false);
        window.addEventListener('mouseover', resizeEnd, false);
    }

    function resizeEnd() {
        window.removeEventListener('mouseover', resizeEnd, false);
        flo = setFlo(flo);
        if (tHeight !== myTable.clientHeight ||
                tWidth !== myTable.clientWidth) {
            stickyHead(myTable, headConfig);
            return;
        }
        flo.sx = -1; // table probably moved in x and/or y
        flo.sy = -1;  // while resized
        scrollBody();
        window.addEventListener('resize', resizeStart, false);
    }
    flo = setFlo(flo);
    tHeight = myTable.clientHeight;
    tWidth = myTable.clientWidth;
    function makeHead()
    {

        //******************************************
        //  copy HTML for header rows , with this create sticky
        //  table with header
        //*****************************************
        var temp = [], i, c0;
        theHead = document.createElement('DIV');
        theHead.dataset.killme = '1';
        theHead.style.backgroundColor = 'white';
        tableAttributes = getOuterHTML(myTable); // <table ....>
        temp.push(tableAttributes);
        for (i = 0; i < headConfig.ncpth.length; i++) {
            if (headConfig.ncpth[i] > 0) {
                hasLeftColumns = true;
            }
            temp.push(myTable.rows[i].outerHTML); // <tr ... > ... </tr>
        }
        temp.push('</table>');
        theHead.innerHTML = temp.join('');
        tableParent.appendChild(theHead);
        theHead.firstChild.style.marginLeft = 0;
        theHead.firstChild.style.marginTop = 0;
        theHead.firstChild.style.width = '100%';
        theHead.firstChild.id = '';
        //***************************************
        // The head would be to small because we 
        // do not have the data rows. Therefore we
        // adjust the width by using the cell width
        // from original header cells
        // *************************************/
        for (i = 0; i < headConfig.ncpth.length; i++) {
            c0 = myTable.rows[i].cells;
            [].forEach.call(c0, (cell, j) => {
                theHead.firstChild.rows[i].cells[j].style.width = window.getComputedStyle(cell).width;
                if (fireFoxOffset === 0) {
// theHead.firstChild.rows[i].cells[j].style.padding = 0;
                }
            });
        }
        headHeight = theHead.firstChild.clientHeight; // save because it is rendered now
        headHeight = parseInt(window.getComputedStyle(theHead.firstChild).height); // save because it is rendered now
        theHead.style.width = window.getComputedStyle(myTable).width;
        theHead.style.display = 'none';
    }

    function makeTopLeftCorner() {
//
//******************************************
//  copy HTML for top left corner  , with this create sticky
//  table with header
//*****************************************
        var temp = [], i, j, c0, cst, maxHeight = 0;
        if (hasLeftColumns === false) {
            return;
        }
        topLeftCorner = document.createElement('DIV');
        topLeftCorner.dataset.killme = '1';
        topLeftCorner.style.backgroundColor = 'white';
        temp.push(tableAttributes); // <table ....>
        temp.push('<thead>');
        for (i = 0; i < headConfig.ncpth.length; i++) {
            temp.push(getOuterHTML(myTable.rows[i])); // <tr ....>
            if (headConfig.ncpth[i] === 0) {
                temp.push(getOuterHTML(myTable.rows[i].cells[0])); // <th ....>
                temp.push('</th>');
            } else {
                for (j = 0; j < headConfig.ncpth[i]; j++) {
                    temp.push(myTable.rows[i].cells[j].outerHTML);
                }
            }
            temp.push('</tr>');
        }
        temp.push('</thead></table>');
        topLeftCorner.innerHTML = temp.join('');
        tableParent.appendChild(topLeftCorner);
        topLeftCorner.firstChild.style.marginLeft = 0;
        topLeftCorner.firstChild.style.marginTop = 0;
        topLeftCorner.firstChild.style.height = headHeight + 'px';
        topLeftCorner.firstChild.style.whiteSpace = 'nowrap';
        topLeftCorner.firstChild.id = 'tlc';
        //  ************************************
        // top left corner of header must have same geometrie 
        // as original. Therefor we adjust cell width and height
        // using the original cell dimensions.
        // *************************************/

        for (i = 0; i < headConfig.ncpth.length; i++) {
            c0 = myTable.rows[i].cells;
            maxHeight = getMaxHeightStyle(c0); // look for highest cell in this row
            if (headConfig.ncpth[i] === 0) {
                topLeftCorner.firstChild.rows[i].cells[0].style.height = window.getComputedStyle(myTable.rows[i].cells[0]).height;
            } else {
                for (j = 0; j < headConfig.ncpth[i]; j++) {
                    cst = topLeftCorner.firstChild.rows[i].cells[j].style;
                    cst.width = window.getComputedStyle(c0[j]).width;
                    cst.height = maxHeight + 'px';
                }
            }
        }
        topLeftCorner.style.height = headHeight + 'px';
        //topLeftCorner.style.width = window.getComputedStyle(topLeftCorner.firstChild).width;

    }

    function makeLeftColumns() {
//
//******************************************
//  copy HTML for left column , with this create sticky
//  left data columns
//*****************************************
        var dataRows, temp = [], i, j, cst, n, cells, ri, hi;
        if (hasLeftColumns === false) {
            return;
        }
        theLeftColumn = document.createElement('DIV');
        theLeftColumn.dataset.killme = '1';
        temp.push(tableAttributes); // <table ....>

        for (i = 0; i < headConfig.ncpth.length; i++) {
            temp.push(getOuterHTML(myTable.rows[i])); // <tr ....>
            if (headConfig.ncpth[i] === 0) {
                temp.push(getOuterHTML(myTable.rows[i].cells[0])); // <th ....>
                temp.push('&nbsp;</th>');
            } else {
                for (j = 0; j < headConfig.ncpth[i]; j++) {
                    temp.push(myTable.rows[i].cells[j].outerHTML);
                }
            }
            temp.push('</tr>');
        }

        dataRows = myTable.rows;
        //***************************************
        // get leading columns from rows below header
        // *************************************/
        for (i = headConfig.ncpth.length; i < dataRows.length; i++) {
            temp.push(getOuterHTML(dataRows[i])); // <tr .... >
            for (j = 0; j < headConfig.nccol; j++) {
                dataRows[i].cells[j].innerHTML === '' ? dataRows[i].cells[j].innerHTML = '&nbsp;' : '';
                temp.push(dataRows[i].cells[j].outerHTML); // <td ...> ... </td>
            }
            temp.push('</tr>');
        }
        temp.push('</table>');
        theLeftColumn.innerHTML = temp.join('');
        tableParent.appendChild(theLeftColumn);
        theLeftColumn.firstChild.style.marginLeft = 0;
        theLeftColumn.firstChild.style.marginTop = 0;
        theLeftColumn.firstChild.style.whiteSpace = 'nowrap';
        theLeftColumn.firstChild.id = '';
        theLeftColumn.firstChild.style.backgroundColor = 'white';
        theLeftColumn.style.display = '';
        theLeftColumn.style.padding = '0px';
        theLeftColumn.style.margin = '0px';
        //  theLeftColumn.style.width = window.getComputedStyle(theLeftColumn.firstChild).width;

        let c0, maxHeight;
        for (i = 0; i < headConfig.ncpth.length; i++) {
            c0 = myTable.rows[i].cells;
            maxHeight = getMaxHeightStyle(c0); // look for highest cell in this row
            if (headConfig.ncpth[i] === 0) {
                theLeftColumn.firstChild.rows[i].cells[0].style.height = window.getComputedStyle(myTable.rows[i].cells[0]).height;
            } else {
                for (j = 0; j < headConfig.ncpth[i]; j++) {
                    cst = theLeftColumn.firstChild.rows[i].cells[j].style;
                    cst.width = window.getComputedStyle(c0[j]).width;
                    cst.height = maxHeight + 'px';
                }
            }
        }
        /************************************************************************************************/
        theLeftColumn.style.display = 'none'; // !!! IMPORTAND so bowser won't render while looping
        /***********************************************************************************************/
        n = theLeftColumn.firstChild.rows.length;
        for (i = 0; i < n; i++) {
            theLeftColumn.firstChild.rows[i].style.height = window.getComputedStyle(dataRows[i]).height;
        }
        return;
    }

    function getOuterHTML(obj) {
        var o = '', i = 0, c = '', sb = '', inString = false;
        o = obj.outerHTML;
        while (true) {
            c = o.charAt(i++);
            if (!inString) {
                if (c === '>') {
                    break;
                }
                if (c === '"' || c === "'") {
                    inString = true;
                    sb = c;
                }
            } else {
                if (c === '\\') {
                    i++;
                } else if (c === sb) {
                    inString = false;
                }
            }
        }
        return obj.outerHTML.substr(0, i);
    }

    function setLeftColumnGeometry(headConfig) {
        if (!hasLeftColumns) {
            return;
        }
        var st = theLeftColumn.style;
        st.zIndex = 12; // above table but below header and corner         
        st.top = flo.ylc + 'px';
        st.left = flo.x + 'px';
        st.height = myTable.clientHeight - myTable.rows[headConfig.ncpth.length].offsetTop + 'px';
        st.display = 'none';
        st.position = 'absolute';
    }

    function setTopLeftCornerGeometry() {
        if (!hasLeftColumns) {
            return;
        }
        var st = topLeftCorner.style;
        st.zIndex = 15; // above table and left column
        st.height = headHeight + 'px';
        st.left = flo.x + 'px';
        st.top = absPos(myTable.rows[0], tableParent).y + 'px';
        st.display = 'none';
        st.position = 'absolute';
        theHead.rightEdge = topLeftCorner.rightEdge;
    }

    function setTableHeadGeometry() {
        var st = theHead.style;
        st.zIndex = 15; // above table and left column
        st.left = flo.x + 'px';
        st.top = flo.y + 'px';
        st.width = myTable.clientWidth + 'px';
        st.display = 'none';
        st.position = 'absolute';
    }


    function getMaxHeight(c0) {
        var max = -1, th = -1, i, n;
        n = c0.length;
        max = parseFloat(window.getComputedStyle(c0[0].parentNode).height);
        return max;
        for (i = 0; i < n; i++) {
            th = parseFloat(window.getComputedStyle(c0[i]).height);
            if (th > max) {
                max = th;
            }
        }
        return max;
    }

    function getMaxHeightStyle(c0) {
        var max = -1, th = -1, i, n;
        n = c0.length;
        for (i = 0; i < n; i++) {
            th = parseFloat(c0[i].style.height); // try this first
            if (isNaN(th)) {
                th = parseFloat(window.getComputedStyle(c0[i]).height);
            }
            if (th > max) {
                max = th;
            }
        }
        return max;
    }

//******************************************
//  callback if page is scrolled
//*****************************************

    function scrollBody() { // scrolling in document
        var y, x;
        y = window.pageYOffset + headConfig.topDif;
        x = window.pageXOffset + headConfig.leftDif;
        if (flo.sy !== y) {// vertical scrolling
            flo.sy = y;
            window.requestAnimationFrame(function () {
                setFlo(flo);
                theHead.verticalSync(x, y);
                if (hasLeftColumns) {
                    theLeftColumn.vsync(x, y);
                }
            });
        }
        if (flo.sx !== x) { // horizontal scrolling
            flo.sx = x;
            window.requestAnimationFrame(function () {
                setFlo(flo);
                theHead.horizontalSync(x, y);
                if (hasLeftColumns) {
                    theLeftColumn.hsync(x, y);
                }
            });
        }

    }



//******************************************
//  if real table header scrolls out or back  into view
//   move sticky head in or out
//*****************************************
    theHead.horizontalSync = function (x, y) {
        var t = this.style;
        if (t.position === 'fixed') {
            t.position = 'absolute';
            t.left = flo.x + 'px';
            t.top = y + 'px';
        }
    };
    theHead.verticalSync = function (x, y)
    {
        var t = this.style;
        if ((y < flo.y || y > flo.bottom)) {
            t.display !== 'none' ? t.display = 'none' : '';
            return;
        }
        t.display === 'none' ? t.display = '' : '';
        if (t.position !== 'fixed') {
            t.position = 'fixed';
            t.left = flo.x - x + headConfig.leftDif + 'px';
            t.top = headConfig.topDif + 'px';
        }
    };
    theLeftColumn.hsync = function (x, y)
    {
        var t = this.style, tt = this.topLeftCorner.style;
        if (t === null) {
            return;
        }

        if ((x - 1 < flo.x || x > flo.xEdge)) {
            t.display !== 'none' ? t.display = 'none' : '';
            t.position = 'absolute';
            tt.display = t.display;
            tt.position = t.position;
            return;
        }
        t.display === 'none' && y < flo.bottom ? t.display = '' : '';
        if (t.position === 'absolute') {
            t.position = 'fixed';
            t.left = headConfig.leftDif + 'px';
            t.top = flo.y - y + headConfig.topDif + 'px';
        }
        tt.display === 'none' && y < flo.bottom ? tt.display = '' : '';
        if (tt.position === 'absolute') { // the corner
            tt.position = 'fixed';
            tt.left = headConfig.leftDif + 'px';
            if (y <= flo.y) {
                tt.top = (flo.y - y) + headConfig.topDif + 'px';
            } else {
                tt.top = headConfig.topDif + 'px';
            }
        }
    };
    theLeftColumn.vsync = function (x, y)
    {
        var t = this.style, tt = this.topLeftCorner.style;
        if (t === null) {
            return;
        }

        if (y > flo.bottom || x > flo.xEdge) {
            t.display !== 'none' ? t.display = 'none' : '';
            tt.display === t.display ? '' : tt.display = t.display;
            return;
        }
        if (flo.x < x - 1 && t.display === 'none') {
            t.display = '';
            tt.display = t.display;
        }
        if (t.display !== 'none') {
            if (t.position === 'fixed') {
                t.position = 'absolute';
                t.top = flo.y + 'px'; // flo.ylc - flo.lfc - 1 - fireFoxOffset + 'px';
                t.left = parseInt(t.left, 10) + x - headConfig.leftDif + 'px';
                return;
            }
        }
        if (tt.display !== 'none') { // the corner
            if (tt.position === 'absolute') {
                if (y > flo.y) {
                    tt.position = 'fixed';
                    tt.top = headConfig.topDif + 'px';
                    tt.left = headConfig.leftDif + 'px';
                }
            } else {
                if (y < flo.y) {
                    tt.position = 'absolute';
                    tt.top = flo.y + 'px';
                    tt.left = x + 'px';
                }
            }
        }
    };
// //////////////
// functions called when scrolling within a DIV
// //////////////
//********************************************
//  scroll in a div
//*******************************************

    function scrollDiv(e) { /// scrolling in DIV
        var y, x;
        if (typeof e !== 'undefined') {
            y = e.target.scrollTop;
            x = e.target.scrollLeft;
        } else {
            flo.sy++;
            flo.sx++;
        }
        if (flo.sy !== y) {// vertical scrolling
            flo.sy = y;
            window.requestAnimationFrame(function () {
                theHead.vsyncR(x, y);
                theLeftColumn.vsyncR(x, y);
            });
        }
        if (flo.sx !== x) { // horizontal scrolling
            flo.sx = x;
            theLeftColumn.hsyncR(x, y);
        }
    }
    theHead.vsyncR = function (x, y)
    {
        var t = this.style;
        if ((y - 1 < flo.y || y > flo.bottom)) {
            t.display !== 'none' ? t.display = 'none' : '';
            return;
        }
        t.display === 'none' ? t.display = '' : '';
        if (t.display !== 'none') {
            t.position !== 'absolute' ? t.position = 'absolute' : '';
            t.left = flo.x + 'px';
            t.top = y + 'px';
        }
    };
    theLeftColumn.hsyncR = function (x, y)
    {
        var t = this.style, tt = this.topLeftCorner.style;
        if (t === null) {
            return;
        }
        if ((x < flo.x || x > flo.xEdge)) {
            t.display !== 'none' ? t.display = 'none' : '';
            tt.display === t.display ? '' : tt.display = t.display;
            t.position = 'absolute';
            return;
        }
        t.display === 'none' ? t.display = '' : '';
        if (tt.display === 'none') {
            // tt.top = y+'px';//absPos(myTable, tableParent).y + 'px';// flo.y - flo.flc + y + 'px';
            tt.top = y <= flo.y ? y = flo.y + 'px' : y + 'px';
        }
        tt.display === 'none' ? tt.display = '' : '';
        t.top = absPos(myTable, tableParent).y + 'px'; //flo.ylc - flo.lfc + 'px'; //- flo.dy + 'px';
        if (t.position === 'absolute') {
            t.left = x + 'px';
        }
        tt.left = /*flo.x  +*/ x + 'px';
    };
    theLeftColumn.vsyncR = function (x, y)
    {
        var t = this.style, tt = this.topLeftCorner.style;
        if (t === null) {
            return;
        }
        if (y > flo.bottom) {
            t.display !== 'none' ? t.display = 'none' : '';
            tt.display = t.display;
            return;
        }
        if (flo.x < x && t.display === 'none') {
            t.display = '';
        }
        if (t.display !== 'none') {
            t.position !== 'absolute' ? t.position = 'absolute' : '';
            let yy = absPos(myTable, tableParent).y + 'px';
            if (t.top !== yy /*flo.ylc + 'px'*/) {
                t.top = yy; //flo.ylc + 'px';
                t.left = 0 + 'px';
            }
            //y = y > flo.y ? -flo.y + y : 0;
            tt.top = y <= flo.y ? y = flo.y + 'px' : y + 'px';//yy + 'px';
            ;//flo.y + y + 'px';
            return;
        }
    };
    function setFlo(flo)
    { // flo are our 'floating/sticky' objects
        var nr, nc, p;
        nr = myTable.rows.length;
        nc = myTable.rows[nr - 1].cells.length;
        p = absPos(myTable, tableParent);
        flo.ylc = absPos(myTable.rows[headConfig.ncpth.length], tableParent).y;
        flo.y = p.y;
        flo.x = p.x;
        flo.dy = p.y;
        flo.dx = p.x;
        flo.lcw = myTable.rows[nr - 1].cells[nc - 1].clientWidth;
        flo.yEdge = flo.y + myTable.clientHeight - headHeight - /*last row*/ myTable.rows[nr - 1].clientHeight;
        flo.xEdge = flo.x + myTable.clientWidth - flo.lcw; // - /*lastcell*/ myTable.rows[nr - 1].cells[nc - 1].clientWidth;
        flo.right = flo.x + myTable.clientWidth - 1;
        flo.bottom = flo.y + myTable.clientHeight - 1;
        if (theLeftColumn.style.display === 'none') {
            flo.lfc = absPos(myTable.rows[headConfig.ncpth.length]).y - absPos(myTable.rows[0]).y + 1;
        }
        return flo;
    }

    function getHeadConfig(headConfig) {
        var obj;
        //******************************************
        //  get configuration for header
        //*****************************************
        if (typeof headConfig === 'undefined') {
            return false;
        }
        //***************************************
        // topdif,leftdif can be a number, string or object
        // *************************************/
        if (typeof headConfig.topDif !== 'undefined') {
            if (isNaN(headConfig.topDif)) { // not a number ?
                if (typeof headConfig.topDif === 'string') {
                    obj = document.getElementById(headConfig.topDif);
                    headConfig.topDif = obj.clientHeight - 1;
                } else if (typeof headConfig.topDif === 'object') {
                    headConfig.topDif = absPos(headConfig.topDif).y + headConfig.topDif.clientHeight - 1;
                } else {
                    headConfig.topDif = 0;
                }
            }
        } else {
            headConfig.topDif = 0;
        }
        if (typeof headConfig.leftDif !== 'undefined') {
            if (isNaN(headConfig.leftDif)) { // not a number ?
                if (typeof headConfig.leftDif === 'string') {
                    obj = document.getElementById(headConfig.leftDif);
                    headConfig.leftDif = obj.clientWidth - 1;
                } else if (typeof headConfig.topDif === 'object') {
                    headConfig.leftDif = absPos(headConfig.leftDif).x + headConfig.leftDif.clientWidth - 1;
                } else {
                    headConfig.leftDif = 0;
                }
            }
        } else {
            headConfig.leftDif = 0;
        }
        return headConfig;
    }

    function absPos(obj, parent) {// return absolute x,y position of obj
        var ob, x, y;
        if (typeof parent === 'undefined') {
            ob = obj.getBoundingClientRect();
            return {'x': ob.left + window.scrollX, 'y': ob.top + window.scrollY};
        }
        x = obj.offsetLeft, y = obj.offsetTop;
        ob = obj.offsetParent;
        while (ob !== null && ob !== parent) {
            x += ob.offsetLeft;
            y += ob.offsetTop;
            ob = ob.offsetParent;
        }
        return {'x': x, 'y': y};
    }


    function rotate90(tableId) {
        'use strict';
        var table, p;
        //********************************************
        //  locate table
        //*******************************************
        if (typeof tableId === 'string') {
            table = document.getElementById(tableId);
        } else if (typeof tableId === 'object') {
            table = tableId;
        }
        if (table === null) {
            return;
        }
//********************************************
//  locate cells to rotate
//*******************************************
        p = table.querySelectorAll('[data-rotate]');
        p.forEach((th) => {
            let div, w, h;
            //********************************************
            //  wrap content with a DIV, append to cell
            //*******************************************
            div = document.createElement('DIV');
            div.innerHTML = th.innerHTML;
            div.style.display = 'inline-block';
            th.innerHTML = '';
            th.appendChild(div);
            //********************************************
            //  get current height and width
            //*******************************************
            h = div.clientHeight;
            w = div.clientWidth;
            //********************************************
            //  rotate then swap height and width then 
            //  repostion content in cell
            //*******************************************
            div.style.transformOrigin = 'top left';
            div.style.transform = 'rotate(-90deg)';
            div.style.whiteSpace = 'nowrap';
            div.style.width = h + 'px';
            div.style.height = w + 'px';
            div.style.position = 'relative';
            div.style.top = div.clientHeight + 'px';
            //********************************************
            //  don't know why but it works :-)
            //*******************************************
            div.querySelector('IMG') ? '' : div.style.display = 'flex'; // shaky ?
        });
    }


    function newRow(ri) {
        let row, nc, i;
        if (hasLeftColumns) {
            row = theLeftColumn.firstChild.insertRow(ri);
            for (i = 0; i < headConfig.nccol; i++) {
                row.insertCell(i);
                row.cells[i].innerHTML = myTable.rows[ri].cells[i].innerHTML;
            }
        }

        nc = myTable.rows[ri].cells.length;
        for (i = 0; i < nc; i++) {
            sync(ri, i);
        }
    }

    function deleteRow(ri) {
        let nc, i;
        if (hasLeftColumns) {
            theLeftColumn.firstChild.deleteRow(ri - headConfig.ncpth.length);
        }
        ri = myTable.rows.length - 1;
        nc = myTable.rows[ri].cells.length;
        for (i = 0; i < nc; i++) {
            sync(ri, i);
        }
    }


    function sync(ri, ci) {
        var cii, l, th, co;
        l = theHead.firstChild.rows.length - 1;
        cii = findCi(ci, theHead.firstChild.rows[l].cells);
        if (cii === -1) {
            return;
        }
        let ww = window.getComputedStyle(myTable).width;
        theHead.style.width = ww;
        co = myTable.rows[ri].cells[ci];
        th = parseFloat(co.style.width); // try this first
        if (isNaN(th)) {
            th = parseFloat(window.getComputedStyle(co).width);
        }
        theHead.firstChild.rows[l].cells[cii].style.width = th + 'px';
        if (hasLeftColumns) {
            let cell = myTable.rows[ri].cells[ci];
            if (ci < headConfig.nccol) { // part of theLeftColumn, topLeftCorner ?
                theLeftColumn.firstChild.rows[ri].cells[ci].innerHTML = cell.innerHTML;
                topLeftCorner.firstChild.rows[headConfig.ncpth.length - 1].cells[ci].style.width = window.getComputedStyle(cell).width;
                //theLeftColumn.style.width = window.getComputedStyle(cell).width;
                theLeftColumn.firstChild.style.width = 'min-content';
                theLeftColumn.firstChild.style.width = window.getComputedStyle(theLeftColumn.firstChild).width;
            }
            theLeftColumn.firstChild.style.height = window.getComputedStyle(myTable).height;
            let h = window.getComputedStyle(cell.parentNode).height;
            theLeftColumn.firstChild.rows[ri].style.height = h;
        }
    }

    function findCi(ci, cells) {
        var prev = 0, i, n;
        n = cells.length;
        for (i = 0; i < n; i++) {
            if (prev + cells[i].colSpan - 1 >= ci) {
                return i;
            }
            prev += cells[i].colSpan;
        }
        return -1;
    }

    theHead.style.display = 'none';
    topLeftCorner.style.display = 'none';
    theLeftColumn.style.display = 'none';
    setFlo(flo); // set
    flo.sx = -1; // init
    flo.sy = -1; // init
    scrollBody();
    sync(headConfig.ncpth.length, 0);
//?????????????????????????????????????????????
//  seems that this is  needed for firefox  ???

    if (hasLeftColumns && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // ugly !!
        window.dispatchEvent(new Event('resize'));
    }
//?????????????????????????????????????????????
    return{

        sync: sync,
        scrollBody: scrollBody,
        newRow: newRow,
        deleteRow: deleteRow
    };
}