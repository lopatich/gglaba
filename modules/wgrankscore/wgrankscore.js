widgetGenerators["rankscore"] = {
  gene: {
    width: 600,
    height: 300,
    variables: {},
    init: function () {
      var v = this["variables"];
      var columnnames_to_show = {};
      for (var i = 0; i < infomgr.colModels.variant.length; i++) {
        var cols = infomgr.colModels.variant[i].colModel;
        for (var j = 0; j < cols.length; j++) {
          var col = cols[j];
          if (
            col.col.includes("rank") ||
            col.col.endsWith("rscore") ||
            col.col.endsWith("_r")
          ) {
            var column = col.col;
          } else {
            continue;
          }
          var module_name = col.colgroupkey;
          column = column.replace(module_name + "__", "");
          columnnames_to_show[module_name] = column;
          v["columnnames"] = columnnames_to_show;
        }
      }
      /*widgetGenerators["rankscore"]["gene"]["width"] =
        (Object.keys(columnnames_to_show).length + 1) * 100;*/
    },
    function: function (div, row, tabName) {
      var v = this["variables"];
      var columnnames_to_show = v["columnnames"];
      var hugo = getWidgetData(tabName, "base", row, "hugo");
      if (columnnames_to_show != undefined) {
        if (Object.keys(columnnames_to_show).length == 0) {
          var span = getEl("span");
          span.classList.add("nodata");
          addEl(div, addEl(span, getTn("No data")));
          return;
        }

        titlelength = [];
        var equallen = 100 / (Object.keys(columnnames_to_show).length + 2);
        var extendlen = equallen + 5;
        var module_names = Object.keys(columnnames_to_show);
        titlelength.push(equallen + "%");
        titlelength.push(equallen + "%");
        for (var i = 0; i < module_names.length; i++) {
          var modname = module_names[i];
          if (modname.length > 12) {
            titlelength.push(extendlen + "%");
          } else {
            titlelength.push(equallen + "%");
          }
        }
        module_names.unshift("Protein variant");
        module_names.unshift("cDNA variant");
        var column_names = Object.values(columnnames_to_show);
        var table = getWidgetTableFrame();
        addEl(div, table);
        var thead = getWidgetTableHead(module_names, titlelength);
        module_names.shift();
        module_names.shift();
        addEl(table, thead);
        var tbody = getEl("tbody");
        addEl(table, tbody);
        tr = getEl("tr");
        var d = infomgr.getData("variant");
        for (var j = 0; j < d.length; j++) {
          var rowd = d[j];
          var nums = {};
          for (var i = 0; i < module_names.length; i++) {
            var modules = module_names[i];
            var c = column_names[i];
            var all = getWidgetData("variant", modules, rowd, c);
            if (all != undefined) {
              all = all.toFixed(3);
            }
            var achange = getWidgetData("variant", "base", rowd, "achange");
            if (achange == null) {
              achange = "";
            }
            var cchange = getWidgetData("variant", "base", rowd, "cchange");
            nums[modules] = all;
          }
          var withre = /[+-]?([0-9]*[.])?[0-9]+/;
          var hugos = [];
          var gene = getWidgetData("variant", "base", rowd, "hugo");
          hugos.push(gene);
          if (hugo == hugos) {
            var numbers = Object.values(nums);
            var withAtMatch = withre.exec(numbers);
            if (withAtMatch == null) {
              continue;
            }
            numbers.unshift(achange);
            numbers.unshift(cchange);
            tr = getWidgetTableTr(numbers);
            for (var k = 0; k < numbers.length; k++) {
              var rankscore = numbers[k];
              getGradientColor = function (start_color, end_color, percent) {
                start_color = start_color.replace(/^\s*#|\s*$/g, "");
                end_color = end_color.replace(/^\s*#|\s*$/g, "");

                // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if (start_color.length == 3) {
                  start_color = start_color.replace(/(.)/g, "$1$1");
                }

                if (end_color.length == 3) {
                  end_color = end_color.replace(/(.)/g, "$1$1");
                }
                // get colors
                var start_red = parseInt(start_color.substr(0, 2), 16),
                  start_green = parseInt(start_color.substr(2, 2), 16),
                  start_blue = parseInt(start_color.substr(4, 2), 16);

                var end_red = parseInt(end_color.substr(0, 2), 16),
                  end_green = parseInt(end_color.substr(2, 2), 16),
                  end_blue = parseInt(end_color.substr(4, 2), 16);
                // calculate new color
                var diff_red = end_red - start_red;
                var diff_green = end_green - start_green;
                var diff_blue = end_blue - start_blue;
                diff_red = (diff_red * percent + start_red)
                  .toString(16)
                  .split(".")[0];
                diff_green = (diff_green * percent + start_green)
                  .toString(16)
                  .split(".")[0];
                diff_blue = (diff_blue * percent + start_blue)
                  .toString(16)
                  .split(".")[0];
                // ensure 2 digits by color
                if (diff_red.length == 1) diff_red = "0" + diff_red;
                if (diff_green.length == 1) diff_green = "0" + diff_green;
                if (diff_blue.length == 1) diff_blue = "0" + diff_blue;

                return "#" + diff_red + diff_green + diff_blue;
              };
              var color = getGradientColor("#FFFFFF", "#FF0000", rankscore);

              $(tr).children().eq(k).css("background-color", color);
              addEl(tbody, tr);
              addEl(div, addEl(table, tbody));
            }
          }
        }
      }
    },
  },
};

