/**
 * Created by IntelliJ IDEA.
 * User: Administrator
 * Date: 12-6-8
 * Time: 下午12:18
 * To change this template use File | Settings | File Templates.
 */
Life = {

};

Life.apply = function (o, c, defaults) {
    // no "this" reference for friendly out of scope calls
    if (defaults) {
        Life.apply(o, defaults);
    }
    if (o && c && typeof c == 'object') {
        for (var p in c) {
            o[p] = c[p];
        }
    }
    return o;
};

Life.utils = {
    arrayIndexOfItem:function (arr, item) {
        for (var i in arr) {
            if (arr[i] == item) {
                return parseInt(i);
            }
        }
        return -1;
    }
};

Life.load = function (name, config, data) {
    window.onload = function () {
        var table = Life.apply(name, config, data);
        if (data) {
            table.add(data);
        }
        table.render();
    };
};

Life.Grid = {
    id:'',
    dataKey:'',
    columns:[
        {
            header:'',
            width:'',
            dataIndex:''
        }
    ],
    dataUrl:'',
    title:'',
    multiple:false,

    rows:[],
    displayRows:[],
    pageConfig:{
        hasPre:false,
        prePage:0,
        pageSize:2,
        pageNo:1,
        totalPages:1,
        hasNext:false,
        nextPage:1
    },
    rendered:false,
    gridDiv:null,
    gridTable:null,
    pager:null,
    trClassName:'',

    renderFramework:function () {
        var str = '';
        str += '<div class="LifeGrid">\n';
        str += '<div class="dataGridMeta">\n';
        str += '<span class="title">' + this.title + '</span>';
        str += '</div>\n';
        str += '<div id="lifeDataGridDiv" class="dataGridDiv">\n';
        str += '</div>\n';
        str += '<div id="lifeDataGridPager" class="pager">\n';
        str += '</div>\n';
        str += '</div>';

        var div = document.getElementById(this.id);
        div.view = this;
        this.container = div;
        this.container.innerHTML = str;
    },

    jumpPage:function (pageNo) {
        this.rows = [];
        this.displayRows = [];
        this.pageConfig.pageNo = pageNo;
        this.initData();
    },

    renderPager:function () {
        var pagerHtml = "<table>\n";
        pagerHtml += "<tr>\n";
        pagerHtml += "<td>\n";
        pagerHtml += "<input type='hidden' value='1'>\n";
        pagerHtml += "<div style=\"cursor:pointer;\">首页</div>\n";
        pagerHtml += "</td>\n";
        if (this.pageConfig.hasPre) {
            pagerHtml += "<td>\n";
            pagerHtml += "<input type='hidden' value=\"" + this.pageConfig.prePage + "\">\n";
            pagerHtml += "<div style=\"cursor:pointer;\">上一页</div>\n";
            pagerHtml += "</td>\n";
        }
        pagerHtml += "<td>\n";
        pagerHtml += "&nbsp;" + this.pageConfig.pageNo + "/" + this.pageConfig.totalPages + "&nbsp;\n";
        pagerHtml += "</td>\n";
        if (this.pageConfig.hasNext) {
            pagerHtml += "<td>\n";
            pagerHtml += "<input type='hidden' value=\"" + this.pageConfig.nextPage + "\">\n";
            pagerHtml += "<div style=\"cursor:pointer;\">下一页</div>\n";
            pagerHtml += "</td>\n";
        }
        pagerHtml += "<td>\n";
        pagerHtml += "<input type='hidden' value=\"" + this.pageConfig.totalPages + "\">\n";
        pagerHtml += "<div style=\"cursor:pointer;\">末页</div>\n";
        pagerHtml += "</td>\n";
        pagerHtml += "</tr>\n";
        pagerHtml += "</table>\n";

        this.initPager();
        this.pager.innerHTML = pagerHtml;
    },

    getHttpRequest:function () {
        if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    },

    fetchData:function () {
        if (this.dataUrl.indexOf("?") > 0) {
            if (this.dataUrl.indexOf("pageNo") > 0) {
                this.dataUrl = this.dataUrl.substring(0, this.dataUrl.indexOf("pageNo"));
            }
            this.dataUrl += "&pageNo=" + this.pageConfig.pageNo + "&pageSize=" + this.pageConfig.pageSize;
        } else {
            this.dataUrl += "?pageNo=" + this.pageConfig.pageNo + "&pageSize=" + this.pageConfig.pageSize;
        }

        var xmlHttpRequest = this.getHttpRequest();

        xmlHttpRequest.open("POST", this.dataUrl, false);
        xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xmlHttpRequest.send(null);
        return eval('(' + xmlHttpRequest.responseText + ')');
    },

    initData:function () {
        var result = this.fetchData();
        this.addPage(result.page);
        this.addData(result.data);
    },

    add:function (row) {

        // TODO 客户端 分页
        var page = {
            hasPre:false,
            prePage:1,
            pageSize:this.pageConfig.pageSize,
            pageNo:1,
            totalPages:row.length / this.pageConfig.pageSize,
            hasNext:row.length > (row.length / this.pageConfig.pageSize),
            nextPage:2
        };
        this.addPage(page);

        this.addData(row);
    },

    addPage:function (page) {
        this.pageConfig = page;
    },

    addData:function (row) {
        if (row instanceof Array) {
            for (var i in row) {
                this.addData(row[i]);
            }
        } else {
            var index = Life.utils.arrayIndexOfItem(this.rows, row);
            if (index != -1) {
                return;
            }
            this.rows.push(row);
            this.displayRows.push(row);
            if (this.rendered) {
                this.render();
            }
        }
    },

    render:function () {
        this.renderFramework();

        if (this.dataUrl && (!this.rendered)) {
            this.initData();
        }

        this.renderPager();

        var buf = [];
        buf.push('<table class="dataGrid"><tbody>\n');
        buf.push('<tr>\n');
        buf.push('<th class="marker" width="10">');
        if (this.multiple) {
            buf.push('<input type="checkbox" value="" />');
        }
        buf.push('</th>\n');
        for (var column in this.columns) {
            buf.push('<th style="width: ' + this.columns[column].width + '" field="' + this.columns[column].dataIndex + '">' + this.columns[column].header + '</th>\n');
        }
        buf.push("</tr>\n");

        var rows = this.displayRows;

        for (var i in rows) {
            var row = rows[i];
            var rid = row[this.dataKey];
            buf.push('<tr class="tv_row">\n<td class="marker" width="10">');
            if (this.multiple) {
                buf.push('<input type="checkbox" value="');
            } else {
                buf.push('<input type="radio" value="');
            }
            buf.push(rid);
            buf.push('" /></td>\n');
            for (var column in this.columns) {
                buf.push('<td>');
                buf.push(row[this.columns[column].dataIndex]);
                buf.push('</td>\n');
            }
            buf.push('</tr>\n');
        }
        buf.push("</tbody></table>\n");

        this.initGridDiv();
        for (var i in buf) {
            this.initContent(buf.join(''));
        }
        this.initGridTable();

        this.afterRender();

        this.rendered = true;
    },

    selectAll:function () {
        var trs = this.gridTable.rows;
        for (var i = 0; i < trs.length; i++) {
            trs[i].cells[0].childNodes[0].checked = true;
        }
    },

    unSelectAll:function () {
        var trs = this.gridTable.rows;
        for (var i = 0; i < trs.length; i++) {
            if (!this.multiple && i === 0) {
                continue;
            }
            trs[i].cells[0].childNodes[0].checked = false;
        }
    },

    trHeadClick:function () {
        var trs = this.gridTable.rows;
        var trHead = trs[0];
        var grid = this;
        if (this.multiple) {
            var checkBox = trHead.cells[0].childNodes[0];
            checkBox.onclick = function () {
                if (checkBox.checked) {
                    grid.selectAll();
                } else {
                    grid.unSelectAll();
                }
            }
        }
    },

    trClick:function () {
        var trs = this.gridTable.rows;
        var grid = this;

        for (var i = 1; i < trs.length; i++) {

            trs[i].cells[0].childNodes[0].onclick = function () {
                this.checked = !this.checked;
            };

            trs[i].onclick = function () {
                var checkElement = this.cells[0].childNodes[0];

                if (grid.multiple) {
                    checkElement.checked = !checkElement.checked;
                    var headCheckElement = trs[0].cells[0].childNodes[0];
                    headCheckElement.checked = true;
                    for (var j = 1; j < trs.length; j++) {
                        if (!trs[j].cells[0].childNodes[0].checked) {
                            headCheckElement.checked = false;
                            break;
                        }
                    }
                } else {
                    grid.unSelectAll();
                    checkElement.checked = !checkElement.checked;
                }
            };
        }
    },

    pagerClick:function () {
        var pagerLinks = this.pager.children[0].rows[0].cells;
        var grid = this;
        for (var i = 0; i < pagerLinks.length; i++) {
            if (pagerLinks[i].children.length < 2) {
                continue;
            }
            pagerLinks[i].onclick = function () {
                var pageNoDom = this.children[0];
                grid.jumpPage(pageNoDom.value);
            };
        }
    },

    afterRender:function () {
        this.trHeadClick();
        this.trClick();
        this.pagerClick();
        var grid = this;
        var trs = this.gridTable.rows;

        for (var i = 1; i < trs.length; i++) {
            var tr = trs[i];
            grid.trClassName = i % 2 == 0 ? 'odd' : 'even';
            tr.className = grid.trClassName;

            tr.onmouseover = function () {
                grid.trClassName = this.className
                this.className = "hover";
            };
            tr.onmouseout = function () {
                this.className = grid.trClassName;
            };
        }
    },

    initContent:function (contentHtml) {
        this.gridDiv.innerHTML = contentHtml;

    },
    initGridDiv:function () {
        this.gridDiv = document.getElementById("lifeDataGridDiv");
    },
    initGridTable:function () {
        this.gridTable = this.gridDiv.children[0];
    },
    initPager:function () {
        this.pager = document.getElementById("lifeDataGridPager");
    },

    getSelectedKeys:function () {
        var keys = [];
        var trs = this.gridTable.rows;
        for (var i = 1; i < trs.length; i++) {
            var checkElement = trs[i].cells[0].childNodes[0];
            if (checkElement.checked) {
                keys.push(checkElement.value);
            }
        }
        return keys;
    }

};