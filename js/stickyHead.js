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
            fireFoxOffset = 0;
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
        document.body.removeChild(theHead);
    }
    rotate90(myTable); // rotate header cell if any ..

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
    window.addEventListener('resize', function () {
        setFlo(flo);
    }, false);
    function makeHead() {

        //******************************************
        //  copy HTML for header rows , with this create sticky
        //  table with header
        //*****************************************
        var temp = [], i, c0;
        theHead = document.createElement('DIV');
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
        headHeight = theHead.firstChild.clientHeight; // save because it is rendered now
        theHead.style.display = 'none';
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
            });
        }
        theHead.style.width = window.getComputedStyle(myTable).width;
    }
    function makeTopLeftCorner() {
        //
        //******************************************
        //  copy HTML for top left corner  , with this create sticky
        //  table with header
        //*****************************************
        var temp = [], i, j, c0, cst, inner, maxHeight = 0;
        if (hasLeftColumns === false) {
            return;
        }
        topLeftCorner = document.createElement('DIV');
        temp.push(tableAttributes); // <table ....>
        for (i = 0; i < headConfig.ncpth.length; i++) {
            temp.push(getOuterHTML(myTable.rows[i])); // <tr ....>
            for (j = 0; j < headConfig.ncpth[i]; j++) {
                temp.push(getOuterHTML(myTable.rows[i].cells[j])); // <th ....>
                temp.push(myTable.rows[i].cells[j].innerHTML);
                temp.push('</th>');
            }
            temp.push('</tr>');
        }
        temp.push('</table>');
        inner = temp.join('');
        topLeftCorner.innerHTML = inner;
        tableParent.appendChild(topLeftCorner);
        topLeftCorner.firstChild.style.marginLeft = 0;
        topLeftCorner.firstChild.style.marginTop = 0;
        topLeftCorner.firstChild.style.height = headHeight + 'px';
        topLeftCorner.firstChild.id = '';

        //  ************************************
        // top left corner of header must have same geometrie 
        // as original. Therefor we adjust cell width and height
        // using the original cell dimensions.
        // *************************************/
        for (i = 0; i < headConfig.ncpth.length; i++) {
            c0 = myTable.rows[i].cells;
            maxHeight = getMaxHeightStyle(c0); // look for highest cell in this row
            for (j = 0; j < headConfig.ncpth[i]; j++) {
                cst = topLeftCorner.firstChild.rows[i].cells[j].style;
                cst.width = window.getComputedStyle(c0[j]).width;
                cst.height = maxHeight + 'px';
            }
        }
        topLeftCorner.style.height = headHeight + 'px';
        topLeftCorner.style.display = 'none';
    }
    function makeLeftColumns() {
        //
        //******************************************
        //  copy HTML for left column , with this create sticky
        //  left data columns
        //*****************************************
        var dataRows, temp = [], i, j, cst, ts, n, cells, ri, hi;
        if (hasLeftColumns === false) {
            return;
        }
        theLeftColumn = document.createElement('DIV');
        temp.push(tableAttributes); //<table .... >
        temp.push('<tbody>');
        dataRows = myTable.rows;
        //***************************************
        // get leading columns from rows below header
        // *************************************/
        for (i = headConfig.ncpth.length; i < dataRows.length; i++) {
            temp.push(getOuterHTML(dataRows[i])); // <tr .... >
            for (j = 0; j < headConfig.nccol; j++) {
                temp.push(dataRows[i].cells[j].outerHTML); // <td ...> ... </td>
            }
            temp.push('</tr>');
        }
        temp.push('</tbody></table>');
        theLeftColumn.innerHTML = temp.join('');
        tableParent.appendChild(theLeftColumn);
        theLeftColumn.firstChild.style.marginLeft = 0;
        theLeftColumn.firstChild.style.marginTop = 0;
        theLeftColumn.firstChild.id = '';
        theLeftColumn.style.display = 'none';
        theLeftColumn.style.padding = '0px';
        theLeftColumn.style.margin = '0px';
        //***************************************
        // left columns must have same geometrie as
        // the original. For the first row we set 
        // cell heights and width using the dimensions
        // from the original first data row.
        // *************************************/
        for (j = 0; j < headConfig.nccol; j++) {
            cst = window.getComputedStyle(dataRows[headConfig.ncpth.length ].cells[j]);
            ts = theLeftColumn.firstChild.rows[0].cells[j].style;
            ts.width = cst.width;
            ts.height = cst.height;
        }
        //***************************************
        // for all other rows we adjust the
        // cell height of the first cell in a row  to the heighest cell in 
        // the original data row.
        // *************************************/
        n = theLeftColumn.firstChild.rows.length;
        for (i = 0; i < n; i++) {
            cells = theLeftColumn.firstChild.rows[i].cells;
            ri = headConfig.ncpth.length + i;
            hi = getMaxHeight(dataRows[ri].cells);
            cells[0].innerHTML === '' ? cells[0].innerHTML = '&nbsp;' : '';
            cells[0].style.height = hi + 'px';
        }
        topLeftCorner.style.width = window.getComputedStyle(theLeftColumn.firstChild).width;
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
            th = parseFloat(c0[i].style.height);// try this first
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
                theHead.verticalSync(x, y);
                if (hasLeftColumns) {
                    theLeftColumn.vsync(x, y);
                }
            });
        }
        if (flo.sx !== x) { // horizontal scrolling
            flo.sx = x;
            window.requestAnimationFrame(function () {
                theHead.horizontalSync(x, y);
                if (hasLeftColumns) {
                    theLeftColumn.hsync(x, y);
                }
            });
        }
    }
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
    theHead.verticalSync = function (x, y) {
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
    theLeftColumn.hsync = function (x, y) {
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
            t.top = (flo.ylc - y) - 1 + headConfig.topDif - fireFoxOffset + 'px';
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
    theLeftColumn.vsync = function (x, y) {
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
                t.top = flo.ylc - 1 - fireFoxOffset + 'px';
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

    theHead.vsyncR = function (x, y) {
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
    theLeftColumn.hsyncR = function (x, y) {
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
            tt.top = flo.y + y + 'px';
        }
        tt.display === 'none' ? tt.display = '' : '';
        t.top = flo.ylc + 'px';//- flo.dy + 'px';
        if (t.position === 'absolute') {
            t.left = x + 'px';
        }
        tt.left = /*flo.x  +*/ x + 'px';
    };
    theLeftColumn.vsyncR = function (x, y) {
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
            if (t.top !== flo.ylc + 'px') {
                t.top = flo.ylc + 'px';
                t.left = 0 + 'px';
            }
            y = y > flo.y ? -flo.y + y : 0;
            tt.top = flo.y + y + 'px';
            return;
        }
    };
    function setFlo(flo) { // flo are our 'floating/sticky' objects
        var nr, nc, p, pp;

        nr = myTable.rows.length;
        nc = myTable.rows[nr - 1].cells.length;
        p = absPos(myTable, tableParent);
        flo.ylc = absPos(myTable, tableParent).y + headHeight;
        pp = absPos(tableParent);
        flo.y = p.y;
        flo.x = p.x;
        flo.dy = pp.y;
        flo.dx = pp.x;
        flo.lcw = myTable.rows[nr - 1].cells[nc - 1].clientWidth;
        flo.yEdge = flo.y + myTable.clientHeight - headHeight - /*last row*/ myTable.rows[nr - 1].clientHeight;
        flo.xEdge = flo.x + myTable.clientWidth - flo.lcw; // - /*lastcell*/ myTable.rows[nr - 1].cells[nc - 1].clientWidth;
        flo.right = flo.x + myTable.clientWidth - 1;
        flo.bottom = flo.y + myTable.clientHeight - 1;
        flo.sx = -1;
        flo.sy = -1;
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
                    headConfig.topDif = absPos(obj).y + obj.clientHeight - 1;
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
                    headConfig.leftDif = absPos(obj).x + obj.clientWidth - 1;
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

        var aRows, table = null, padding = 4;
        //***************************************
        // locate table
        // *************************************/
        if (typeof tableId === 'string') {
            table = document.getElementById(tableId);
        } else if (typeof tableId === 'object') {
            table = tableId;
        }
        if (table === null) {
            return;
        }
        aRows = table.rows;
        [].every.call(aRows, function (row) {
            if (row.cells[0].tagName !== 'TH') {
                return false;
            }
            rotateCell(row);
            return true;
        });
        function rotateCell(row) {
            var maxw = -1;
            [].forEach.call(row.cells, function (cell) {
                var w, dd;
                if (!cell.hasAttribute("data-rotate")) {
                    cell.vAlign = 'bottom';
                    return;
                }
                cell.vAlign = 'middle';
                cell.innerHTML = '<div class=hgs_rotate>' + cell.innerHTML + '</div>';
                w = cell.firstChild.clientWidth;
                if (w > maxw) {
                    maxw = w;
                    cell.style.height = maxw + padding + 'px';
                }
                dd = cell.firstChild;
                dd.style.width = cell.firstChild.clientHeight + 'px';
                dd.style.top = (cell.clientHeight - dd.clientHeight - padding) / 2 + 'px';
                dd.style.left = '0px';
                dd.style.position = 'relative';
            });
        }
    }
    scrollBody();
    return{
        scrollBody: scrollBody
    };
}
