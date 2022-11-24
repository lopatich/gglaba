widgetGenerators["casecontrols"] = {
  gene: {
    width: 600,
    height: 300,
    function: function (div, row, tabName) {
      var initDatasets = [];
      var dom_initDatasets = [];
      var rec_initDatasets = [];
      var all_initDatasets = [];
      var pv = [];
      var dom_pv = [];
      var rec_pv = [];
      var all_pv = [];
      var dict = {};
      var labels = [];
      var dom_labels = [];
      var rec_labels = [];
      var all_labels = [];
      var dom_dict = {};
      var rec_dict = {};
      var all_dict = {};
      var hetcase = [];
      var dom_hetcase = [];
      var rec_hetcase = [];
      var all_hetcase = [];
      var hetcase_data = [];
      var dom_hetcase_data = [];
      var rec_hetcase_data = [];
      var all_hetcase_data = [];
      var homcase = [];
      var dom_homcase = [];
      var rec_homcase = [];
      var all_homcase = [];
      var homcase_data = [];
      var dom_homcase_data = [];
      var rec_homcase_data = [];
      var all_homcase_data = [];
      var hetcont = [];
      var dom_hetcont = [];
      var rec_hetcont = [];
      var all_hetcont = [];
      var hetcont_data = [];
      var dom_hetcont_data = [];
      var rec_hetcont_data = [];
      var all_hetcont_data = [];
      var homcont = [];
      var dom_homcont = [];
      var rec_homcont = [];
      var all_homcont = [];
      var homcont_data = [];
      var dom_homcont_data = [];
      var rec_homcont_data = [];
      var all_homcont_data = [];
      var ll = [];
      var dom_ll = [];
      var rec_ll = [];
      var all_ll = [];
      var hugo = getWidgetData(tabName, "base", row, "hugo");
      var dd = infomgr.getData("variant");
      for (var j = 0; j < dd.length; j++) {
        var rowd = dd[j];
        var chrom = getWidgetData("variant", "base", rowd, "chrom");
        var pos = getWidgetData("variant", "base", rowd, "pos");
        var ref = getWidgetData("variant", "base", rowd, "ref_base");
        var alt = getWidgetData("variant", "base", rowd, "alt_base");
        var loc = chrom + ":g." + pos + ":" + ref + ">" + alt;
        var gene = getWidgetData("variant", "base", rowd, "hugo");
        var het_case = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "het_case"
        );
        var het_cont = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "het_cont"
        );
        var hom_case = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "hom_case"
        );
        var hom_cont = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "hom_cont"
        );
        var dom_pvalue = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "dom_pvalue"
        );
        var rec_pvalue = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "rec_pvalue"
        );
        var all_pvalue = getWidgetData(
          "variant",
          "casecontrol",
          rowd,
          "all_pvalue"
        );
        var achange = getWidgetData("variant", "base", rowd, "achange");
        if (gene == hugo) {
          if (dom_pvalue > 0.05 && rec_pvalue > 0.05 && all_pvalue > 0.05) {
            continue;
          }
          if (dom_pvalue < rec_pvalue) {
            dict[loc] = dom_pvalue;
          } else if (rec_pvalue < dom_pvalue) {
            dict[loc] = rec_pvalue;
          } else if (rec_pvalue < all_pvalue) {
            dict[loc] = rec_pvalue;
          } else if (all_pvalue < dom_pvalue) {
            dict[loc] = all_pvalue;
          } else if (all_pvalue < rec_pvalue) {
            dict[loc] = all_pvalue;
          } else if (dom_pvalue < all_pvalue) {
            dict[loc] = dom_pvalue;
          }
          hetcase[loc] = het_case;
          homcase[loc] = hom_case;
          hetcont[loc] = het_cont;
          homcont[loc] = hom_cont;

          if (dom_pvalue <= 0.05) {
            dom_dict[loc] = dom_pvalue;
            dom_hetcase[loc] = het_case;
            dom_homcase[loc] = hom_case;
            dom_hetcont[loc] = het_cont;
            dom_homcont[loc] = hom_cont;
          }
          if (rec_pvalue <= 0.05) {
            rec_dict[loc] = rec_pvalue;
            rec_hetcase[loc] = het_case;
            rec_homcase[loc] = hom_case;
            rec_hetcont[loc] = het_cont;
            rec_homcont[loc] = hom_cont;
          }
          if (all_pvalue <= 0.05) {
            all_dict[loc] = all_pvalue;
            all_hetcase[loc] = het_case;
            all_homcase[loc] = hom_case;
            all_hetcont[loc] = het_cont;
            all_homcont[loc] = hom_cont;
          }
        }
      }
      var items = Object.keys(dict).map(function (key) {
        return [key, dict[key]];
      });
      items.sort(function (first, second) {
        return first[1] - second[1];
      });
      items = items.slice(0, 10);
      for (var i = 0; i < items.length; i++) {
        labels.push(items[i][0]);
        pv.push(items[i][1]);
      }
      if (labels.length == 0) {
        var span = getEl("span");
        span.classList.add("nodata");
        addEl(div, addEl(span, getTn("No data")));
        return;
      }

      for (var i = 0; i < labels.length; i++) {
        var label_ = labels[i];
        if (labels[i].length > 21) {
          label_ = labels[i].slice(0, 17);
          label_ = label_ + "...";
        }
        var v = pv[i].toFixed(3);
        var val = v.toString();
        ll.push(val + ";" + label_);
      }
      for (var i = 0; i < labels.length; i++) {
        var l = labels[i];
        hetcase_data.push(hetcase[l]);
        homcase_data.push(homcase[l]);
        hetcont_data.push(hetcont[l]);
        homcont_data.push(homcont[l]);
      }

      initDatasets.push({
        label: "Het Case",
        backgroundColor: "#1E90FF",
        data: hetcase_data,
        yAxisID: "yAxis1",
      });
      initDatasets.push({
        label: "Hom Case",
        backgroundColor: "#87CEFA",
        data: homcase_data,
        yAxisID: "yAxis1",
      });
      initDatasets.push({
        label: "Het Control",
        backgroundColor: "#FF4500",
        data: hetcont_data,
        yAxisID: "yAxis1",
      });
      initDatasets.push({
        label: "Hom Control",
        backgroundColor: "#FF8C00",
        data: homcont_data,
        yAxisID: "yAxis1",
      });

      var items = Object.keys(dom_dict).map(function (key) {
        return [key, dom_dict[key]];
      });
      items.sort(function (first, second) {
        return first[1] - second[1];
      });
      items = items.slice(0, 10);
      for (var i = 0; i < items.length; i++) {
        dom_labels.push(items[i][0]);
        dom_pv.push(items[i][1]);
      }
      for (var i = 0; i < dom_labels.length; i++) {
        var dom_label_ = dom_labels[i];
        if (dom_labels[i].length > 21) {
          dom_label_ = dom_labels[i].slice(0, 17);
          dom_label_ = dom_label_ + "...";
        }
        var dom_v = dom_pv[i].toFixed(3);
        var dom_val = dom_v.toString();
        dom_ll.push(dom_val + ";" + dom_label_);
      }
      for (var i = 0; i < dom_labels.length; i++) {
        var l = dom_labels[i];
        dom_hetcase_data.push(dom_hetcase[l]);
        dom_homcase_data.push(dom_homcase[l]);
        dom_hetcont_data.push(dom_hetcont[l]);
        dom_homcont_data.push(dom_homcont[l]);
      }
      dom_initDatasets.push({
        label: "Het Case",
        backgroundColor: "#1E90FF",
        data: dom_hetcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      dom_initDatasets.push({
        label: "Hom Case",
        backgroundColor: "#87CEFA",
        data: dom_homcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      dom_initDatasets.push({
        label: "Het Control",
        backgroundColor: "#FF4500",
        data: dom_hetcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      dom_initDatasets.push({
        label: "Hom Control",
        backgroundColor: "#FF8C00",
        data: dom_homcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });

      var items = Object.keys(rec_dict).map(function (key) {
        return [key, rec_dict[key]];
      });
      items.sort(function (first, second) {
        return first[1] - second[1];
      });
      items = items.slice(0, 10);
      for (var i = 0; i < items.length; i++) {
        rec_labels.push(items[i][0]);
        rec_pv.push(items[i][1]);
      }
      for (var i = 0; i < rec_labels.length; i++) {
        var rec_label_ = rec_labels[i];
        if (rec_labels[i].length > 21) {
          rec_label_ = rec_labels[i].slice(0, 17);
          rec_label_ = rec_label_ + "...";
        }
        var rec_v = rec_pv[i].toFixed(3);
        var rec_val = rec_v.toString();
        rec_ll.push(rec_val + ";" + rec_label_);
      }
      for (var i = 0; i < rec_labels.length; i++) {
        var l = rec_labels[i];
        rec_hetcase_data.push(rec_hetcase[l]);
        rec_homcase_data.push(rec_homcase[l]);
        rec_hetcont_data.push(rec_hetcont[l]);
        rec_homcont_data.push(rec_homcont[l]);
      }
      rec_initDatasets.push({
        label: "Het Case",
        backgroundColor: "#1E90FF",
        data: rec_hetcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      rec_initDatasets.push({
        label: "Hom Case",
        backgroundColor: "#87CEFA",
        data: rec_homcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      rec_initDatasets.push({
        label: "Het Control",
        backgroundColor: "#FF4500",
        data: rec_hetcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      rec_initDatasets.push({
        label: "Hom Control",
        backgroundColor: "#FF8C00",
        data: rec_homcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });

      var items = Object.keys(all_dict).map(function (key) {
        return [key, all_dict[key]];
      });
      items.sort(function (first, second) {
        return first[1] - second[1];
      });
      items = items.slice(0, 10);
      for (var i = 0; i < items.length; i++) {
        all_labels.push(items[i][0]);
        all_pv.push(items[i][1]);
      }
      for (var i = 0; i < all_labels.length; i++) {
        var all_label_ = all_labels[i];
        if (all_labels[i].length > 21) {
          all_label_ = all_labels[i].slice(0, 17);
          all_label_ = all_label_ + "...";
        }
        var all_v = all_pv[i].toFixed(3);
        var all_val = all_v.toString();
        all_ll.push(all_val + ";" + all_label_);
      }
      for (var i = 0; i < all_labels.length; i++) {
        var l = all_labels[i];
        all_hetcase_data.push(all_hetcase[l]);
        all_homcase_data.push(all_homcase[l]);
        all_hetcont_data.push(all_hetcont[l]);
        all_homcont_data.push(all_homcont[l]);
      }
      all_initDatasets.push({
        label: "Het Case",
        backgroundColor: "#1E90FF",
        data: all_hetcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      all_initDatasets.push({
        label: "Hom Case",
        backgroundColor: "#87CEFA",
        data: all_homcase_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      all_initDatasets.push({
        label: "Het Control",
        backgroundColor: "#FF4500",
        data: all_hetcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });
      all_initDatasets.push({
        label: "Hom Control",
        backgroundColor: "#FF8C00",
        data: all_homcont_data,
        yAxisID: "yAxis1",
        type: "horizontalBar",
      });

      div.style.width = "calc(100% - 37px)";
      var chartDiv = getEl("canvas");
      chartDiv.style.width = "calc(100% - 20px)";
      chartDiv.style.height = "calc(100% - 20px)";
      addEl(div, chartDiv);
      var button = document.createElement("button");
      button.innerHTML = "Overall Minimum p-value";
      button.id = "overall";
      button.classList.add("butn");
      document
        .getElementById("widgetcontentdiv_casecontrols_gene")
        .appendChild(button);
      var button2 = document.createElement("button");
      button2.id = "dom";
      button2.innerHTML = "Dominant p-value";
      button2.classList.add("butn");
      document
        .getElementById("widgetcontentdiv_casecontrols_gene")
        .appendChild(button2);
      var button3 = document.createElement("button");
      button3.id = "rec";
      button3.innerHTML = "Recessive p-value";
      button3.classList.add("butn");
      document
        .getElementById("widgetcontentdiv_casecontrols_gene")
        .appendChild(button3);
      var button4 = document.createElement("button");
      button4.id = "all";
      button4.innerHTML = "Allelic p-value";
      button4.classList.add("butn");
      document
        .getElementById("widgetcontentdiv_casecontrols_gene")
        .appendChild(button4);
      var config = {
        type: "horizontalBar",
        data: {
          labels: ll,
          datasets: initDatasets,
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: hugo,
          },
          tooltips: {
            callbacks: {
              title: function (tooltipItem, data) {
                return "p-value=" + tooltipItem[0].yLabel;
              },
            },
          },
          legend: {
            labels: {
              display: true,
            },
          },
          scales: {
            yAxes: [
              {
                stacked: true,
                id: "yAxis1",
                type: "category",
                display: false,
                ticks: {
                  callback: function (label) {
                    var month = label.split(";")[0];
                    var year = label.split(";")[1];
                    return month;
                  },
                },
              },
              {
                id: "yAxis2",
                type: "category",
                offset: true,
                gridLines: {
                  drawOnChartArea: false,
                },
                ticks: {
                  min: 0,
                  callback: function (label) {
                    var month = label.split(";")[0];
                    var year = label.split(";")[1];
                    return year;
                  },
                },
              },
            ],
            xAxes: [
              {
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: "Count",
                },
              },
            ],
          },
        },
      };
      var chart = new Chart(chartDiv, config);
      $("#overall").click(function () {
        var data = chart.config.data;
        data.datasets = initDatasets;
        data.labels = ll;
        data.datasets[0].yAxisID = "yAxis1";
        chart.update();
      });
      $("#dom").click(function () {
        var data = chart.config.data;
        data.datasets = dom_initDatasets;
        data.labels = dom_ll;
        data.datasets[0].yAxisID = "yAxis1";
        chart.update();
      });
      $("#rec").click(function () {
        var data = chart.config.data;
        data.datasets = rec_initDatasets;
        data.labels = rec_ll;
        data.datasets[0].yAxisID = "yAxis1";
        chart.update();
      });
      $("#all").click(function () {
        var data = chart.config.data;
        data.datasets = all_initDatasets;
        data.labels = all_ll;
        data.datasets[0].yAxisID = "yAxis1";
        chart.update();
      });
    },
  },
};
