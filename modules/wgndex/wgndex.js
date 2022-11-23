$.getScript("/result/widgetfile/wgndex/cytoscape.js", function () {});

widgetGenerators["ndex"] = {
  variant: {
    donterase: true,
    width: 600,
    height: 600,
    variables: {
      hugo: null,
      nodata: false,
    },
    showhide: function () {
      var v = this["variables"];
      if (v.nodata == false) {
        return true;
      } else if (v.nodata == true) {
        return false;
      }
    },
    beforeresize: function () {
      $(this["variables"]["div"]).empty();
    },
    onresize: function (parentDiv, row, tabName) {
      this["function"](parentDiv, row, tabName);
    },
    function: function (parentDiv, row, tabName) {
      var v = this["variables"];
      if (parentDiv != undefined) {
        v["div"] = parentDiv;
      } else if (v["div"] != undefined) {
        parentDiv = v["div"];
      }
      var self = this;
      self.selectedNetworkName = "";
      var hugo = getWidgetData(tabName, "base", row, "hugo");
      if (hugo == "" || hugo == null) {
        $(parentDiv).empty();
        v.nodata = true;
        return;
      }
      var v = widgetGenerators["ndex"][tabName]["variables"];
      if (hugo == v.hugo && v["resized"] != true) {
        return;
      }
      $(parentDiv).empty();
      v.hugo = hugo;
      var geneRow = infomgr.geneRows[hugo];
      var networkids = getWidgetData("gene", "ndex", geneRow, "networkid");
      var networknames = getWidgetData("gene", "ndex", geneRow, "networkname");
      if (networkids == null) {
        v.nodata = true;
        return;
      }
      v.nodata = false;
      // configureEnrichmentScoresForTable port
      self.data = {};
      self.data["head"] = { cols: ["Pathway", "p-value", "Genes"] };
      self.data["body"] = [];
      networkids = networkids.split(",");
      networknames = networknames.split(",");
      for (var i = 0; i < networkids.length; i++) {
        var networkid = networkids[i];
        var networkname = networknames[i];
        self.data["body"].push({
          attrs: [networkid],
          cols: [networkname, hugo],
        });
      }

      //Enrichment Div
      this.enrichmentDiv = getEl("div");
      this.enrichmentDiv.id = "ndex_list_variant";
      this.enrichmentDiv.style.fontSize = "12px";
      this.enrichmentDiv.style.fontWeight = "normal";
      this.enrichmentDiv.style.fontFamily = "Roboto";
      this.enrichmentDiv.style.position = "absolute";
      this.enrichmentDiv.style.zIndex = 1;
      this.enrichmentDiv.style.width = "96%";
      this.enrichmentDiv.style.height = "";
      addEl(parentDiv, this.enrichmentDiv);
      //Network Div
      this.networkDiv = getEl("div");
      this.networkDiv.id = "ndex_canvas_variant";
      this.networkDiv.style.width = "100%";
      this.networkDiv.style.height = "100%";
      this.networkDiv.style.top = "10%";
      this.networkDiv.style.left = "10%";
      this.networkDiv.style.backgroundColor = "rgb(250,250,250)";
      this.networkDiv.addEventListener("click", function (evt) {
        var options = document.getElementById("ndex_options_variant");
        options.style.display = "none";
        options.previousSibling.textContent = "> " + self.selectedNetworkName;
      });
      addEl(parentDiv, this.networkDiv);
      // Legends div
      this.legendDiv = getEl("div");
      this.legendDiv.id = "ndex_legend_variant";
      this.legendDiv.style.position = "absolute";
      this.legendDiv.style.left = " 20px";
      this.legendDiv.style.top = "70px";
      addEl(parentDiv, this.legendDiv);
      // Enrichment score
      var enrichmentScores = {};
      for (var i = 0; i < self.data["body"].length; i++) {
        var networkUUID = self.data["body"][i]["attrs"][0];
        var hugo = self.data["body"][i]["cols"][1];
        enrichmentScores[networkUUID] = {
          k: 1,
          pv: 0,
          set_id: networkUUID,
          set_name: self.data["body"][i]["cols"][0],
        };
        enrichmentScores[networkUUID]["overlap"] = {};
        enrichmentScores[networkUUID]["overlap"][hugo] = 1;
      }
      // Network name area
      var div = getEl("div");
      div.id = "ndex_select_variant";
      div.className = "ndex_select_variant";
      div.style.fontFamily = "Roboto";
      div.style.fontSize = "12px";
      div.style.fontWeight = "normal";
      div.style.cursor = "pointer";
      div.style.padding = "2px";
      div.style.border = "2px outset #dddddd";
      div.onclick = function (evt) {
        var selectDiv = evt.target;
        var optionsDiv = document.getElementById("ndex_options_variant");
        if (optionsDiv.style.display == "none") {
          optionsDiv.style.display = "block";
          selectDiv.textContent = "v " + self.selectedNetworkName;
          selectDiv.style.border = "2px inset #dddddd";
        } else {
          optionsDiv.style.display = "none";
          selectDiv.textContent = "> " + self.selectedNetworkName;
          selectDiv.style.border = "2px outset #dddddd";
        }
      };
      div.textContent = "> " + self.selectedNetworkName;
      addEl(this.enrichmentDiv, div);
      // Network options
      var optionsDiv = getEl("div");
      optionsDiv.id = "ndex_options_variant";
      optionsDiv.style.fontFamily = "Roboto";
      optionsDiv.style.fontSize = "12px";
      optionsDiv.style.fontWeight = "normal";
      optionsDiv.style.maxHeight = "400px";
      optionsDiv.style.overflow = "auto";
      optionsDiv.style.display = "none";
      optionsDiv.style.zIndex = "5";
      optionsDiv.style.backgroundColor = "white";
      optionsDiv.style.border = "1px solid gray";
      optionsDiv.style.padding = "6px";
      optionsDiv.tabIndex = "-1";
      for (var i = 0; i < self.data["body"].length; i++) {
        var rowData = self.data["body"][i];
        var option = null;
        var networkId = rowData.attrs[0].replace(/networkUUID:/g, "");
        var optionDiv = getEl("div");
        optionDiv.className = "ndex_option_variant";
        var networkName = rowData.cols[0];
        optionDiv.textContent = networkName;
        optionDiv.setAttribute("networkid", networkId);
        optionDiv.setAttribute("networkname", networkName);
        optionDiv.style.fontFamily = "Roboto";
        optionDiv.style.fontSize = "12px";
        optionDiv.style.cursor = "pointer";
        optionDiv.style.paddingBottom = "3px";
        optionDiv.onmouseenter = function (evt) {
          document.getElementById("ndex_select_variant").textContent =
            "v " + evt.target.getAttribute("networkname");
          var options = document.getElementsByClassName("ndex_options_variant");
          for (var j = 0; j < options.length; j++) {
            var option = options[j];
            if (
              option.getAttribute("networkid") ==
              evt.target.getAttribute("networkid")
            ) {
              option.style.backgroundColor = "#9999cc";
              option.style.color = "white";
            } else {
              option.style.backgroundColor = "white";
              option.style.color = "black";
            }
          }
          document.getElementById("ndex_options_variant").focus();
        };
        optionDiv.onclick = function (evt) {
          document.getElementById("ndex_options_variant").style.display =
            "none";
          var networkUUID = evt.target.getAttribute("networkid");
          self.selectedNetworkName = evt.target.getAttribute("networkname");
          var selectDiv = document.getElementById("ndex_select_variant");
          selectDiv.textContent = "> " + self.selectedNetworkName;
          selectDiv.style.border = "2px outset #dddddd";
          selectDiv.style.fontWeight = "bold";
          if (networkUUID != "") {
            var url = "https://www.ndexbio.org/v2/network/" + networkUUID;
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader(
              "Authorization",
              "Basic " + btoa("cravat2017:cravat2017")
            );
            request.onload = function (e) {
              var response = JSON.parse(request.response);
              drawNetwork(networkUUID, response);
            };
            request.onerror = function (f) {
              console.log(f);
            };
            request.send(null);
          }
        };
        addEl(optionsDiv, optionDiv);
      }
      addEl(this.enrichmentDiv, optionsDiv);

      // Shows first network
      var option = optionsDiv.getElementsByClassName("ndex_option_variant")[0];
      var networkUUID = option.getAttribute("networkid");
      var networkName = option.getAttribute("networkname");
      optionsDiv.style.display = "none";
      var select = this.enrichmentDiv.getElementsByClassName(
        "ndex_select_variant"
      )[0];
      select.textContent = "> " + networkName;
      select.style.border = "2px outset #dddddd";
      if (networkUUID != "") {
        var url = "https://www.ndexbio.org/v2/network/" + networkUUID;
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader(
          "Authorization",
          "Basic " + btoa("cravat2017:cravat2017")
        );
        request.onload = function (e) {
          var response = JSON.parse(request.response);
          drawNetwork(networkUUID, response);
        };
        request.onerror = function (f) {
          console.log(f);
        };
        request.send(null);
      }

      function drawNetwork(networkUUID, asCXResponse) {
        // Converts UniProt protein names to HUGOs.
        var ndex_prot_hugo_dic = {
          "1433B": "YWHAB",
          "1433E": "YWHAE",
          "1433F": "YWHAH",
          "1433G": "YWHAG",
          "1433S": "SFN",
          "1433T": "YWHAQ",
          "1433Z": "YWHAZ",
          "1A03": "HLA-A",
          "2A5A": "PPP2R5A",
          "2A5D": "PPP2R5D",
          "2AAA": "PPP2R1A",
          "2ABA": "PPP2R2A",
          "2ABB": "PPP2R2B",
          "2B11": "HLA-DRB1",
          "3BP2": "SH3BP2",
          "3BP5": "SH3BP5",
          "3MG": "MPG",
          41: "EPB41",
          "4EBP1": "EIF4EBP1",
          "4F2": "SLC3A2",
          "5NTD": "NT5E",
          A1AT: "SERPINA1",
          A2MG: "A2M",
          A4: "APP",
          AA2AR: "ADORA2A",
          AA2BR: "ADORA2B",
          AAAT: "SLC1A5",
          AAKB1: "PRKAB1",
          ACADV: "ACADVL",
          ACES: "ACHE",
          ACHA: "CHRNA1",
          ACHE: "CHRNE",
          ACK1: "TNK2",
          ACL6A: "ACTL6A",
          ACS2L: "ACSS1",
          ACSA: "ACSS2",
          ACTA: "ACTA2",
          ACTS: "ACTA1",
          ACVL1: "ACVRL1",
          ADA10: "ADAM10",
          ADA12: "ADAM12",
          ADA15: "ADAM15",
          ADA17: "ADAM17",
          ADA1B: "ADRA1B",
          ADA28: "ADAM28",
          ADML: "ADM",
          ADRO: "FDXR",
          AFAD: "MLLT4",
          AKIP: "AURKAIP1",
          AKP13: "AKAP13",
          AKTS1: "AKT1S1 ",
          AL9A1: "ALDH9A1",
          ALBU: "ALB",
          ALEX: "GNAS ",
          AMPN: "ANPEP",
          AMRP: "LRPAP1",
          AN32A: "ANP32A",
          ANDR: "AR",
          ANF: "NPPA",
          ANGL3: "ANGPTL3",
          ANGP1: "ANGPT1",
          ANGP2: "ANGPT2",
          ANGP4: "ANGPT4",
          ANGT: "AGT",
          ANM1: "PRMT1",
          ANM5: "PRMT5",
          ANRA2: "ANKRA2",
          ANT3: "SERPINC1",
          ANTR1: "ANTXR1",
          ANTR2: "ANTXR2",
          AP2A: "TFAP2A",
          AP2B: "TFAP2B",
          AP2C: "TFAP2C",
          APAF: "APAF1",
          APBP2: "APPBP2",
          APOA: "LPA",
          APR: "PMAIP1",
          ARBK1: "ADRBK1",
          ARBK2: "ADRBK2",
          ARC1B: "ARPC1B",
          ARF: "CDKN2A ",
          ARFG1: "ARFGAP1",
          ARFP2: "ARFIP2",
          ARG28: "ARHGEF28",
          ARGAL: "ARHGEF10L",
          ARGI1: "ARG1",
          ARHG1: "ARHGEF1",
          ARHG2: "ARHGEF2",
          ARHG3: "ARHGEF3",
          ARHG4: "ARHGEF4",
          ARHG5: "ARHGEF5",
          ARHG6: "ARHGEF6",
          ARHG7: "ARHGEF7",
          ARHG8: "NET1",
          ARHG9: "ARHGEF9",
          ARHGA: "ARHGEF10",
          ARHGB: "ARHGEF11",
          ARHGC: "ARHGEF12",
          ARHGF: "ARHGEF15",
          ARHGH: "ARHGEF17",
          ARHGI: "ARHGEF18",
          ARHGP: "ARHGEF25",
          ARI3A: "ARID3A",
          ARP2: "ACTR2",
          ARP3: "ACTR3",
          ARRC: "ARR3",
          ARRS: "SAG",
          ASC: "PYCARD",
          ASM: "SMPD1",
          ASPP1: "PPP1R13B",
          ASPP2: "TP53BP2",
          AT2B1: "ATP2B1",
          ATF6A: "ATF6",
          ATTY: "TAT",
          AVR2A: "ACVR2A",
          AVR2B: "ACVR2B",
          B2CL1: "BCL2L1",
          B2CL2: "BCL2L2",
          B2L11: "BCL2L11",
          B2L14: "BCL2L14",
          B2LA1: "BCL2A1",
          B2MG: "B2M",
          BAIP2: "BAIAP2",
          BAK: "BAK1",
          BASI: "BSG",
          BCAP: "PIK3AP1",
          BCE1: "BCE1",
          BDH: "BDH1",
          BGH3: "TGFBI",
          BHE40: "BHLHE40",
          BHE41: "BHLHE41",
          BIG1: "ARFGEF1",
          BKRB2: "BDKRB2",
          BMAL1: "ARNTL",
          BMR1A: "BMPR1A",
          BMR1B: "BMPR1B",
          BNI3L: "BNIP3L",
          BOREA: "CDCA8",
          BRAC: "T",
          CABIN: "CABIN1",
          CABL1: "CABLES1",
          CAC1G: "CACNA1G",
          CACO1: "CALCOCO1",
          CADH1: "CDH1",
          CADH2: "CDH2",
          CADH5: "CDH5",
          CAH1: "CA1",
          CAH2: "CA2",
          CAH9: "CA9",
          CALM: "CALM1",
          CAMP3: "CAMSAP3",
          CAN1: "CAPN1",
          CAN2: "CAPN2",
          CAR11: "CARD11",
          CASB: "CSN2",
          CASPA: "CASP10",
          CATA: "CAT",
          CATD: "CTSD",
          CATG: "CTSG",
          CBL: "CBL",
          CBP: "CREBBP",
          CBPE: "CPE",
          CC14B: "CDC14B",
          CCL4: "CCL4",
          CD11B: "CDK11B",
          CD3Z: "CD247",
          CD40L: "CD40LG",
          CD5R1: "CDK5R1",
          CD5R2: "CDK5R2",
          CDN1A: "CDKN1A",
          CDN1B: "CDKN1B",
          CDN2A: "CDKN2A ",
          CDN2B: "CDKN2B",
          CDN2C: "CDKN2C",
          CE164: "CEP164",
          CEGT: "UGCG",
          CERU: "CP",
          CES1P: "CES1P1",
          CH60: "HSPD1",
          CHIN: "CHN1",
          CHIO: "CHN2",
          CHIP: "STUB1 ",
          CHK1: "CHEK1",
          CHK2: "CHEK2",
          CIP4: "TRIP10",
          CITE1: "CITED1",
          CITE2: "CITED2",
          CKLF2: "CMTM2",
          CKS1: "CKS1B",
          CLCA: "CLTA",
          CLCB: "CLTB",
          CLD1: "CLDN1",
          CLH1: "CLTC",
          CLTR1: "CYSLTR1",
          CLTR2: "CYSLTR2",
          CLUS: "CLU",
          CNBP1: "CTNNBIP1",
          CNCG: "PDE6H",
          CND1: "NCAPD2",
          CND2: "NCAPH",
          CND3: "NCAPG",
          CNKR1: "CNKSR1",
          CNRG: "PDE6G",
          CO1A1: "COL1A1",
          CO1A2: "COL1A2",
          CO2A1: "COL2A1",
          CO3: "C3",
          CO3A1: "COL3A1",
          CO4A1: "COL4A1",
          CO4A2: "COL4A2",
          CO4A3: "COL4A3",
          CO4A4: "COL4A4",
          CO4A5: "COL4A5",
          CO4A6: "COL4A6",
          CO5A1: "COL5A1",
          CO5A2: "COL5A2",
          CO6A1: "COL6A1",
          CO6A2: "COL6A2",
          CO6A3: "COL6A3",
          CO6A5: "COL6A5",
          CO6A6: "COL6A6",
          CO7A1: "COL7A1",
          COBA1: "COL11A1",
          COBA2: "COL11A2",
          COF1: "CFL1",
          COF2: "CFL2",
          COHA1: "COL17A1",
          COIA1: "COL18A1",
          COLI: "POMC",
          COM1: "RBBP8",
          COOA1: "COL24A1",
          COT2: "NR2F2",
          CP2CI: "CYP2C18",
          CRCM1: "ORAI1",
          CRDL1: "CHRDL1",
          CSF2R: "CSF2RA",
          CSK21: "CSNK2A1",
          CSK2B: "CSNK2B",
          CSKP: "CASK",
          CSN5: "COPS5",
          CSPG2: "VCAN",
          CTDS1: "CTDSP1",
          CTDS2: "CTDSP2",
          CTDSL: "CTDSPL",
          CTHR1: "CTHRC1",
          CTNA1: "CTNNA1",
          CTNB1: "CTNNB1",
          CTND1: "CTNND1",
          CTRO: "CIT",
          CXA1: "GJA1",
          CXL10: "CXCL10",
          CXL11: "CXCL11",
          CXL13: "CXCL13",
          CY24A: "CYBA",
          CY24B: "CYBB",
          CYC: "CYCS",
          CYFP2: "CYFIP2 ",
          CYH1: "CYTH1",
          CYH2: "CYTH2",
          CYH3: "CYTH3",
          DAB2P: "DAB2IP",
          DBLOH: "DIABLO",
          DCE1: "GAD1",
          DCOR: "ODC1",
          DCR1B: "DCLRE1B",
          DCR1C: "DCLRE1C",
          DEF1: "DEFA1",
          DEFI6: "DEF6",
          DESM: "DES",
          DESP: "DSP",
          DGLA: "DAGLA",
          DGLB: "DAGLB",
          DIAP1: "DIAPH1",
          DIAP3: "DIAPH3",
          DICER: "DICER1",
          DLGP5: "DLGAP5",
          DLRB1: "DYNLRB1",
          DNJA1: "DNAJA1",
          DNJA3: "DNAJA3",
          DNLI4: "LIG4",
          DNM3A: "DNMT3A",
          DOC10: "DOCK10",
          DOC11: "DOCK11",
          DP13A: "APPL1",
          DPOLA: "POLA1",
          DPOLL: "POLL",
          DPOLM: "POLM",
          DPTOR: "DEPTOR",
          DRA: "HLA-DRA",
          DUS1: "DUSP1",
          DUS10: "DUSP10",
          DUS16: "DUSP16",
          DUS5: "DUSP5",
          DUS6: "DUSP6",
          DUS8: "DUSP8",
          DYHC1: "DYNC1H1",
          DYLT1: "DYNLT1",
          DYN1: "DNM1",
          DYN2: "DNM2",
          DYR: "DHFR",
          DYST: "DST",
          E2AK2: "EIF2AK2",
          E41L1: "EPB41L1",
          EF2: "EEF2",
          EF2K: "EEF2K",
          EGLN: "ENG",
          ELK1: "ELK1",
          ELNE: "ELANE",
          ENOA: "ENO1",
          ENPL: "HSP90B1",
          ERC6L: "ERCC6L",
          ERD21: "KDELR1",
          EST1: "CES1",
          EST1A: "SMG6",
          EST2: "CES2",
          EST3: "CES3",
          EST4A: "CES4A",
          EST5A: "CES5A",
          EWS: "EWSR1",
          EZRI: "EZR",
          F120B: "FAM120B",
          F13A: "F13A1",
          F175A: "FAM175A",
          F263: "PFKFB3",
          FA10: "F10",
          FACD2: "FANCD2",
          FAIM1: "FAIM",
          FAK1: "PTK2",
          FAK2: "PTK2B",
          FAN: "NSMAF",
          FANCJ: "BRIP1",
          FAP24: "FAAP24 ",
          FAS: "FASN",
          FBSP1: "FBXO45",
          FBW1A: "BTRC",
          FBW1B: "FBXW11",
          FBX11: "FBXO11",
          FBX32: "FBXO32",
          FBX5: "FBXO5",
          FBX8: "FBXO8",
          FCERA: "FCER1A",
          FCERB: "MS4A2",
          FCERG: "FCER1G",
          FCG2A: "FCGR2A",
          FCG2B: "FCGR2B",
          FETA: "AFP",
          FETUA: "AHSG",
          FIBA: "FGA",
          FIBB: "FGB",
          FIBG: "FGG",
          FINC: "FN1",
          FKB1A: "FKBP1A",
          FOG1: "ZFPM1",
          FOXO6: "FOXO6",
          FP100: "FAAP100 ",
          FRDA: "FXN",
          FRIH: "FTH1",
          FYB: "FYB",
          FZD5: "FZD5",
          FZR: "FZR1",
          G3P: "GAPDH",
          GA45A: "GADD45A",
          GA45B: "GADD45B",
          GA45G: "GADD45G",
          GBB1: "GNB1",
          GBB3: "GNB3",
          GBB5: "GNB5",
          GBG1: "GNGT1",
          GBG2: "GNG2",
          GBGT2: "GNGT2",
          GCR: "NR3C1",
          GDIA: "GDI1",
          GDIR1: "ARHGDIA",
          GDIR2: "ARHGDIB",
          GDIR3: "ARHGDIG",
          GDS1: "RAP1GDS1",
          GELS: "GSN",
          GLHA: "CGA",
          GLO2: "HAGH",
          GLUC: "GCG",
          GLYC: "SHMT1",
          GNAO: "GNAO1",
          GNDS: "RALGDS",
          GNPTA: "GNPTAB",
          GOGA2: "GOLGA2",
          GON1: "GNRH1",
          GORS1: "GORASP1",
          GP124: "GPR124",
          GPAT1: "GPAM",
          GRAA: "GZMA",
          GRAB: "GZMB",
          GRAM4: "GRAMD4",
          GROA: "CXCL1",
          GRP1: "RASGRP1",
          GRP2: "RASGRP2",
          GRP3: "RASGRP3",
          GRP4: "RASGRP4",
          GRP78: "HSPA5",
          GTR1: "SLC2A1",
          GTR2: "SLC2A2",
          GTR3: "SLC2A3",
          GTR4: "SLC2A4",
          GUC1A: "GUCA1A",
          GUC1B: "GUCA1B",
          GUC1C: "GUCA1C",
          GUC2D: "GUCY2D",
          GUC2F: "GUCY2F",
          H14: "HIST1H1E",
          H2A2C: "HIST2H2AC",
          H2AX: "H2AFX",
          H2AY: "H2AFY",
          H2AZ: "H2AFZ",
          H2B1A: "HIST1H2BA",
          H2B2E: "HIST2H2BE",
          H32: "HIST2H3A",
          H33: "H3F3A",
          H4: "HIST1H4A",
          HAKAI: "CBLL1",
          HCDH: "HADH",
          HD: "HTT",
          HDA10: "HDAC10",
          HDA11: "HDAC11",
          HEM1: "ALAS1",
          HEMH: "FECH",
          HG2A: "CD74",
          HGFL: "MST1",
          HIF1N: "HIF1AN",
          HMCS1: "HMGCS1",
          HMCS2: "HMGCS2",
          HNF6: "ONECUT1",
          HNRPC: "HNRNPC",
          HS90A: "HSP90AA1",
          HS90B: "HSP90AB1",
          HSP74: "HSPA4",
          HSP7C: "HSPA8",
          HXA10: "HOXA10",
          HXB13: "HOXB13",
          HXK1: "HK1",
          HXK2: "HK2",
          HXK4: "GCK",
          I12R1: "IL12RB1",
          I12R2: "IL12RB2",
          I13R1: "IL13RA1",
          I13R2: "IL13RA2",
          I18RA: "IL18RAP",
          I27RA: "IL27RA",
          IASPP: "PPP1R13L",
          IBP1: "IGFBP1",
          IBP3: "IGFBP3",
          ICEF1: "IPCEF1",
          IF172: "IFT172",
          IF2A: "EIF2S1",
          IF2B1: "IGF2BP1",
          IF4A1: "EIF4A1",
          IF4B: "EIF4B",
          IF4E: "EIF4E",
          IF4G1: "EIF4G1",
          IFN10: "IFNA10",
          IFN14: "IFNA14",
          IFN16: "IFNA16",
          IFN17: "IFNA17",
          IFN21: "IFNA21",
          IFNB: "IFNB1",
          IGHA1: "IGHA1",
          IGHE: "IGHE",
          IGHG1: "IGHG1",
          IGHG3: "IGHG3",
          IKBA: "NFKBIA",
          IKBB: "NFKBIB",
          IKKA: "CHUK",
          IKKB: "IKBKB",
          IL17: "IL17A",
          IL18R: "IL18R1",
          IL1AP: "IL1RAP",
          IL1RA: "IL1RN",
          IL27A: "IL27",
          IL27B: "EBI3",
          IL3RB: "CSF2RB",
          IL4RA: "IL4R",
          IL6RA: "IL6R",
          IL6RB: "IL6ST",
          IL8: "CXCL8",
          IMA1: "KPNA2",
          IMA5: "KPNA1",
          IMB1: "KPNB1",
          INAR1: "IFNAR1",
          INAR2: "IFNAR2",
          INCE: "INCENP",
          INGR1: "IFNGR1",
          INVO: "IVL",
          IQEC1: "IQSEC1",
          IQGA1: "IQGAP1",
          IQGA3: "IQGAP3",
          ITA1: "ITGA1",
          ITA10: "ITGA10",
          ITA11: "ITGA11",
          ITA2: "ITGA2",
          ITA2B: "ITGA2B",
          ITA3: "ITGA3",
          ITA4: "ITGA4",
          ITA5: "ITGA5",
          ITA6: "ITGA6",
          ITA7: "ITGA7",
          ITA8: "ITGA8",
          ITA9: "ITGA9",
          ITAD: "ITGAD",
          ITAE: "ITGAE",
          ITAL: "ITGAL",
          ITAM: "ITGAM",
          ITAV: "ITGAV",
          ITAX: "ITGAX",
          ITB1: "ITGB1",
          ITB2: "ITGB2",
          ITB3: "ITGB3",
          ITB4: "ITGB4",
          ITB5: "ITGB5",
          ITB6: "ITGB6",
          ITB7: "ITGB7",
          ITB8: "ITGB8",
          ITF2: "TCF4",
          JAM1: "F11R",
          JAML1: "AMICA1",
          JIP3: "MAPK8IP3",
          JIP4: "SPAG9",
          JUNB: "JUNB",
          K1C14: "KRT14",
          K1C17: "KRT17",
          K1C18: "KRT18",
          K1C19: "KRT19",
          K2C1: "KRT1",
          K2C5: "KRT5",
          K2C8: "KRT8",
          KAISO: "ZBTB33",
          KAP0: "PRKAR1A",
          KAP1: "PRKAR1B",
          KAPCA: "PRKACA",
          KAPCB: "PRKACB",
          KAPCG: "PRKACG",
          KC1A: "CSNK1A1",
          KC1D: "CSNK1D",
          KC1E: "CSNK1E",
          KC1G1: "CSNK1G1",
          KC1G2: "CSNK1G2",
          KC1G3: "CSNK1G3",
          KCC2A: "CAMK2A",
          KCC2B: "CAMK2B",
          KCC2D: "CAMK2D",
          KCC2G: "CAMK2G",
          KCC4: "CAMK4",
          KCIP4: "KCNIP4",
          KCJ11: "KCNJ11",
          KCJ15: "KCNJ15",
          KCRM: "CKM",
          KDIS: "KIDINS220",
          KGP1: "PRKG1",
          KI13B: "KIF13B",
          KI20A: "KIF20A",
          KI3L1: "KIR3DL1",
          KINH: "KIF5B",
          KIRR1: "KIRREL",
          KITH: "TK1",
          KKCC2: "CAMKK2",
          KLH12: "KLHL12",
          KLH13: "KLHL13",
          KLH20: "KLHL20",
          KLOT: "KL",
          KLOTB: "KLB",
          KPCA: "PRKCA",
          KPCB: "PRKCB",
          KPCD: "PRKCD",
          KPCD1: "PRKD1",
          KPCE: "PRKCE",
          KPCG: "PRKCG",
          KPCI: "PRKCI",
          KPCL: "PRKCH",
          KPCT: "PRKCQ",
          KPCZ: "PRKCZ",
          KPYM: "PKM",
          KPYR: "PKLR",
          KREM2: "KREMEN2",
          KS6A1: "RPS6KA1",
          KS6A3: "RPS6KA3",
          KS6A4: "RPS6KA4",
          KS6A5: "RPS6KA5",
          KS6B1: "RPS6KB1",
          KSYK: "SYK",
          KTNA1: "KATNA1 ",
          LAT: "LAT",
          LCAP: "LNPEP",
          LEG1: "LGALS1",
          LEG3: "LGALS3",
          LFG2: "FAIM2",
          LIGO1: "LINGO1",
          LIPL: "LPL",
          LIS1: "PAFAH1B1 ",
          LN28B: "LIN28B",
          LOX15: "ALOX15",
          LSHR: "LHCGR",
          LST2: "ZFYVE28",
          LST8: "MLST8",
          LX12B: "ALOX12B",
          LYAG: "GAA",
          LYAM2: "SELE",
          LYAM3: "SELP",
          LYRIC: "MTDH",
          LYSC: "LYZ",
          M3K1: "MAP3K1",
          M3K10: "MAP3K10",
          M3K11: "MAP3K11 ",
          M3K12: "MAP3K12",
          M3K14: "MAP3K14",
          M3K2: "MAP3K2",
          M3K3: "MAP3K3",
          M3K4: "MAP3K4",
          M3K5: "MAP3K5",
          M3K6: "MAP3K6",
          M3K7: "MAP3K7",
          M3K8: "MAP3K8",
          M4K1: "MAP4K1",
          M4K2: "MAP4K2",
          M4K3: "MAP4K3",
          M4K4: "MAP4K4",
          M4K5: "MAP4K5",
          MAD1: "MXD1",
          MAD4: "MXD4",
          MADCA: "MADCAM1",
          MAGD1: "MAGED1",
          MAGH1: "MAGEH1",
          MAPK2: "MAPKAPK2",
          MAPK3: "MAPKAPK3",
          MAPK5: "MAPKAPK5",
          MARE1: "MAPRE1",
          MAT1: "MNAT1",
          MB3L2: "MBD3L2",
          MD1L1: "MAD1L1",
          MD2BP: "MAD2L1BP",
          MDR1: "ABCB1",
          MEP50: "WDR77",
          MERL: "NF2",
          METK2: "MAT2A",
          MFGM: "MFGE8",
          MIEAP: "SPATA18",
          MIMIT: "NDUFAF2",
          MINA: "MINA ",
          MINT: "SPEN",
          MIS: "AMH",
          MK: "MDK",
          MK01: "MAPK1",
          MK03: "MAPK3",
          MK07: "MAPK7",
          MK08: "MAPK8",
          MK09: "MAPK9",
          MK10: "MAPK10",
          MK11: "MAPK11",
          MK12: "MAPK12",
          MK13: "MAPK13",
          MK14: "MAPK14",
          MLRS: "MYLPF ",
          MLRV: "MYL2 ",
          MLTK: "ZAK",
          MOES: "MSN",
          MP2K1: "MAP2K1",
          MP2K2: "MAP2K2",
          MP2K3: "MAP2K3",
          MP2K4: "MAP2K4",
          MP2K5: "MAP2K5",
          MP2K6: "MAP2K6",
          MP2K7: "MAP2K7",
          MPCP: "SLC25A3",
          MPIP1: "CDC25A",
          MPIP2: "CDC25B",
          MPIP3: "CDC25C",
          MRCKA: "CDC42BPA ",
          MRP1: "ABCC1",
          MT2: "MT2A",
          MTAP2: "MAP2",
          MTG16: "CBFA2T3",
          MYBA: "MYBL1",
          MYBB: "MYBL2",
          MYCD: "MYOCD",
          MYPT1: "PPP1R12A",
          NCKP1: "NCKAP1",
          NCKX1: "SLC24A1",
          NCKX2: "SLC24A2",
          NDKA: "NME1",
          NDKB: "NME2",
          NDUS2: "NDUFS2",
          NDUV3: "NDUFV3",
          NECD: "NDN",
          NED4L: "NEDD4L",
          NEMO: "IKBKG",
          NET1: "NTN1",
          NEUL1: "NEURL1",
          NEUM: "GAP43",
          NEUS: "SERPINI1",
          NEUT: "NTS",
          NFAC1: "NFATC1",
          NFAC2: "NFATC2",
          NFAC3: "NFATC3",
          NFAC4: "NFATC4",
          NGN1: "NEUROG1",
          NGN3: "NEUROG3",
          NHRF1: "SLC9A3R1",
          NHRF2: "SLC9A3R2",
          NICA: "NCSTN",
          NKG2E: "KLRC3",
          NKX21: "NKX2-1 ",
          NKX25: "NKX2-5",
          NKX31: "NKX3-1",
          NMDE1: "GRIN2A",
          NMDE2: "GRIN2B",
          NOGG: "NOG",
          NOTC1: "NOTCH1",
          NOTC2: "NOTCH2 ",
          NOTC3: "NOTCH3",
          NOTC4: "NOTCH4",
          NPHN: "NPHS1",
          NPM: "NPM1",
          NRAM1: "SLC11A1",
          NRAM2: "SLC11A2",
          NSMA: "SMPD2",
          NSMA2: "SMPD3",
          NTAL: "LAT2",
          NTF2: "NUTF2",
          NU153: "NUP153",
          NU214: "NUP214",
          NUCL: "NCL",
          ODFP2: "ODF2",
          OMGP: "OMG",
          ONCM: "OSM",
          OPRM: "OPRM1",
          OPSD: "RHO",
          OPSG: "OPN1MW ",
          OSTCN: "BGLAP",
          OSTP: "SPP1",
          P2R3B: "PPP2R3B",
          P3C2A: "PIK3C2A",
          P3C2B: "PIK3C2B",
          P4K2A: "PI4K2A",
          P53: "TP53",
          P63: "TP63",
          P66A: "GATAD2A",
          P66B: "GATAD2B",
          P73: "TP73",
          P85A: "PIK3R1",
          PA1B2: "PAFAH1B2",
          PA1B3: "PAFAH1B3",
          PA21B: "PLA2G1B",
          PA24A: "PLA2G4A",
          PA2GA: "PLA2G2A",
          PAFA: "PLA2G7",
          PAI1: "SERPINE1",
          PAPOA: "PAPOLA",
          PAR1: "F2R",
          PAR14: "PARP14",
          PAR3: "F2RL2",
          PAR4: "F2RL3",
          PAR6A: "PARD6A",
          PAXI: "PXN",
          PCKGC: "PCK1 ",
          PCKGM: "PCK2",
          PD2R: "PTGDR",
          PDC10: "PDCD10",
          PDIP3: "POLDIP3",
          PDLI7: "PDLIM7",
          PEBB: "CBFB",
          PECA1: "PECAM1",
          PEN2: "PSENEN",
          PERF: "PRF1",
          PERM: "MPO",
          PFD5: "PFDN5",
          PFKAL: "PFKL",
          PFKAM: "PFKM",
          PGES2: "PTGES2",
          PGFRA: "PDGFRA",
          PGFRB: "PDGFRB",
          PGH2: "PTGS2",
          PGS1: "BGN",
          PGS2: "DCN",
          PGTA: "RABGGTA",
          PGTB2: "RABGGTB",
          PHAG1: "PAG1",
          PHLD: "GPLD1",
          PI2R: "PTGIR",
          PI3R6: "PIK3R6",
          PI51A: "PIP5K1A",
          PI51B: "PIP5K1B",
          PI51C: "PIP5K1C",
          PIPNA: "PITPNA",
          PIT1: "POU1F1",
          PK3CA: "PIK3CA",
          PK3CB: "PIK3CB",
          PK3CG: "PIK3CG",
          PKHA1: "PLEKHA1",
          PKHA2: "PLEKHA2",
          PKHA7: "PLEKHA7",
          PKHG6: "PLEKHG6",
          PLAK: "JUP",
          PLF4: "PF4",
          PLGF: "PGF",
          PLMN: "PLG",
          PLXD1: "PLXND1",
          PO210: "NUP210",
          PO2F1: "POU2F1",
          PO2F2: "POU2F2",
          PO4F1: "POU4F1",
          PO4F2: "POU4F2",
          PO5F1: "POU5F1",
          PODO: "NPHS2",
          POTE1: "POT1",
          PP14A: "PPP1R14A",
          PP14B: "PPP1R14B",
          PP14C: "PPP1R14C",
          PP1A: "PPP1CA",
          PP1B: "PPP1CB",
          PP1G: "PPP1CC",
          PP2AA: "PPP2CA",
          PP2AB: "PPP2CB",
          PP2BA: "PPP3CA",
          PP2BB: "PPP3CB",
          PP2BC: "PPP3CC",
          PPAC: "ACP1",
          PPP5: "PPP5C",
          PPR3A: "PPP1R3A",
          PR15A: "PPP1R15A",
          PRD15: "PRDM15",
          PRGC1: "PPARGC1A",
          PRGR: "PGR",
          PRIO: "PRNP",
          PRKN2: "PARK2",
          PSA3: "PSMA3",
          PSD1: "PSD",
          PSN1: "PSEN1",
          PSN2: "PSEN2",
          PTC1: "PTCH1",
          PTC2: "PTCH2",
          PTEN: "PTEN",
          PTHR: "PTHLH",
          PTN1: "PTPN1",
          PTN11: "PTPN11",
          PTN13: "PTPN13",
          PTN2: "PTPN2",
          PTN21: "PTPN21",
          PTN6: "PTPN6",
          PTN7: "PTPN7",
          PVRL1: "PVRL1",
          PVRL2: "PVRL2",
          PVRL3: "PVRL3",
          PYR1: "CAD",
          QORX: "TP53I3",
          R144B: "RNF144B",
          R9BP: "RGS9BP",
          RABX5: "RABGEF1",
          RAD: "RRAD",
          RADI: "RDX",
          RAGE: "AGER",
          RAGP1: "RANGAP1",
          RANB3: "RANBP3",
          RANB9: "RANBP9",
          RANG: "RANBP1",
          RASF1: "RASSF1 ",
          RASF5: "RASSF5",
          RASH: "HRAS",
          RASK: "KRAS",
          RASL1: "RASAL1 ",
          RASL2: "RASA4",
          RASN: "NRAS",
          RB: "RB1",
          RB11A: "RAB11A",
          RB6I2: "ERC1",
          RBCC1: "RB1CC1",
          RBGPR: "RAB3GAP2",
          RBP1: "RALBP1",
          RBP10: "RANBP10",
          RBP2: "RANBP2",
          RCAS1: "EBAG9",
          RDH1: "RDH5",
          RET1: "RBP1",
          RET2: "RBP2",
          RETNB: "RETNLB",
          RFA1: "RPA1",
          RFA2: "RPA2",
          RFIP3: "RAB11FIP3",
          RFXK: "RFXANK",
          RGAP1: "RACGAP1 ",
          RGMC: "HFE2",
          RGRF1: "RASGRF1",
          RGRF2: "RASGRF2",
          RHG01: "ARHGAP1",
          RHG04: "ARHGAP4",
          RHG05: "ARHGAP5",
          RHG06: "ARHGAP6",
          RHG07: "DLC1",
          RHG08: "ARHGAP8",
          RHG09: "ARHGAP9",
          RHG10: "ARHGAP10",
          RHG17: "ARHGAP17",
          RHG26: "ARHGAP26",
          RHG32: "ARHGAP32",
          RHG35: "ARHGAP35",
          RICTR: "RICTOR ",
          RIR1: "RRM1",
          RIR2: "RRM2",
          RIR2B: "RRM2B",
          RK: "GRK1",
          RL11: "RPL11",
          RL23: "RPL23",
          RL5: "RPL5",
          RN111: "RNF111",
          RN128: "RNF128",
          RN187: "RNF187",
          RNC: "DROSHA",
          ROA1: "HNRNPA1",
          RON: "MST1R",
          RPC4: "POLR3D",
          RPGF1: "RAPGEF1",
          RS27L: "RPS27L ",
          RS6: "RPS6",
          RT29: "DAP3",
          RUVB1: "RUVBL1",
          RUVB2: "RUVBL2",
          S10A2: "S100A2",
          S10A7: "S100A7",
          S10A8: "S100A8",
          S10A9: "S100A9",
          S11IP: "STK11IP",
          S14L2: "SEC14L2",
          SAFB1: "SAFB",
          SC6A3: "SLC6A3",
          SCAM2: "SCAMP2",
          SCF: "KITLG",
          SCNNA: "SCNN1A",
          SDCB1: "SDCBP",
          SDF1: "CXCL12",
          SDOS: "NUDT16L1",
          SELPL: "SELPLG",
          SEM3C: "SEMA3C",
          SEM3E: "SEMA3E",
          SEM4A: "SEMA4A",
          SETB1: "SETDB1",
          SETD8: "SETD8",
          SFPA2: "SFTPA2",
          SFTA1: "SFTPA1",
          SGOL1: "SGOL1",
          SH21A: "SH2D1A",
          SH22A: "SH2D2A",
          SH3G1: "SH3GL1",
          SH3G2: "SH3GL2",
          SH3K1: "SH3KBP1",
          SHAN3: "SHANK3",
          SHIP1: "INPP5D",
          SHIP2: "INPPL1",
          SIAL: "IBSP",
          SIN1: "MAPKAP1",
          SIR1: "SIRT1",
          SIR2: "SIRT2",
          SIR3: "SIRT3",
          SIR4: "SIRT4 ",
          SIR5: "SIRT5 ",
          SIR6: "SIRT6",
          SIR7: "SIRT7",
          SL9A1: "SLC9A1",
          SL9A3: "SLC9A3 ",
          SLAP1: "SLA",
          SLAP2: "SLA2",
          SMAL1: "SMARCAL1",
          SMCA2: "SMARCA2 ",
          SMCA4: "SMARCA4",
          SMCE1: "SMARCE1",
          SMRC1: "SMARCC1",
          SMRC2: "SMARCC2",
          SMRD1: "SMARCD1 ",
          SMRD3: "SMARCD3",
          SMS1: "SGMS1",
          SMUF1: "SMURF1",
          SMUF2: "SMURF2",
          SNCAP: "SNCAIP",
          SNF5: "SMARCB1",
          SNP25: "SNAP25",
          SODC: "SOD1",
          SODM: "SOD2",
          SORT: "SORT1",
          SOSD1: "SOSTDC1",
          SPB5: "SERPINB5",
          SPRE1: "SPRED1",
          SPRE2: "SPRED2",
          SPT13: "SPATA13",
          SPTB2: "SPTBN1",
          SPTN1: "SPTAN1",
          SPY2: "SPRY2",
          SQSTM: "SQSTM1",
          SRBP1: "SREBF1",
          SRBS1: "SORBS1 ",
          SRC8: "CTTN",
          SRGP1: "SRGAP1",
          SRP09: "SRP9",
          ST2A1: "SULT2A1",
          ST65G: "SUPT7L",
          STA5A: "STAT5A",
          STA5B: "STAT5B",
          STABP: "STAMBP",
          STAM1: "STAM",
          STEA3: "STEAP3",
          STRAA: "STRADA",
          STRAB: "STRADB",
          STXB1: "STXBP1",
          STXB4: "STXBP4",
          SUH: "RBPJ",
          SUPT3: "SUPT3H",
          SUV91: "SUV39H1",
          SV421: "SUV420H1",
          SYGP1: "SYNGAP1",
          SYUA: "SNCA",
          Src: "SRC",
          T126A: "TMEM126A",
          T53I1: "TP53INP1",
          TA2R: "TBXA2R",
          TAD2B: "TADA2B",
          TAGL: "TAGLN",
          TAU: "MAPT",
          TBA1A: "TUBA1A",
          TBA1B: "TUBA1B",
          TBB2A: "TUBB2A",
          TBCD4: "TBC1D4",
          TBG1: "TUBG1",
          TBL1R: "TBL1XR1",
          TCA: "TRAC",
          TCAM1: "TICAM1",
          TCAM2: "TICAM2",
          TCTP: "TPT1",
          TDT: "DNTT",
          TE2IP: "TERF2IP",
          TEBP: "PTGES3",
          TEFF2: "TMEFF2",
          TENA: "TNC",
          TENS1: "TNS1",
          TF2H2: "GTF2H2",
          TF3A: "GTF3A",
          TF65: "RELA",
          TF7L1: "TCF7L1",
          TF7L2: "TCF7L2",
          TFE2: "TCF3",
          TFPI1: "TFPI",
          TFR1: "TFRC",
          TGBR3: "TGFBR3",
          TGFA1: "TGFBRAP1",
          TGFI1: "TGFB1I1",
          TGFR1: "TGFBR1",
          TGFR2: "TGFBR2",
          THA: "THRA",
          THB: "THRB",
          THIO: "TXN",
          THRB: "F2",
          TIE2: "TEK",
          TIF1A: "TRIM24",
          TIF1B: "TRIM28",
          TIM: "TIMELESS ",
          TISB: "ZFP36L1",
          TMPS2: "TMPRSS2",
          TNAP3: "TNFAIP3",
          TNF10: "TNFSF10",
          TNF11: "TNFSF11",
          TNFA: "TNF",
          TNFB: "LTA",
          TNFL6: "FASLG",
          TNKS1: "TNKS",
          TNR16: "NGFR",
          TNR18: "TNFRSF18",
          TNR1A: "TNFRSF1A",
          TNR1B: "TNFRSF1B",
          TNR4: "TNFRSF4",
          TNR5: "CD40",
          TNR6: "FAS",
          TNR9: "TNFRSF9",
          TOLIP: "TOLLIP",
          TOPB1: "TOPBP1",
          TP4A1: "PTP4A1",
          TP4A2: "PTP4A2",
          TP4A3: "PTP4A3",
          TP53B: "TP53BP1",
          TPA: "PLAT",
          TPIP1: "TP53AIP1",
          TPPC4: "TRAPPC4",
          TR10A: "TNFRSF10A",
          TR10B: "TNFRSF10B",
          TR10C: "TNFRSF10C",
          TR10D: "TNFRSF10D",
          TR13B: "TNFRSF13B",
          TRBC1: "TRBC1",
          TRBM: "THBD",
          TRDC: "TRDC",
          TRFE: "TF",
          TRI59: "TRIM59",
          TRIA1: "TRIAP1",
          TS101: "TSG101",
          TSP1: "THBS1",
          TSP2: "THBS2",
          TTHY: "TTR",
          TTP: "ZFP36",
          TWST1: "TWIST1",
          TY3H: "TH",
          TYDP2: "TDP2",
          TYSY: "TYMS",
          TYY1: "YY1",
          UB2D1: "UBE2D1",
          UB2D2: "UBE2D2",
          UB2D3: "UBE2D3",
          UB2L3: "UBE2L3",
          UB2V1: "UBE2V1",
          UBC12: "UBE2M",
          UBC9: "UBE2I",
          UBF1: "UBTF",
          UBP1: "USP1",
          UBP6: "USP6",
          UBP7: "USP7",
          UBP8: "USP8",
          UBQL1: "UBQLN1",
          UFO: "AXL",
          UN13B: "UNC13B",
          UPAR: "PLAUR",
          UROK: "PLAU",
          US6NL: "USP6NL",
          UTER: "SCGB1A1",
          VAV: "VAV1",
          VGFR1: "FLT1",
          VGFR2: "KDR",
          VGFR3: "FLT4",
          VIME: "VIM",
          VINC: "VCL",
          VTNC: "VTN",
          WASP: "WAS",
          X3CL1: "CX3CL1",
          XPO2: "CSE1L",
          YBOX1: "YBX1",
          YES: "YES1",
          YETS4: "YEATS4",
          Z385A: "ZNF385A",
          ZBT17: "ZBTB17",
          ZCH12: "ZCCHC12",
          ZFAN5: "ZFAND5",
          ZFY16: "ZFYVE16",
          ZFYV9: "ZFYVE9",
          ZN274: "ZNF274",
          ZN318: "ZNF318",
          ZN363: "RCHY1",
          ZO1: "TJP1",
          ZO2: "TJP2",
        };
        var nodes = asCXResponse[5]["nodes"];
        if (nodes == undefined) {
          nodes = asCXResponse[3]["nodes"];
        }
        for (var i = 0; i < nodes.length; i++) {
          var uniprot = nodes[i]["n"].replace("_HUMAN", "");
          var hugo = ndex_prot_hugo_dic[uniprot];
          if (hugo != undefined) {
            nodes[i]["n"] = hugo;
          }
        }

        var networkInfo = enrichmentScores[networkUUID];
        var genesInTheOverlap = Object.keys(networkInfo["overlap"]);

        // response is a CX network
        // First convert it to niceCX to make it easy to update attributes
        var niceCX = CxCyUtils.rawCXtoNiceCX(asCXResponse);
        var overlapNodes = [];
        for (var i = 0; i < genesInTheOverlap.length; i++) {
          var geneInTheOverlap = genesInTheOverlap[i];
          var nodeId = niceCX.nodeidofgene[geneInTheOverlap];
          overlapNodes.push(nodeId);
        }
        var networkName = null;
        var networkProperties = null;
        if (niceCX && niceCX["networkAttributes"]) {
          var networkNameNetworkProperties = extractNetworkProperties(
            niceCX["networkAttributes"]
          );
          networkName = networkNameNetworkProperties[0];
          networkProperties = networkNameNetworkProperties[1];
        }
        // add 'inQuery' : 'true' to nodes that link to terms (genes) in the enrichment query
        for (var i = 0; i < overlapNodes.length; i++) {
          var nodeId = overlapNodes[i];
          CxCyUtils.setNodeAttribute(niceCX, nodeId, "inQuery", "true");
        }

        var attributeNameMap = {};

        var cyElements = CxCyUtils.cyElementsFromNiceCX(
          niceCX,
          attributeNameMap
        );

        var layoutName = "cose";

        if (CxCyUtils.allNodesHaveUniquePositions(cyElements)) {
          layoutName = "preset";
        }

        var cyLayout = { name: layoutName };

        self.networkDiv.innerHTML = "";
        self.cy = cytoscape({
          container: self.networkDiv,
          style: CxCyUtils.getCravatVisualizeStyle(),
          layout: cyLayout,
          elements: cyElements,
          wheelSensitivity: 0.2,
        });
        cytoscape_instance = self.cy;

        // Legend
        var innerLegendDiv = CxCyUtils.getInnerLegendDiv(cyElements);
        self.legendDiv.innerHTML = "";
        addEl(self.legendDiv, innerLegendDiv);
      }

      function extractNetworkProperties(properties) {
        var networkName = null;
        var netProperties = [];
        if (!properties || !properties.elements) {
          return netProperties;
        }
        for (var i = 0; i < properties.elements.length; i++) {
          var prop = properties.elements[i];
          if (prop.n.toLowerCase() === "name") {
            networkName = prop.v;
          }
          if (prop.v) {
            netProperties.push(prop);
          }
        }
        return [networkName, netProperties];
      }

      var CxCyUtils = (function () {
        var CRAVAT_VISUAL_STYLE = [
          {
            selector: "node",
            css: {
              "background-color": "rgb(200,200,200)",
              "text-opacity": 1,
              "font-size": 10,
              "border-width": 2.5,
              color: "rgb(0,0,0)",
              width: "35.0",
              shape: "roundrectangle",
              "border-opacity": 1,
              "border-color": "rgb(180,180,180)",
              height: "35.0",
              "background-opacity": 1,
              "text-valign": "center",
              "text-halign": "center",
              "font-family": "monospace",
              "font-weight": "plain",
            },
          },
          {
            selector: "node[name]",
            css: {
              content: "data(name)",
            },
          },
          {
            selector: "node[type = 'Small Molecule']",
            css: {
              "background-color": "rgb(255,153,0)",
              "border-color": "rgb(255,153,9)",
            },
          },
          {
            selector: "node[type = 'SmallMolecule']",
            css: {
              "background-color": "rgb(255,153,0)",
              "border-color": "rgb(255,153,0)",
            },
          },
          {
            selector: "node[type = 'Small Molecule']",
            css: {
              shape: "octagon",
            },
          },
          {
            selector: "node[type = 'SmallMolecule']",
            css: {
              shape: "octagon",
            },
          },
          {
            selector: "node[type = 'Protein']",
            css: {
              shape: "ellipse",
            },
          },
          {
            selector: "node[inQuery = 'true']",
            css: {
              "background-color": "rgb(255, 50, 70)",
              "border-color": "rgb(186, 37, 52)",
            },
          },
          {
            selector: "node:selected",
            css: {
              "background-color": "rgb(239, 62, 192)",
              "border-color": "rgb(140, 37, 112)",
            },
          },
          {
            selector: "edge",
            css: {
              "font-size": 10,
              "line-style": "dashed",
              "target-arrow-shape": "none",
              color: "rgb(240,240,240)",
              width: 1,
              "source-arrow-shape": "none",
              "text-opacity": 1,
              opacity: 1,
            },
          },
          {
            selector: "edge[directed = 'true']",
            css: {
              "target-arrow-shape": "triangle",
              "line-style": "solid",
            },
          },
          {
            selector: "edge[directed = 'false']",
            css: {
              "line-style": "dashed",
            },
          },
          {
            selector: "edge:selected",
            css: {
              "line-color": "rgb(239, 62, 192)",
              "source-arrow-color": "rgb(239, 62, 192)",
              "target-arrow-color": "rgb(239, 62, 192)",
            },
          },
        ];
        var ndexEdgeInteractionColorScheme = {
          default: { color: "rgb(240,240,240)" },

          "controls-expression-of": { color: "rgb(255,182,0)" },
          "controls-phosphorylation-of": { color: "rgb(152, 0, 255)" },
          "controls-state-change-of": { color: "rgb(195, 159, 224)" },
          "reacts-with": { color: "rgb(216, 199, 229)" },
          "interacts-with": { color: "rgb(216, 199, 229)" },
          "interacts with": { color: "rgb(216, 199, 229)" },

          "controls-transport-of": { color: "rgb(168, 224, 223)" },
          "controls-transport-of-chemical": { color: "rgb(206, 206, 194)" },

          "consumption-controled-by": { color: "rgb(168, 224, 223)" },

          "chemical-affects": { color: "rgb(206, 206, 194)" },
          "catalysis-precedes": { color: "rgb(206, 206, 194)" },
          "used-to-produce": { color: "rgb(206, 206, 194)" },
          "controls-production-of": { color: "rgb(156, 183, 181)" },

          "in-complex-with": { color: "rgb(168, 244, 184)" },
          "neighbor-of": { color: "rgb(212, 244, 219)" },

          selected: { color: "rgb(239, 62, 192)" },
        };
        var css = {};
        var color = ndexEdgeInteractionColorScheme["default"]["color"];
        css["line-color"] = color;
        css["source-arrow-color"] = color;
        css["target-arrow-color"] = color;
        CRAVAT_VISUAL_STYLE.push({ selector: "edge", css: css });
        var interactions = Object.keys(ndexEdgeInteractionColorScheme);
        for (var i = 0; i < interactions.length; i++) {
          var interaction = interactions[i];
          var edgeInteractionCss = {};
          if (interaction == "default") {
            continue;
          } else if (interaction == "selected") {
            edgeInteractionCss["selector"] = "edge:" + interaction;
          } else {
            edgeInteractionCss["selector"] =
              'edge[interaction="' + interaction + '"]';
          }
          var color = ndexEdgeInteractionColorScheme[interaction]["color"];
          edgeInteractionCss["css"] = {};
          edgeInteractionCss["css"]["line-color"] = color;
          edgeInteractionCss["css"]["source-arrow-color"] = color;
          edgeInteractionCss["css"]["target-arrow-color"] = color;
          CRAVAT_VISUAL_STYLE.push(edgeInteractionCss);
        }

        var handleCxElement = function (aspectName, element, niceCX) {
          var aspect = niceCX[aspectName];
          if (aspectName === "nodeAttributes") {
            if (!aspect) {
              aspect = { nodes: {} };
              niceCX[aspectName] = aspect;
            }
            var nodeMap = aspect.nodes;
            var attributes = nodeMap[element.po];
            if (!attributes) {
              attributes = {};
              nodeMap[element.po] = attributes;
            }
            attributes[element.n] = { v: element.v, d: element.d };
          } else {
            // opaque for now
            if (!aspect) {
              // add aspect to niceCX
              aspect = { elements: [] };
              niceCX[aspectName] = aspect;
            }
            var elementList = aspect.elements;
            elementList.push(element);
          }
        };

        var getCyAttributeName = function (attributeName, attributeNameMap) {
          var cyAttributeName = attributeNameMap[attributeName];
          if (!cyAttributeName) {
            attributeNameMap[attributeName] = attributeName; // direct mapping
            cyAttributeName = attributeName;
          }
          return cyAttributeName;
        };

        //Public
        var publicFn = {};

        publicFn.getCravatVisualizeStyle = function () {
          return CRAVAT_VISUAL_STYLE;
        };

        publicFn.rawCXtoNiceCX = function (rawCX) {
          var niceCX = {};
          for (var i = 0; i < rawCX.length; i++) {
            var fragment = rawCX[i];
            if (fragment) {
              var aspectName;
              for (aspectName in fragment) {
                var elements = fragment[aspectName];
                if (aspectName === "numberVerification") {
                  if (!niceCX.numberVerification) {
                    niceCX.numberVerification = fragment;
                  }
                  continue;
                } else if (aspectName === "status") {
                  if (!niceCX.status) {
                    niceCX.status = fragment;
                  }
                  continue;
                } else if (aspectName === "metaData") {
                  if (!niceCX.preMetaData) {
                    niceCX.preMetaData = fragment;
                  } else if (!niceCX.postMetaData) {
                    niceCX.postMetaData = fragment;
                  }
                  continue;
                }
                for (var j = 0; j < elements.length; j++) {
                  var element = elements[j];
                  handleCxElement(aspectName, element, niceCX);
                }
              }
            }
          }
          niceCX["nodeidofgene"] = {};
          for (var i = 0; i < niceCX.nodes.elements.length; i++) {
            var node = niceCX.nodes.elements[i];
            niceCX["nodeidofgene"][node.n.replace(/_HUMAN/g, "")] = node["@id"];
          }
          return niceCX;
        };

        publicFn.setNodeAttribute = function (
          niceCX,
          nodeId,
          attributeName,
          attributeValue,
          attributeDataType
        ) {
          if (!attributeName || !attributeValue) {
            return;
          }
          var attributeObject = { v: attributeValue };
          if (attributeDataType) {
            attributeObject.d = attributeDataType;
          }
          if (!niceCX.nodeAttributes.nodes[nodeId]) {
            niceCX.nodeAttributes.nodes[nodeId] = {};
          }
          niceCX.nodeAttributes.nodes[nodeId][attributeName] = attributeObject;
        };

        publicFn.cyElementsFromNiceCX = function (niceCX, attributeNameMap) {
          var elements = {};
          var nodeList = [];
          var nodeMap = {};
          var edgeList = [];
          var edgeMap = {};

          elements.nodes = nodeList;
          elements.edges = edgeList;

          // handle node aspect
          if (niceCX.nodes) {
            niceCX.nodes.elements.forEach(function (nodeElement) {
              var cxNodeId = nodeElement["@id"];
              var nodeData = { id: cxNodeId };
              if (nodeElement.n) {
                nodeData["name"] = nodeElement.n.replace(/_HUMAN/g, "");
              }
              if (nodeElement.r) {
                nodeData.represents = nodeElement.r;
              }
              nodeMap[cxNodeId] = { data: nodeData };
            });
          }

          if (niceCX.nodeAttributes) {
            var nodeAttrs = niceCX.nodeAttributes.nodes;
            var nodeIds = Object.keys(nodeAttrs);
            for (var i = 0; i < nodeIds.length; i++) {
              var nodeId = nodeIds[i];
              var node = nodeMap[nodeId];
              if (node) {
                var attr = nodeAttrs[nodeId];
                node.data.type = attr.type.v;
                if ("inQuery" in attr) {
                  node.data.inQuery = nodeAttrs[nodeId].inQuery.v;
                }
              }
            }
          }

          // handle cartesianCoordinates aspect
          if (niceCX.cartesianLayout) {
            niceCX.cartesianLayout.elements.forEach(function (element) {
              var nodeId = element.node;
              var node = nodeMap[nodeId];
              node.position = { x: element.x, y: element.y };
            });
          }

          // handle edge aspect
          if (niceCX.edges) {
            niceCX.edges.elements.forEach(function (element) {
              var cxEdgeId = "e" + element["@id"];
              var edgeData = {
                id: cxEdgeId,
                source: element.s,
                target: element.t,
              };

              if (element.i) {
                edgeData.interaction = element.i;
              }

              edgeMap[cxEdgeId] = { data: edgeData };
            });
          }

          // handle edgeAttributes aspect
          // Note that edgeAttributes elements are just in a list in niceCX for the moment!!
          if (niceCX.edgeAttributes) {
            niceCX.edgeAttributes.elements.forEach(function (element) {
              var edgeId = "e" + element.po;
              var edge = edgeMap[edgeId];
              var cyAttributeName = getCyAttributeName(
                element.n,
                attributeNameMap
              );
              // todo: parse value according to datatype
              edge.data[cyAttributeName] = element.v;
            });
          }

          var nodeIds = Object.keys(nodeMap);
          for (var i = 0; i < nodeIds.length; i++) {
            nodeList.push(nodeMap[nodeIds[i]]);
          }

          var edgeIds = Object.keys(edgeMap);
          for (var i = 0; i < edgeIds.length; i++) {
            edgeList.push(edgeMap[edgeIds[i]]);
          }
          return elements;
        };

        publicFn.allNodesHaveUniquePositions = function (cyElements) {
          var nodePositionMap = {};
          var nodes = cyElements.nodes;
          for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            var node = nodes[nodeIndex];
            var position = node.position;
            if (!position) {
              // found a node without a position so we return false
              return false;
            }
            var positionKey = position.x + "_" + position.y;
            if (nodePositionMap[positionKey]) {
              // found a duplicate position so we return false
              return false;
            } else {
              // add this position to the map
              nodePositionMap[positionKey] = position;
            }
          }
          return true;
        };

        // Legend
        publicFn.getInnerLegendDiv = function (cyElements) {
          var addedInteractions = {};
          var div = getEl("div");
          div.style.padding = "4px";
          var edges = cyElements.edges;
          for (var i = 0; i < edges.length; i++) {
            var edge = edges[i].data;
            var directed = edge.directed;
            var interaction = edge.interaction;
            if (addedInteractions[interaction] != undefined) {
              continue;
            }
            var lineType = "dashed";
            if (directed == "true") {
              lineType = "solid";
            }
            var lineColor = ndexEdgeInteractionColorScheme["default"]["color"];
            if (ndexEdgeInteractionColorScheme[interaction] != undefined) {
              lineColor = ndexEdgeInteractionColorScheme[interaction]["color"];
            }
            var lineDiv = getEl("div");
            lineDiv.style.display = "inline-block";
            lineDiv.style.borderBottom = "3px " + lineType + " " + lineColor;
            lineDiv.style.position = "relative";
            lineDiv.style.top = "-2px";
            lineDiv.style.color = lineColor;
            lineDiv.style.width = "30px";
            lineDiv.style.padding = "4px";
            lineDiv.textContent = "    ";
            addEl(div, lineDiv);
            var spacerDiv = getEl("div");
            spacerDiv.style.display = "inline-block";
            spacerDiv.style.width = "6px";
            spacerDiv.textContent = " ";
            addEl(div, spacerDiv);
            addEl(div, getTn(interaction.replace(/-/g, " ")));
            addEl(div, getEl("br"));
            addedInteractions[interaction] = true;
          }
          return div;
        };

        return publicFn;
      })();
    },
  },
  gene: {
    width: 600,
    height: 600,
    donterase: false,
    variables: {},
    beforeresize: function () {
      $(this["variables"]["div"]).empty();
    },
    onresize: function (parentDiv, row, tabName) {
      this["function"](parentDiv, row, tabName);
    },
    function: function (parentDiv, row, tabName) {
      var v = this["variables"];
      if (parentDiv != undefined) {
        v["div"] = parentDiv;
      } else if (v["div"] != undefined) {
        parentDiv = v["div"];
      }
      var self = this;
      $(parentDiv).empty();
      self.selectedNetworkName = "";
      var networkids = getWidgetData(tabName, "ndex", row, "networkid");
      var networknames = getWidgetData(tabName, "ndex", row, "networkname");
      var hugo = getWidgetData(tabName, "base", row, "hugo");
      if (networkids == null) {
        return "No data";
      }
      // configureEnrichmentScoresForTable port
      self.data = {};
      self.data["head"] = { cols: ["Pathway", "p-value", "Genes"] };
      self.data["body"] = [];
      networkids = networkids.split(",");
      networknames = networknames.split(",");
      for (var i = 0; i < networkids.length; i++) {
        var networkid = networkids[i];
        var networkname = networknames[i];
        self.data["body"].push({
          attrs: [networkid],
          cols: [networkname, hugo],
        });
      }

      //Enrichment Div
      this.enrichmentDiv = getEl("div");
      this.enrichmentDiv.id = "ndex_list_gene";
      this.enrichmentDiv.style.fontSize = "12px";
      this.enrichmentDiv.style.fontWeight = "normal";
      this.enrichmentDiv.style.fontFamily = "Roboto";
      this.enrichmentDiv.style.position = "absolute";
      this.enrichmentDiv.style.zIndex = 1;
      this.enrichmentDiv.style.width = "96%";
      this.enrichmentDiv.style.height = "";
      addEl(parentDiv, this.enrichmentDiv);
      //Network Div
      this.networkDiv = getEl("div");
      this.networkDiv.id = "ndex_canvas_gene";
      this.networkDiv.style.width = "100%";
      this.networkDiv.style.height = "100%";
      this.networkDiv.style.top = "10%";
      this.networkDiv.style.left = "10%";
      this.networkDiv.style.backgroundColor = "rgb(250,250,250)";
      this.networkDiv.addEventListener("click", function (evt) {
        var options = document.getElementById("ndex_options_gene");
        options.style.display = "none";
        options.previousSibling.textContent = "> " + self.selectedNetworkName;
      });
      addEl(parentDiv, this.networkDiv);
      // Legends div
      this.legendDiv = getEl("div");
      this.legendDiv.id = "ndex_legend_gene";
      this.legendDiv.style.position = "absolute";
      this.legendDiv.style.left = " 20px";
      this.legendDiv.style.top = "70px";
      addEl(parentDiv, this.legendDiv);
      // Enrichment score
      var enrichmentScores = {};
      for (var i = 0; i < self.data["body"].length; i++) {
        var networkUUID = self.data["body"][i]["attrs"][0];
        var hugo = self.data["body"][i]["cols"][1];
        enrichmentScores[networkUUID] = {
          k: 1,
          pv: 0,
          set_id: networkUUID,
          set_name: self.data["body"][i]["cols"][0],
        };
        enrichmentScores[networkUUID]["overlap"] = {};
        enrichmentScores[networkUUID]["overlap"][hugo] = 1;
      }
      // Network name area
      var div = getEl("div");
      div.id = "ndex_select_gene";
      div.className = "ndex_select_gene";
      div.style.fontFamily = "Roboto";
      div.style.fontSize = "12px";
      div.style.fontWeight = "normal";
      div.style.cursor = "pointer";
      div.style.padding = "2px";
      div.style.border = "2px outset #dddddd";
      div.onclick = function (evt) {
        var selectDiv = evt.target;
        var optionsDiv = document.getElementById("ndex_options_gene");
        if (optionsDiv.style.display == "none") {
          optionsDiv.style.display = "block";
          selectDiv.textContent = "v " + self.selectedNetworkName;
          selectDiv.style.border = "2px inset #dddddd";
        } else {
          optionsDiv.style.display = "none";
          selectDiv.textContent = "> " + self.selectedNetworkName;
          selectDiv.style.border = "2px outset #dddddd";
        }
      };
      div.textContent = "> " + self.selectedNetworkName;
      addEl(this.enrichmentDiv, div);
      // Network options
      var optionsDiv = getEl("div");
      optionsDiv.id = "ndex_options_gene";
      optionsDiv.style.fontFamily = "Roboto";
      optionsDiv.style.fontSize = "12px";
      optionsDiv.style.fontWeight = "normal";
      optionsDiv.style.maxHeight = "400px";
      optionsDiv.style.overflow = "auto";
      optionsDiv.style.display = "none";
      optionsDiv.style.zIndex = "5";
      optionsDiv.style.backgroundColor = "white";
      optionsDiv.style.border = "1px solid gray";
      optionsDiv.style.padding = "6px";
      optionsDiv.tabIndex = "-1";
      for (var i = 0; i < self.data["body"].length; i++) {
        var rowData = self.data["body"][i];
        var option = null;
        var networkId = rowData.attrs[0].replace(/networkUUID:/g, "");
        var optionDiv = getEl("div");
        optionDiv.className = "ndex_option_gene";
        var networkName = rowData.cols[0];
        optionDiv.textContent = networkName;
        optionDiv.setAttribute("networkid", networkId);
        optionDiv.setAttribute("networkname", networkName);
        optionDiv.style.fontFamily = "Roboto";
        optionDiv.style.fontSize = "12px";
        optionDiv.style.cursor = "pointer";
        optionDiv.style.paddingBottom = "3px";
        optionDiv.onmouseenter = function (evt) {
          document.getElementById("ndex_select_gene").textContent =
            "v " + evt.target.getAttribute("networkname");
          var options = document.getElementsByClassName("ndex_options_gene");
          for (var j = 0; j < options.length; j++) {
            var option = options[j];
            if (
              option.getAttribute("networkid") ==
              evt.target.getAttribute("networkid")
            ) {
              option.style.backgroundColor = "#9999cc";
              option.style.color = "white";
            } else {
              option.style.backgroundColor = "white";
              option.style.color = "black";
            }
          }
          document.getElementById("ndex_options_gene").focus();
        };
        optionDiv.onclick = function (evt) {
          document.getElementById("ndex_options_gene").style.display = "none";
          var networkUUID = evt.target.getAttribute("networkid");
          self.selectedNetworkName = evt.target.getAttribute("networkname");
          var selectDiv = document.getElementById("ndex_select_gene");
          selectDiv.textContent = "> " + self.selectedNetworkName;
          selectDiv.style.border = "2px outset #dddddd";
          selectDiv.style.fontWeight = "bold";
          if (networkUUID != "") {
            var url = "https://www.ndexbio.org/v2/network/" + networkUUID;
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader(
              "Authorization",
              "Basic " + btoa("cravat2017:cravat2017")
            );
            request.onload = function (e) {
              var response = JSON.parse(request.response);
              drawNetwork(networkUUID, response);
            };
            request.onerror = function (f) {
              console.log(f);
            };
            request.send(null);
          }
        };
        addEl(optionsDiv, optionDiv);
      }
      addEl(this.enrichmentDiv, optionsDiv);

      // Shows first network
      var option = optionsDiv.getElementsByClassName("ndex_option_gene")[0];
      var networkUUID = option.getAttribute("networkid");
      var networkName = option.getAttribute("networkname");
      optionsDiv.style.display = "none";
      var select =
        this.enrichmentDiv.getElementsByClassName("ndex_select_gene")[0];
      select.textContent = "> " + networkName;
      select.style.border = "2px outset #dddddd";
      if (networkUUID != "") {
        var url = "https://www.ndexbio.org/v2/network/" + networkUUID;
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader(
          "Authorization",
          "Basic " + btoa("cravat2017:cravat2017")
        );
        request.onload = function (e) {
          var response = JSON.parse(request.response);
          drawNetwork(networkUUID, response);
        };
        request.onerror = function (f) {
          console.log(f);
        };
        request.send(null);
      }

      function drawNetwork(networkUUID, asCXResponse) {
        // Converts UniProt protein names to HUGOs.
        var ndex_prot_hugo_dic = {
          "1433B": "YWHAB",
          "1433E": "YWHAE",
          "1433F": "YWHAH",
          "1433G": "YWHAG",
          "1433S": "SFN",
          "1433T": "YWHAQ",
          "1433Z": "YWHAZ",
          "1A03": "HLA-A",
          "2A5A": "PPP2R5A",
          "2A5D": "PPP2R5D",
          "2AAA": "PPP2R1A",
          "2ABA": "PPP2R2A",
          "2ABB": "PPP2R2B",
          "2B11": "HLA-DRB1",
          "3BP2": "SH3BP2",
          "3BP5": "SH3BP5",
          "3MG": "MPG",
          41: "EPB41",
          "4EBP1": "EIF4EBP1",
          "4F2": "SLC3A2",
          "5NTD": "NT5E",
          A1AT: "SERPINA1",
          A2MG: "A2M",
          A4: "APP",
          AA2AR: "ADORA2A",
          AA2BR: "ADORA2B",
          AAAT: "SLC1A5",
          AAKB1: "PRKAB1",
          ACADV: "ACADVL",
          ACES: "ACHE",
          ACHA: "CHRNA1",
          ACHE: "CHRNE",
          ACK1: "TNK2",
          ACL6A: "ACTL6A",
          ACS2L: "ACSS1",
          ACSA: "ACSS2",
          ACTA: "ACTA2",
          ACTS: "ACTA1",
          ACVL1: "ACVRL1",
          ADA10: "ADAM10",
          ADA12: "ADAM12",
          ADA15: "ADAM15",
          ADA17: "ADAM17",
          ADA1B: "ADRA1B",
          ADA28: "ADAM28",
          ADML: "ADM",
          ADRO: "FDXR",
          AFAD: "MLLT4",
          AKIP: "AURKAIP1",
          AKP13: "AKAP13",
          AKTS1: "AKT1S1 ",
          AL9A1: "ALDH9A1",
          ALBU: "ALB",
          ALEX: "GNAS ",
          AMPN: "ANPEP",
          AMRP: "LRPAP1",
          AN32A: "ANP32A",
          ANDR: "AR",
          ANF: "NPPA",
          ANGL3: "ANGPTL3",
          ANGP1: "ANGPT1",
          ANGP2: "ANGPT2",
          ANGP4: "ANGPT4",
          ANGT: "AGT",
          ANM1: "PRMT1",
          ANM5: "PRMT5",
          ANRA2: "ANKRA2",
          ANT3: "SERPINC1",
          ANTR1: "ANTXR1",
          ANTR2: "ANTXR2",
          AP2A: "TFAP2A",
          AP2B: "TFAP2B",
          AP2C: "TFAP2C",
          APAF: "APAF1",
          APBP2: "APPBP2",
          APOA: "LPA",
          APR: "PMAIP1",
          ARBK1: "ADRBK1",
          ARBK2: "ADRBK2",
          ARC1B: "ARPC1B",
          ARF: "CDKN2A ",
          ARFG1: "ARFGAP1",
          ARFP2: "ARFIP2",
          ARG28: "ARHGEF28",
          ARGAL: "ARHGEF10L",
          ARGI1: "ARG1",
          ARHG1: "ARHGEF1",
          ARHG2: "ARHGEF2",
          ARHG3: "ARHGEF3",
          ARHG4: "ARHGEF4",
          ARHG5: "ARHGEF5",
          ARHG6: "ARHGEF6",
          ARHG7: "ARHGEF7",
          ARHG8: "NET1",
          ARHG9: "ARHGEF9",
          ARHGA: "ARHGEF10",
          ARHGB: "ARHGEF11",
          ARHGC: "ARHGEF12",
          ARHGF: "ARHGEF15",
          ARHGH: "ARHGEF17",
          ARHGI: "ARHGEF18",
          ARHGP: "ARHGEF25",
          ARI3A: "ARID3A",
          ARP2: "ACTR2",
          ARP3: "ACTR3",
          ARRC: "ARR3",
          ARRS: "SAG",
          ASC: "PYCARD",
          ASM: "SMPD1",
          ASPP1: "PPP1R13B",
          ASPP2: "TP53BP2",
          AT2B1: "ATP2B1",
          ATF6A: "ATF6",
          ATTY: "TAT",
          AVR2A: "ACVR2A",
          AVR2B: "ACVR2B",
          B2CL1: "BCL2L1",
          B2CL2: "BCL2L2",
          B2L11: "BCL2L11",
          B2L14: "BCL2L14",
          B2LA1: "BCL2A1",
          B2MG: "B2M",
          BAIP2: "BAIAP2",
          BAK: "BAK1",
          BASI: "BSG",
          BCAP: "PIK3AP1",
          BCE1: "BCE1",
          BDH: "BDH1",
          BGH3: "TGFBI",
          BHE40: "BHLHE40",
          BHE41: "BHLHE41",
          BIG1: "ARFGEF1",
          BKRB2: "BDKRB2",
          BMAL1: "ARNTL",
          BMR1A: "BMPR1A",
          BMR1B: "BMPR1B",
          BNI3L: "BNIP3L",
          BOREA: "CDCA8",
          BRAC: "T",
          CABIN: "CABIN1",
          CABL1: "CABLES1",
          CAC1G: "CACNA1G",
          CACO1: "CALCOCO1",
          CADH1: "CDH1",
          CADH2: "CDH2",
          CADH5: "CDH5",
          CAH1: "CA1",
          CAH2: "CA2",
          CAH9: "CA9",
          CALM: "CALM1",
          CAMP3: "CAMSAP3",
          CAN1: "CAPN1",
          CAN2: "CAPN2",
          CAR11: "CARD11",
          CASB: "CSN2",
          CASPA: "CASP10",
          CATA: "CAT",
          CATD: "CTSD",
          CATG: "CTSG",
          CBL: "CBL",
          CBP: "CREBBP",
          CBPE: "CPE",
          CC14B: "CDC14B",
          CCL4: "CCL4",
          CD11B: "CDK11B",
          CD3Z: "CD247",
          CD40L: "CD40LG",
          CD5R1: "CDK5R1",
          CD5R2: "CDK5R2",
          CDN1A: "CDKN1A",
          CDN1B: "CDKN1B",
          CDN2A: "CDKN2A ",
          CDN2B: "CDKN2B",
          CDN2C: "CDKN2C",
          CE164: "CEP164",
          CEGT: "UGCG",
          CERU: "CP",
          CES1P: "CES1P1",
          CH60: "HSPD1",
          CHIN: "CHN1",
          CHIO: "CHN2",
          CHIP: "STUB1 ",
          CHK1: "CHEK1",
          CHK2: "CHEK2",
          CIP4: "TRIP10",
          CITE1: "CITED1",
          CITE2: "CITED2",
          CKLF2: "CMTM2",
          CKS1: "CKS1B",
          CLCA: "CLTA",
          CLCB: "CLTB",
          CLD1: "CLDN1",
          CLH1: "CLTC",
          CLTR1: "CYSLTR1",
          CLTR2: "CYSLTR2",
          CLUS: "CLU",
          CNBP1: "CTNNBIP1",
          CNCG: "PDE6H",
          CND1: "NCAPD2",
          CND2: "NCAPH",
          CND3: "NCAPG",
          CNKR1: "CNKSR1",
          CNRG: "PDE6G",
          CO1A1: "COL1A1",
          CO1A2: "COL1A2",
          CO2A1: "COL2A1",
          CO3: "C3",
          CO3A1: "COL3A1",
          CO4A1: "COL4A1",
          CO4A2: "COL4A2",
          CO4A3: "COL4A3",
          CO4A4: "COL4A4",
          CO4A5: "COL4A5",
          CO4A6: "COL4A6",
          CO5A1: "COL5A1",
          CO5A2: "COL5A2",
          CO6A1: "COL6A1",
          CO6A2: "COL6A2",
          CO6A3: "COL6A3",
          CO6A5: "COL6A5",
          CO6A6: "COL6A6",
          CO7A1: "COL7A1",
          COBA1: "COL11A1",
          COBA2: "COL11A2",
          COF1: "CFL1",
          COF2: "CFL2",
          COHA1: "COL17A1",
          COIA1: "COL18A1",
          COLI: "POMC",
          COM1: "RBBP8",
          COOA1: "COL24A1",
          COT2: "NR2F2",
          CP2CI: "CYP2C18",
          CRCM1: "ORAI1",
          CRDL1: "CHRDL1",
          CSF2R: "CSF2RA",
          CSK21: "CSNK2A1",
          CSK2B: "CSNK2B",
          CSKP: "CASK",
          CSN5: "COPS5",
          CSPG2: "VCAN",
          CTDS1: "CTDSP1",
          CTDS2: "CTDSP2",
          CTDSL: "CTDSPL",
          CTHR1: "CTHRC1",
          CTNA1: "CTNNA1",
          CTNB1: "CTNNB1",
          CTND1: "CTNND1",
          CTRO: "CIT",
          CXA1: "GJA1",
          CXL10: "CXCL10",
          CXL11: "CXCL11",
          CXL13: "CXCL13",
          CY24A: "CYBA",
          CY24B: "CYBB",
          CYC: "CYCS",
          CYFP2: "CYFIP2 ",
          CYH1: "CYTH1",
          CYH2: "CYTH2",
          CYH3: "CYTH3",
          DAB2P: "DAB2IP",
          DBLOH: "DIABLO",
          DCE1: "GAD1",
          DCOR: "ODC1",
          DCR1B: "DCLRE1B",
          DCR1C: "DCLRE1C",
          DEF1: "DEFA1",
          DEFI6: "DEF6",
          DESM: "DES",
          DESP: "DSP",
          DGLA: "DAGLA",
          DGLB: "DAGLB",
          DIAP1: "DIAPH1",
          DIAP3: "DIAPH3",
          DICER: "DICER1",
          DLGP5: "DLGAP5",
          DLRB1: "DYNLRB1",
          DNJA1: "DNAJA1",
          DNJA3: "DNAJA3",
          DNLI4: "LIG4",
          DNM3A: "DNMT3A",
          DOC10: "DOCK10",
          DOC11: "DOCK11",
          DP13A: "APPL1",
          DPOLA: "POLA1",
          DPOLL: "POLL",
          DPOLM: "POLM",
          DPTOR: "DEPTOR",
          DRA: "HLA-DRA",
          DUS1: "DUSP1",
          DUS10: "DUSP10",
          DUS16: "DUSP16",
          DUS5: "DUSP5",
          DUS6: "DUSP6",
          DUS8: "DUSP8",
          DYHC1: "DYNC1H1",
          DYLT1: "DYNLT1",
          DYN1: "DNM1",
          DYN2: "DNM2",
          DYR: "DHFR",
          DYST: "DST",
          E2AK2: "EIF2AK2",
          E41L1: "EPB41L1",
          EF2: "EEF2",
          EF2K: "EEF2K",
          EGLN: "ENG",
          ELK1: "ELK1",
          ELNE: "ELANE",
          ENOA: "ENO1",
          ENPL: "HSP90B1",
          ERC6L: "ERCC6L",
          ERD21: "KDELR1",
          EST1: "CES1",
          EST1A: "SMG6",
          EST2: "CES2",
          EST3: "CES3",
          EST4A: "CES4A",
          EST5A: "CES5A",
          EWS: "EWSR1",
          EZRI: "EZR",
          F120B: "FAM120B",
          F13A: "F13A1",
          F175A: "FAM175A",
          F263: "PFKFB3",
          FA10: "F10",
          FACD2: "FANCD2",
          FAIM1: "FAIM",
          FAK1: "PTK2",
          FAK2: "PTK2B",
          FAN: "NSMAF",
          FANCJ: "BRIP1",
          FAP24: "FAAP24 ",
          FAS: "FASN",
          FBSP1: "FBXO45",
          FBW1A: "BTRC",
          FBW1B: "FBXW11",
          FBX11: "FBXO11",
          FBX32: "FBXO32",
          FBX5: "FBXO5",
          FBX8: "FBXO8",
          FCERA: "FCER1A",
          FCERB: "MS4A2",
          FCERG: "FCER1G",
          FCG2A: "FCGR2A",
          FCG2B: "FCGR2B",
          FETA: "AFP",
          FETUA: "AHSG",
          FIBA: "FGA",
          FIBB: "FGB",
          FIBG: "FGG",
          FINC: "FN1",
          FKB1A: "FKBP1A",
          FOG1: "ZFPM1",
          FOXO6: "FOXO6",
          FP100: "FAAP100 ",
          FRDA: "FXN",
          FRIH: "FTH1",
          FYB: "FYB",
          FZD5: "FZD5",
          FZR: "FZR1",
          G3P: "GAPDH",
          GA45A: "GADD45A",
          GA45B: "GADD45B",
          GA45G: "GADD45G",
          GBB1: "GNB1",
          GBB3: "GNB3",
          GBB5: "GNB5",
          GBG1: "GNGT1",
          GBG2: "GNG2",
          GBGT2: "GNGT2",
          GCR: "NR3C1",
          GDIA: "GDI1",
          GDIR1: "ARHGDIA",
          GDIR2: "ARHGDIB",
          GDIR3: "ARHGDIG",
          GDS1: "RAP1GDS1",
          GELS: "GSN",
          GLHA: "CGA",
          GLO2: "HAGH",
          GLUC: "GCG",
          GLYC: "SHMT1",
          GNAO: "GNAO1",
          GNDS: "RALGDS",
          GNPTA: "GNPTAB",
          GOGA2: "GOLGA2",
          GON1: "GNRH1",
          GORS1: "GORASP1",
          GP124: "GPR124",
          GPAT1: "GPAM",
          GRAA: "GZMA",
          GRAB: "GZMB",
          GRAM4: "GRAMD4",
          GROA: "CXCL1",
          GRP1: "RASGRP1",
          GRP2: "RASGRP2",
          GRP3: "RASGRP3",
          GRP4: "RASGRP4",
          GRP78: "HSPA5",
          GTR1: "SLC2A1",
          GTR2: "SLC2A2",
          GTR3: "SLC2A3",
          GTR4: "SLC2A4",
          GUC1A: "GUCA1A",
          GUC1B: "GUCA1B",
          GUC1C: "GUCA1C",
          GUC2D: "GUCY2D",
          GUC2F: "GUCY2F",
          H14: "HIST1H1E",
          H2A2C: "HIST2H2AC",
          H2AX: "H2AFX",
          H2AY: "H2AFY",
          H2AZ: "H2AFZ",
          H2B1A: "HIST1H2BA",
          H2B2E: "HIST2H2BE",
          H32: "HIST2H3A",
          H33: "H3F3A",
          H4: "HIST1H4A",
          HAKAI: "CBLL1",
          HCDH: "HADH",
          HD: "HTT",
          HDA10: "HDAC10",
          HDA11: "HDAC11",
          HEM1: "ALAS1",
          HEMH: "FECH",
          HG2A: "CD74",
          HGFL: "MST1",
          HIF1N: "HIF1AN",
          HMCS1: "HMGCS1",
          HMCS2: "HMGCS2",
          HNF6: "ONECUT1",
          HNRPC: "HNRNPC",
          HS90A: "HSP90AA1",
          HS90B: "HSP90AB1",
          HSP74: "HSPA4",
          HSP7C: "HSPA8",
          HXA10: "HOXA10",
          HXB13: "HOXB13",
          HXK1: "HK1",
          HXK2: "HK2",
          HXK4: "GCK",
          I12R1: "IL12RB1",
          I12R2: "IL12RB2",
          I13R1: "IL13RA1",
          I13R2: "IL13RA2",
          I18RA: "IL18RAP",
          I27RA: "IL27RA",
          IASPP: "PPP1R13L",
          IBP1: "IGFBP1",
          IBP3: "IGFBP3",
          ICEF1: "IPCEF1",
          IF172: "IFT172",
          IF2A: "EIF2S1",
          IF2B1: "IGF2BP1",
          IF4A1: "EIF4A1",
          IF4B: "EIF4B",
          IF4E: "EIF4E",
          IF4G1: "EIF4G1",
          IFN10: "IFNA10",
          IFN14: "IFNA14",
          IFN16: "IFNA16",
          IFN17: "IFNA17",
          IFN21: "IFNA21",
          IFNB: "IFNB1",
          IGHA1: "IGHA1",
          IGHE: "IGHE",
          IGHG1: "IGHG1",
          IGHG3: "IGHG3",
          IKBA: "NFKBIA",
          IKBB: "NFKBIB",
          IKKA: "CHUK",
          IKKB: "IKBKB",
          IL17: "IL17A",
          IL18R: "IL18R1",
          IL1AP: "IL1RAP",
          IL1RA: "IL1RN",
          IL27A: "IL27",
          IL27B: "EBI3",
          IL3RB: "CSF2RB",
          IL4RA: "IL4R",
          IL6RA: "IL6R",
          IL6RB: "IL6ST",
          IL8: "CXCL8",
          IMA1: "KPNA2",
          IMA5: "KPNA1",
          IMB1: "KPNB1",
          INAR1: "IFNAR1",
          INAR2: "IFNAR2",
          INCE: "INCENP",
          INGR1: "IFNGR1",
          INVO: "IVL",
          IQEC1: "IQSEC1",
          IQGA1: "IQGAP1",
          IQGA3: "IQGAP3",
          ITA1: "ITGA1",
          ITA10: "ITGA10",
          ITA11: "ITGA11",
          ITA2: "ITGA2",
          ITA2B: "ITGA2B",
          ITA3: "ITGA3",
          ITA4: "ITGA4",
          ITA5: "ITGA5",
          ITA6: "ITGA6",
          ITA7: "ITGA7",
          ITA8: "ITGA8",
          ITA9: "ITGA9",
          ITAD: "ITGAD",
          ITAE: "ITGAE",
          ITAL: "ITGAL",
          ITAM: "ITGAM",
          ITAV: "ITGAV",
          ITAX: "ITGAX",
          ITB1: "ITGB1",
          ITB2: "ITGB2",
          ITB3: "ITGB3",
          ITB4: "ITGB4",
          ITB5: "ITGB5",
          ITB6: "ITGB6",
          ITB7: "ITGB7",
          ITB8: "ITGB8",
          ITF2: "TCF4",
          JAM1: "F11R",
          JAML1: "AMICA1",
          JIP3: "MAPK8IP3",
          JIP4: "SPAG9",
          JUNB: "JUNB",
          K1C14: "KRT14",
          K1C17: "KRT17",
          K1C18: "KRT18",
          K1C19: "KRT19",
          K2C1: "KRT1",
          K2C5: "KRT5",
          K2C8: "KRT8",
          KAISO: "ZBTB33",
          KAP0: "PRKAR1A",
          KAP1: "PRKAR1B",
          KAPCA: "PRKACA",
          KAPCB: "PRKACB",
          KAPCG: "PRKACG",
          KC1A: "CSNK1A1",
          KC1D: "CSNK1D",
          KC1E: "CSNK1E",
          KC1G1: "CSNK1G1",
          KC1G2: "CSNK1G2",
          KC1G3: "CSNK1G3",
          KCC2A: "CAMK2A",
          KCC2B: "CAMK2B",
          KCC2D: "CAMK2D",
          KCC2G: "CAMK2G",
          KCC4: "CAMK4",
          KCIP4: "KCNIP4",
          KCJ11: "KCNJ11",
          KCJ15: "KCNJ15",
          KCRM: "CKM",
          KDIS: "KIDINS220",
          KGP1: "PRKG1",
          KI13B: "KIF13B",
          KI20A: "KIF20A",
          KI3L1: "KIR3DL1",
          KINH: "KIF5B",
          KIRR1: "KIRREL",
          KITH: "TK1",
          KKCC2: "CAMKK2",
          KLH12: "KLHL12",
          KLH13: "KLHL13",
          KLH20: "KLHL20",
          KLOT: "KL",
          KLOTB: "KLB",
          KPCA: "PRKCA",
          KPCB: "PRKCB",
          KPCD: "PRKCD",
          KPCD1: "PRKD1",
          KPCE: "PRKCE",
          KPCG: "PRKCG",
          KPCI: "PRKCI",
          KPCL: "PRKCH",
          KPCT: "PRKCQ",
          KPCZ: "PRKCZ",
          KPYM: "PKM",
          KPYR: "PKLR",
          KREM2: "KREMEN2",
          KS6A1: "RPS6KA1",
          KS6A3: "RPS6KA3",
          KS6A4: "RPS6KA4",
          KS6A5: "RPS6KA5",
          KS6B1: "RPS6KB1",
          KSYK: "SYK",
          KTNA1: "KATNA1 ",
          LAT: "LAT",
          LCAP: "LNPEP",
          LEG1: "LGALS1",
          LEG3: "LGALS3",
          LFG2: "FAIM2",
          LIGO1: "LINGO1",
          LIPL: "LPL",
          LIS1: "PAFAH1B1 ",
          LN28B: "LIN28B",
          LOX15: "ALOX15",
          LSHR: "LHCGR",
          LST2: "ZFYVE28",
          LST8: "MLST8",
          LX12B: "ALOX12B",
          LYAG: "GAA",
          LYAM2: "SELE",
          LYAM3: "SELP",
          LYRIC: "MTDH",
          LYSC: "LYZ",
          M3K1: "MAP3K1",
          M3K10: "MAP3K10",
          M3K11: "MAP3K11 ",
          M3K12: "MAP3K12",
          M3K14: "MAP3K14",
          M3K2: "MAP3K2",
          M3K3: "MAP3K3",
          M3K4: "MAP3K4",
          M3K5: "MAP3K5",
          M3K6: "MAP3K6",
          M3K7: "MAP3K7",
          M3K8: "MAP3K8",
          M4K1: "MAP4K1",
          M4K2: "MAP4K2",
          M4K3: "MAP4K3",
          M4K4: "MAP4K4",
          M4K5: "MAP4K5",
          MAD1: "MXD1",
          MAD4: "MXD4",
          MADCA: "MADCAM1",
          MAGD1: "MAGED1",
          MAGH1: "MAGEH1",
          MAPK2: "MAPKAPK2",
          MAPK3: "MAPKAPK3",
          MAPK5: "MAPKAPK5",
          MARE1: "MAPRE1",
          MAT1: "MNAT1",
          MB3L2: "MBD3L2",
          MD1L1: "MAD1L1",
          MD2BP: "MAD2L1BP",
          MDR1: "ABCB1",
          MEP50: "WDR77",
          MERL: "NF2",
          METK2: "MAT2A",
          MFGM: "MFGE8",
          MIEAP: "SPATA18",
          MIMIT: "NDUFAF2",
          MINA: "MINA ",
          MINT: "SPEN",
          MIS: "AMH",
          MK: "MDK",
          MK01: "MAPK1",
          MK03: "MAPK3",
          MK07: "MAPK7",
          MK08: "MAPK8",
          MK09: "MAPK9",
          MK10: "MAPK10",
          MK11: "MAPK11",
          MK12: "MAPK12",
          MK13: "MAPK13",
          MK14: "MAPK14",
          MLRS: "MYLPF ",
          MLRV: "MYL2 ",
          MLTK: "ZAK",
          MOES: "MSN",
          MP2K1: "MAP2K1",
          MP2K2: "MAP2K2",
          MP2K3: "MAP2K3",
          MP2K4: "MAP2K4",
          MP2K5: "MAP2K5",
          MP2K6: "MAP2K6",
          MP2K7: "MAP2K7",
          MPCP: "SLC25A3",
          MPIP1: "CDC25A",
          MPIP2: "CDC25B",
          MPIP3: "CDC25C",
          MRCKA: "CDC42BPA ",
          MRP1: "ABCC1",
          MT2: "MT2A",
          MTAP2: "MAP2",
          MTG16: "CBFA2T3",
          MYBA: "MYBL1",
          MYBB: "MYBL2",
          MYCD: "MYOCD",
          MYPT1: "PPP1R12A",
          NCKP1: "NCKAP1",
          NCKX1: "SLC24A1",
          NCKX2: "SLC24A2",
          NDKA: "NME1",
          NDKB: "NME2",
          NDUS2: "NDUFS2",
          NDUV3: "NDUFV3",
          NECD: "NDN",
          NED4L: "NEDD4L",
          NEMO: "IKBKG",
          NET1: "NTN1",
          NEUL1: "NEURL1",
          NEUM: "GAP43",
          NEUS: "SERPINI1",
          NEUT: "NTS",
          NFAC1: "NFATC1",
          NFAC2: "NFATC2",
          NFAC3: "NFATC3",
          NFAC4: "NFATC4",
          NGN1: "NEUROG1",
          NGN3: "NEUROG3",
          NHRF1: "SLC9A3R1",
          NHRF2: "SLC9A3R2",
          NICA: "NCSTN",
          NKG2E: "KLRC3",
          NKX21: "NKX2-1 ",
          NKX25: "NKX2-5",
          NKX31: "NKX3-1",
          NMDE1: "GRIN2A",
          NMDE2: "GRIN2B",
          NOGG: "NOG",
          NOTC1: "NOTCH1",
          NOTC2: "NOTCH2 ",
          NOTC3: "NOTCH3",
          NOTC4: "NOTCH4",
          NPHN: "NPHS1",
          NPM: "NPM1",
          NRAM1: "SLC11A1",
          NRAM2: "SLC11A2",
          NSMA: "SMPD2",
          NSMA2: "SMPD3",
          NTAL: "LAT2",
          NTF2: "NUTF2",
          NU153: "NUP153",
          NU214: "NUP214",
          NUCL: "NCL",
          ODFP2: "ODF2",
          OMGP: "OMG",
          ONCM: "OSM",
          OPRM: "OPRM1",
          OPSD: "RHO",
          OPSG: "OPN1MW ",
          OSTCN: "BGLAP",
          OSTP: "SPP1",
          P2R3B: "PPP2R3B",
          P3C2A: "PIK3C2A",
          P3C2B: "PIK3C2B",
          P4K2A: "PI4K2A",
          P53: "TP53",
          P63: "TP63",
          P66A: "GATAD2A",
          P66B: "GATAD2B",
          P73: "TP73",
          P85A: "PIK3R1",
          PA1B2: "PAFAH1B2",
          PA1B3: "PAFAH1B3",
          PA21B: "PLA2G1B",
          PA24A: "PLA2G4A",
          PA2GA: "PLA2G2A",
          PAFA: "PLA2G7",
          PAI1: "SERPINE1",
          PAPOA: "PAPOLA",
          PAR1: "F2R",
          PAR14: "PARP14",
          PAR3: "F2RL2",
          PAR4: "F2RL3",
          PAR6A: "PARD6A",
          PAXI: "PXN",
          PCKGC: "PCK1 ",
          PCKGM: "PCK2",
          PD2R: "PTGDR",
          PDC10: "PDCD10",
          PDIP3: "POLDIP3",
          PDLI7: "PDLIM7",
          PEBB: "CBFB",
          PECA1: "PECAM1",
          PEN2: "PSENEN",
          PERF: "PRF1",
          PERM: "MPO",
          PFD5: "PFDN5",
          PFKAL: "PFKL",
          PFKAM: "PFKM",
          PGES2: "PTGES2",
          PGFRA: "PDGFRA",
          PGFRB: "PDGFRB",
          PGH2: "PTGS2",
          PGS1: "BGN",
          PGS2: "DCN",
          PGTA: "RABGGTA",
          PGTB2: "RABGGTB",
          PHAG1: "PAG1",
          PHLD: "GPLD1",
          PI2R: "PTGIR",
          PI3R6: "PIK3R6",
          PI51A: "PIP5K1A",
          PI51B: "PIP5K1B",
          PI51C: "PIP5K1C",
          PIPNA: "PITPNA",
          PIT1: "POU1F1",
          PK3CA: "PIK3CA",
          PK3CB: "PIK3CB",
          PK3CG: "PIK3CG",
          PKHA1: "PLEKHA1",
          PKHA2: "PLEKHA2",
          PKHA7: "PLEKHA7",
          PKHG6: "PLEKHG6",
          PLAK: "JUP",
          PLF4: "PF4",
          PLGF: "PGF",
          PLMN: "PLG",
          PLXD1: "PLXND1",
          PO210: "NUP210",
          PO2F1: "POU2F1",
          PO2F2: "POU2F2",
          PO4F1: "POU4F1",
          PO4F2: "POU4F2",
          PO5F1: "POU5F1",
          PODO: "NPHS2",
          POTE1: "POT1",
          PP14A: "PPP1R14A",
          PP14B: "PPP1R14B",
          PP14C: "PPP1R14C",
          PP1A: "PPP1CA",
          PP1B: "PPP1CB",
          PP1G: "PPP1CC",
          PP2AA: "PPP2CA",
          PP2AB: "PPP2CB",
          PP2BA: "PPP3CA",
          PP2BB: "PPP3CB",
          PP2BC: "PPP3CC",
          PPAC: "ACP1",
          PPP5: "PPP5C",
          PPR3A: "PPP1R3A",
          PR15A: "PPP1R15A",
          PRD15: "PRDM15",
          PRGC1: "PPARGC1A",
          PRGR: "PGR",
          PRIO: "PRNP",
          PRKN2: "PARK2",
          PSA3: "PSMA3",
          PSD1: "PSD",
          PSN1: "PSEN1",
          PSN2: "PSEN2",
          PTC1: "PTCH1",
          PTC2: "PTCH2",
          PTEN: "PTEN",
          PTHR: "PTHLH",
          PTN1: "PTPN1",
          PTN11: "PTPN11",
          PTN13: "PTPN13",
          PTN2: "PTPN2",
          PTN21: "PTPN21",
          PTN6: "PTPN6",
          PTN7: "PTPN7",
          PVRL1: "PVRL1",
          PVRL2: "PVRL2",
          PVRL3: "PVRL3",
          PYR1: "CAD",
          QORX: "TP53I3",
          R144B: "RNF144B",
          R9BP: "RGS9BP",
          RABX5: "RABGEF1",
          RAD: "RRAD",
          RADI: "RDX",
          RAGE: "AGER",
          RAGP1: "RANGAP1",
          RANB3: "RANBP3",
          RANB9: "RANBP9",
          RANG: "RANBP1",
          RASF1: "RASSF1 ",
          RASF5: "RASSF5",
          RASH: "HRAS",
          RASK: "KRAS",
          RASL1: "RASAL1 ",
          RASL2: "RASA4",
          RASN: "NRAS",
          RB: "RB1",
          RB11A: "RAB11A",
          RB6I2: "ERC1",
          RBCC1: "RB1CC1",
          RBGPR: "RAB3GAP2",
          RBP1: "RALBP1",
          RBP10: "RANBP10",
          RBP2: "RANBP2",
          RCAS1: "EBAG9",
          RDH1: "RDH5",
          RET1: "RBP1",
          RET2: "RBP2",
          RETNB: "RETNLB",
          RFA1: "RPA1",
          RFA2: "RPA2",
          RFIP3: "RAB11FIP3",
          RFXK: "RFXANK",
          RGAP1: "RACGAP1 ",
          RGMC: "HFE2",
          RGRF1: "RASGRF1",
          RGRF2: "RASGRF2",
          RHG01: "ARHGAP1",
          RHG04: "ARHGAP4",
          RHG05: "ARHGAP5",
          RHG06: "ARHGAP6",
          RHG07: "DLC1",
          RHG08: "ARHGAP8",
          RHG09: "ARHGAP9",
          RHG10: "ARHGAP10",
          RHG17: "ARHGAP17",
          RHG26: "ARHGAP26",
          RHG32: "ARHGAP32",
          RHG35: "ARHGAP35",
          RICTR: "RICTOR ",
          RIR1: "RRM1",
          RIR2: "RRM2",
          RIR2B: "RRM2B",
          RK: "GRK1",
          RL11: "RPL11",
          RL23: "RPL23",
          RL5: "RPL5",
          RN111: "RNF111",
          RN128: "RNF128",
          RN187: "RNF187",
          RNC: "DROSHA",
          ROA1: "HNRNPA1",
          RON: "MST1R",
          RPC4: "POLR3D",
          RPGF1: "RAPGEF1",
          RS27L: "RPS27L ",
          RS6: "RPS6",
          RT29: "DAP3",
          RUVB1: "RUVBL1",
          RUVB2: "RUVBL2",
          S10A2: "S100A2",
          S10A7: "S100A7",
          S10A8: "S100A8",
          S10A9: "S100A9",
          S11IP: "STK11IP",
          S14L2: "SEC14L2",
          SAFB1: "SAFB",
          SC6A3: "SLC6A3",
          SCAM2: "SCAMP2",
          SCF: "KITLG",
          SCNNA: "SCNN1A",
          SDCB1: "SDCBP",
          SDF1: "CXCL12",
          SDOS: "NUDT16L1",
          SELPL: "SELPLG",
          SEM3C: "SEMA3C",
          SEM3E: "SEMA3E",
          SEM4A: "SEMA4A",
          SETB1: "SETDB1",
          SETD8: "SETD8",
          SFPA2: "SFTPA2",
          SFTA1: "SFTPA1",
          SGOL1: "SGOL1",
          SH21A: "SH2D1A",
          SH22A: "SH2D2A",
          SH3G1: "SH3GL1",
          SH3G2: "SH3GL2",
          SH3K1: "SH3KBP1",
          SHAN3: "SHANK3",
          SHIP1: "INPP5D",
          SHIP2: "INPPL1",
          SIAL: "IBSP",
          SIN1: "MAPKAP1",
          SIR1: "SIRT1",
          SIR2: "SIRT2",
          SIR3: "SIRT3",
          SIR4: "SIRT4 ",
          SIR5: "SIRT5 ",
          SIR6: "SIRT6",
          SIR7: "SIRT7",
          SL9A1: "SLC9A1",
          SL9A3: "SLC9A3 ",
          SLAP1: "SLA",
          SLAP2: "SLA2",
          SMAL1: "SMARCAL1",
          SMCA2: "SMARCA2 ",
          SMCA4: "SMARCA4",
          SMCE1: "SMARCE1",
          SMRC1: "SMARCC1",
          SMRC2: "SMARCC2",
          SMRD1: "SMARCD1 ",
          SMRD3: "SMARCD3",
          SMS1: "SGMS1",
          SMUF1: "SMURF1",
          SMUF2: "SMURF2",
          SNCAP: "SNCAIP",
          SNF5: "SMARCB1",
          SNP25: "SNAP25",
          SODC: "SOD1",
          SODM: "SOD2",
          SORT: "SORT1",
          SOSD1: "SOSTDC1",
          SPB5: "SERPINB5",
          SPRE1: "SPRED1",
          SPRE2: "SPRED2",
          SPT13: "SPATA13",
          SPTB2: "SPTBN1",
          SPTN1: "SPTAN1",
          SPY2: "SPRY2",
          SQSTM: "SQSTM1",
          SRBP1: "SREBF1",
          SRBS1: "SORBS1 ",
          SRC8: "CTTN",
          SRGP1: "SRGAP1",
          SRP09: "SRP9",
          ST2A1: "SULT2A1",
          ST65G: "SUPT7L",
          STA5A: "STAT5A",
          STA5B: "STAT5B",
          STABP: "STAMBP",
          STAM1: "STAM",
          STEA3: "STEAP3",
          STRAA: "STRADA",
          STRAB: "STRADB",
          STXB1: "STXBP1",
          STXB4: "STXBP4",
          SUH: "RBPJ",
          SUPT3: "SUPT3H",
          SUV91: "SUV39H1",
          SV421: "SUV420H1",
          SYGP1: "SYNGAP1",
          SYUA: "SNCA",
          Src: "SRC",
          T126A: "TMEM126A",
          T53I1: "TP53INP1",
          TA2R: "TBXA2R",
          TAD2B: "TADA2B",
          TAGL: "TAGLN",
          TAU: "MAPT",
          TBA1A: "TUBA1A",
          TBA1B: "TUBA1B",
          TBB2A: "TUBB2A",
          TBCD4: "TBC1D4",
          TBG1: "TUBG1",
          TBL1R: "TBL1XR1",
          TCA: "TRAC",
          TCAM1: "TICAM1",
          TCAM2: "TICAM2",
          TCTP: "TPT1",
          TDT: "DNTT",
          TE2IP: "TERF2IP",
          TEBP: "PTGES3",
          TEFF2: "TMEFF2",
          TENA: "TNC",
          TENS1: "TNS1",
          TF2H2: "GTF2H2",
          TF3A: "GTF3A",
          TF65: "RELA",
          TF7L1: "TCF7L1",
          TF7L2: "TCF7L2",
          TFE2: "TCF3",
          TFPI1: "TFPI",
          TFR1: "TFRC",
          TGBR3: "TGFBR3",
          TGFA1: "TGFBRAP1",
          TGFI1: "TGFB1I1",
          TGFR1: "TGFBR1",
          TGFR2: "TGFBR2",
          THA: "THRA",
          THB: "THRB",
          THIO: "TXN",
          THRB: "F2",
          TIE2: "TEK",
          TIF1A: "TRIM24",
          TIF1B: "TRIM28",
          TIM: "TIMELESS ",
          TISB: "ZFP36L1",
          TMPS2: "TMPRSS2",
          TNAP3: "TNFAIP3",
          TNF10: "TNFSF10",
          TNF11: "TNFSF11",
          TNFA: "TNF",
          TNFB: "LTA",
          TNFL6: "FASLG",
          TNKS1: "TNKS",
          TNR16: "NGFR",
          TNR18: "TNFRSF18",
          TNR1A: "TNFRSF1A",
          TNR1B: "TNFRSF1B",
          TNR4: "TNFRSF4",
          TNR5: "CD40",
          TNR6: "FAS",
          TNR9: "TNFRSF9",
          TOLIP: "TOLLIP",
          TOPB1: "TOPBP1",
          TP4A1: "PTP4A1",
          TP4A2: "PTP4A2",
          TP4A3: "PTP4A3",
          TP53B: "TP53BP1",
          TPA: "PLAT",
          TPIP1: "TP53AIP1",
          TPPC4: "TRAPPC4",
          TR10A: "TNFRSF10A",
          TR10B: "TNFRSF10B",
          TR10C: "TNFRSF10C",
          TR10D: "TNFRSF10D",
          TR13B: "TNFRSF13B",
          TRBC1: "TRBC1",
          TRBM: "THBD",
          TRDC: "TRDC",
          TRFE: "TF",
          TRI59: "TRIM59",
          TRIA1: "TRIAP1",
          TS101: "TSG101",
          TSP1: "THBS1",
          TSP2: "THBS2",
          TTHY: "TTR",
          TTP: "ZFP36",
          TWST1: "TWIST1",
          TY3H: "TH",
          TYDP2: "TDP2",
          TYSY: "TYMS",
          TYY1: "YY1",
          UB2D1: "UBE2D1",
          UB2D2: "UBE2D2",
          UB2D3: "UBE2D3",
          UB2L3: "UBE2L3",
          UB2V1: "UBE2V1",
          UBC12: "UBE2M",
          UBC9: "UBE2I",
          UBF1: "UBTF",
          UBP1: "USP1",
          UBP6: "USP6",
          UBP7: "USP7",
          UBP8: "USP8",
          UBQL1: "UBQLN1",
          UFO: "AXL",
          UN13B: "UNC13B",
          UPAR: "PLAUR",
          UROK: "PLAU",
          US6NL: "USP6NL",
          UTER: "SCGB1A1",
          VAV: "VAV1",
          VGFR1: "FLT1",
          VGFR2: "KDR",
          VGFR3: "FLT4",
          VIME: "VIM",
          VINC: "VCL",
          VTNC: "VTN",
          WASP: "WAS",
          X3CL1: "CX3CL1",
          XPO2: "CSE1L",
          YBOX1: "YBX1",
          YES: "YES1",
          YETS4: "YEATS4",
          Z385A: "ZNF385A",
          ZBT17: "ZBTB17",
          ZCH12: "ZCCHC12",
          ZFAN5: "ZFAND5",
          ZFY16: "ZFYVE16",
          ZFYV9: "ZFYVE9",
          ZN274: "ZNF274",
          ZN318: "ZNF318",
          ZN363: "RCHY1",
          ZO1: "TJP1",
          ZO2: "TJP2",
        };
        var nodes = asCXResponse[5]["nodes"];
        for (var i = 0; i < nodes.length; i++) {
          var uniprot = nodes[i]["n"].replace("_HUMAN", "");
          var hugo = ndex_prot_hugo_dic[uniprot];
          if (hugo != undefined) {
            nodes[i]["n"] = hugo;
          }
        }

        var networkInfo = enrichmentScores[networkUUID];
        var genesInTheOverlap = Object.keys(networkInfo["overlap"]);

        // response is a CX network
        // First convert it to niceCX to make it easy to update attributes
        var niceCX = CxCyUtils.rawCXtoNiceCX(asCXResponse);
        var overlapNodes = [];
        for (var i = 0; i < genesInTheOverlap.length; i++) {
          var geneInTheOverlap = genesInTheOverlap[i];
          var nodeId = niceCX.nodeidofgene[geneInTheOverlap];
          overlapNodes.push(nodeId);
        }
        var networkName = null;
        var networkProperties = null;
        if (niceCX && niceCX["networkAttributes"]) {
          var networkNameNetworkProperties = extractNetworkProperties(
            niceCX["networkAttributes"]
          );
          networkName = networkNameNetworkProperties[0];
          networkProperties = networkNameNetworkProperties[1];
        }
        // add 'inQuery' : 'true' to nodes that link to terms (genes) in the enrichment query
        for (var i = 0; i < overlapNodes.length; i++) {
          var nodeId = overlapNodes[i];
          CxCyUtils.setNodeAttribute(niceCX, nodeId, "inQuery", "true");
        }

        var attributeNameMap = {};

        var cyElements = CxCyUtils.cyElementsFromNiceCX(
          niceCX,
          attributeNameMap
        );

        var layoutName = "cose";

        if (CxCyUtils.allNodesHaveUniquePositions(cyElements)) {
          layoutName = "preset";
        }

        var cyLayout = { name: layoutName };

        self.networkDiv.innerHTML = "";
        self.cy = cytoscape({
          container: self.networkDiv,
          style: CxCyUtils.getCravatVisualizeStyle(),
          layout: cyLayout,
          elements: cyElements,
          wheelSensitivity: 0.2,
        });
        cytoscape_instance = self.cy;

        // Legend
        var innerLegendDiv = CxCyUtils.getInnerLegendDiv(cyElements);
        self.legendDiv.innerHTML = "";
        addEl(self.legendDiv, innerLegendDiv);
      }

      function extractNetworkProperties(properties) {
        var networkName = null;
        var netProperties = [];
        if (!properties || !properties.elements) {
          return netProperties;
        }
        for (var i = 0; i < properties.elements.length; i++) {
          var prop = properties.elements[i];
          if (prop.n.toLowerCase() === "name") {
            networkName = prop.v;
          }
          if (prop.v) {
            netProperties.push(prop);
          }
        }
        return [networkName, netProperties];
      }

      var CxCyUtils = (function () {
        var CRAVAT_VISUAL_STYLE = [
          {
            selector: "node",
            css: {
              "background-color": "rgb(200,200,200)",
              "text-opacity": 1,
              "font-size": 10,
              "border-width": 2.5,
              color: "rgb(0,0,0)",
              width: "35.0",
              shape: "roundrectangle",
              "border-opacity": 1,
              "border-color": "rgb(180,180,180)",
              height: "35.0",
              "background-opacity": 1,
              "text-valign": "center",
              "text-halign": "center",
              "font-family": "monospace",
              "font-weight": "plain",
            },
          },
          {
            selector: "node[name]",
            css: {
              content: "data(name)",
            },
          },
          {
            selector: "node[type = 'Small Molecule']",
            css: {
              "background-color": "rgb(255,153,0)",
              "border-color": "rgb(255,153,9)",
            },
          },
          {
            selector: "node[type = 'SmallMolecule']",
            css: {
              "background-color": "rgb(255,153,0)",
              "border-color": "rgb(255,153,0)",
            },
          },
          {
            selector: "node[type = 'Small Molecule']",
            css: {
              shape: "octagon",
            },
          },
          {
            selector: "node[type = 'SmallMolecule']",
            css: {
              shape: "octagon",
            },
          },
          {
            selector: "node[type = 'Protein']",
            css: {
              shape: "ellipse",
            },
          },
          {
            selector: "node[inQuery = 'true']",
            css: {
              "background-color": "rgb(255, 50, 70)",
              "border-color": "rgb(186, 37, 52)",
            },
          },
          {
            selector: "node:selected",
            css: {
              "background-color": "rgb(239, 62, 192)",
              "border-color": "rgb(140, 37, 112)",
            },
          },
          {
            selector: "edge",
            css: {
              "font-size": 10,
              "line-style": "dashed",
              "target-arrow-shape": "none",
              color: "rgb(240,240,240)",
              width: 1,
              "source-arrow-shape": "none",
              "text-opacity": 1,
              opacity: 1,
            },
          },
          {
            selector: "edge[directed = 'true']",
            css: {
              "target-arrow-shape": "triangle",
              "line-style": "solid",
            },
          },
          {
            selector: "edge[directed = 'false']",
            css: {
              "line-style": "dashed",
            },
          },
          {
            selector: "edge:selected",
            css: {
              "line-color": "rgb(239, 62, 192)",
              "source-arrow-color": "rgb(239, 62, 192)",
              "target-arrow-color": "rgb(239, 62, 192)",
            },
          },
        ];
        var ndexEdgeInteractionColorScheme = {
          default: { color: "rgb(240,240,240)" },

          "controls-expression-of": { color: "rgb(255,182,0)" },
          "controls-phosphorylation-of": { color: "rgb(152, 0, 255)" },
          "controls-state-change-of": { color: "rgb(195, 159, 224)" },
          "reacts-with": { color: "rgb(216, 199, 229)" },
          "interacts-with": { color: "rgb(216, 199, 229)" },
          "interacts with": { color: "rgb(216, 199, 229)" },

          "controls-transport-of": { color: "rgb(168, 224, 223)" },
          "controls-transport-of-chemical": { color: "rgb(206, 206, 194)" },

          "consumption-controled-by": { color: "rgb(168, 224, 223)" },

          "chemical-affects": { color: "rgb(206, 206, 194)" },
          "catalysis-precedes": { color: "rgb(206, 206, 194)" },
          "used-to-produce": { color: "rgb(206, 206, 194)" },
          "controls-production-of": { color: "rgb(156, 183, 181)" },

          "in-complex-with": { color: "rgb(168, 244, 184)" },
          "neighbor-of": { color: "rgb(212, 244, 219)" },

          selected: { color: "rgb(239, 62, 192)" },
        };
        var css = {};
        var color = ndexEdgeInteractionColorScheme["default"]["color"];
        css["line-color"] = color;
        css["source-arrow-color"] = color;
        css["target-arrow-color"] = color;
        CRAVAT_VISUAL_STYLE.push({ selector: "edge", css: css });
        var interactions = Object.keys(ndexEdgeInteractionColorScheme);
        for (var i = 0; i < interactions.length; i++) {
          var interaction = interactions[i];
          var edgeInteractionCss = {};
          if (interaction == "default") {
            continue;
          } else if (interaction == "selected") {
            edgeInteractionCss["selector"] = "edge:" + interaction;
          } else {
            edgeInteractionCss["selector"] =
              'edge[interaction="' + interaction + '"]';
          }
          var color = ndexEdgeInteractionColorScheme[interaction]["color"];
          edgeInteractionCss["css"] = {};
          edgeInteractionCss["css"]["line-color"] = color;
          edgeInteractionCss["css"]["source-arrow-color"] = color;
          edgeInteractionCss["css"]["target-arrow-color"] = color;
          CRAVAT_VISUAL_STYLE.push(edgeInteractionCss);
        }

        var handleCxElement = function (aspectName, element, niceCX) {
          var aspect = niceCX[aspectName];
          if (aspectName === "nodeAttributes") {
            if (!aspect) {
              aspect = { nodes: {} };
              niceCX[aspectName] = aspect;
            }
            var nodeMap = aspect.nodes;
            var attributes = nodeMap[element.po];
            if (!attributes) {
              attributes = {};
              nodeMap[element.po] = attributes;
            }
            attributes[element.n] = { v: element.v, d: element.d };
          } else {
            // opaque for now
            if (!aspect) {
              // add aspect to niceCX
              aspect = { elements: [] };
              niceCX[aspectName] = aspect;
            }
            var elementList = aspect.elements;
            elementList.push(element);
          }
        };

        var getCyAttributeName = function (attributeName, attributeNameMap) {
          var cyAttributeName = attributeNameMap[attributeName];
          if (!cyAttributeName) {
            attributeNameMap[attributeName] = attributeName; // direct mapping
            cyAttributeName = attributeName;
          }
          return cyAttributeName;
        };

        //Public
        var publicFn = {};

        publicFn.getCravatVisualizeStyle = function () {
          return CRAVAT_VISUAL_STYLE;
        };

        publicFn.rawCXtoNiceCX = function (rawCX) {
          var niceCX = {};
          for (var i = 0; i < rawCX.length; i++) {
            var fragment = rawCX[i];
            if (fragment) {
              var aspectName;
              for (aspectName in fragment) {
                var elements = fragment[aspectName];
                if (aspectName === "numberVerification") {
                  if (!niceCX.numberVerification) {
                    niceCX.numberVerification = fragment;
                  }
                  continue;
                } else if (aspectName === "status") {
                  if (!niceCX.status) {
                    niceCX.status = fragment;
                  }
                  continue;
                } else if (aspectName === "metaData") {
                  if (!niceCX.preMetaData) {
                    niceCX.preMetaData = fragment;
                  } else if (!niceCX.postMetaData) {
                    niceCX.postMetaData = fragment;
                  }
                  continue;
                }
                for (var j = 0; j < elements.length; j++) {
                  var element = elements[j];
                  handleCxElement(aspectName, element, niceCX);
                }
              }
            }
          }
          niceCX["nodeidofgene"] = {};
          for (var i = 0; i < niceCX.nodes.elements.length; i++) {
            var node = niceCX.nodes.elements[i];
            niceCX["nodeidofgene"][node.n.replace(/_HUMAN/g, "")] = node["@id"];
          }
          return niceCX;
        };

        publicFn.setNodeAttribute = function (
          niceCX,
          nodeId,
          attributeName,
          attributeValue,
          attributeDataType
        ) {
          if (!attributeName || !attributeValue) {
            return;
          }
          var attributeObject = { v: attributeValue };
          if (attributeDataType) {
            attributeObject.d = attributeDataType;
          }
          if (!niceCX.nodeAttributes.nodes[nodeId]) {
            niceCX.nodeAttributes.nodes[nodeId] = {};
          }
          niceCX.nodeAttributes.nodes[nodeId][attributeName] = attributeObject;
        };

        publicFn.cyElementsFromNiceCX = function (niceCX, attributeNameMap) {
          var elements = {};
          var nodeList = [];
          var nodeMap = {};
          var edgeList = [];
          var edgeMap = {};

          elements.nodes = nodeList;
          elements.edges = edgeList;

          // handle node aspect
          if (niceCX.nodes) {
            niceCX.nodes.elements.forEach(function (nodeElement) {
              var cxNodeId = nodeElement["@id"];
              var nodeData = { id: cxNodeId };
              if (nodeElement.n) {
                nodeData["name"] = nodeElement.n.replace(/_HUMAN/g, "");
              }
              if (nodeElement.r) {
                nodeData.represents = nodeElement.r;
              }
              nodeMap[cxNodeId] = { data: nodeData };
            });
          }

          if (niceCX.nodeAttributes) {
            var nodeAttrs = niceCX.nodeAttributes.nodes;
            var nodeIds = Object.keys(nodeAttrs);
            for (var i = 0; i < nodeIds.length; i++) {
              var nodeId = nodeIds[i];
              var node = nodeMap[nodeId];
              if (node) {
                var attr = nodeAttrs[nodeId];
                node.data.type = attr.type.v;
                if ("inQuery" in attr) {
                  node.data.inQuery = nodeAttrs[nodeId].inQuery.v;
                }
              }
            }
          }

          // handle cartesianCoordinates aspect
          if (niceCX.cartesianLayout) {
            niceCX.cartesianLayout.elements.forEach(function (element) {
              var nodeId = element.node;
              var node = nodeMap[nodeId];
              node.position = { x: element.x, y: element.y };
            });
          }

          // handle edge aspect
          if (niceCX.edges) {
            niceCX.edges.elements.forEach(function (element) {
              var cxEdgeId = "e" + element["@id"];
              var edgeData = {
                id: cxEdgeId,
                source: element.s,
                target: element.t,
              };

              if (element.i) {
                edgeData.interaction = element.i;
              }

              edgeMap[cxEdgeId] = { data: edgeData };
            });
          }

          // handle edgeAttributes aspect
          // Note that edgeAttributes elements are just in a list in niceCX for the moment!!
          if (niceCX.edgeAttributes) {
            niceCX.edgeAttributes.elements.forEach(function (element) {
              var edgeId = "e" + element.po;
              var edge = edgeMap[edgeId];
              var cyAttributeName = getCyAttributeName(
                element.n,
                attributeNameMap
              );
              // todo: parse value according to datatype
              edge.data[cyAttributeName] = element.v;
            });
          }

          var nodeIds = Object.keys(nodeMap);
          for (var i = 0; i < nodeIds.length; i++) {
            nodeList.push(nodeMap[nodeIds[i]]);
          }

          var edgeIds = Object.keys(edgeMap);
          for (var i = 0; i < edgeIds.length; i++) {
            edgeList.push(edgeMap[edgeIds[i]]);
          }
          return elements;
        };

        publicFn.allNodesHaveUniquePositions = function (cyElements) {
          var nodePositionMap = {};
          var nodes = cyElements.nodes;
          for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            var node = nodes[nodeIndex];
            var position = node.position;
            if (!position) {
              // found a node without a position so we return false
              return false;
            }
            var positionKey = position.x + "_" + position.y;
            if (nodePositionMap[positionKey]) {
              // found a duplicate position so we return false
              return false;
            } else {
              // add this position to the map
              nodePositionMap[positionKey] = position;
            }
          }
          return true;
        };

        // Legend
        publicFn.getInnerLegendDiv = function (cyElements) {
          var addedInteractions = {};
          var div = getEl("div");
          div.style.padding = "4px";
          var edges = cyElements.edges;
          for (var i = 0; i < edges.length; i++) {
            var edge = edges[i].data;
            var directed = edge.directed;
            var interaction = edge.interaction;
            if (addedInteractions[interaction] != undefined) {
              continue;
            }
            var lineType = "dashed";
            if (directed == "true") {
              lineType = "solid";
            }
            var lineColor = ndexEdgeInteractionColorScheme["default"]["color"];
            if (ndexEdgeInteractionColorScheme[interaction] != undefined) {
              lineColor = ndexEdgeInteractionColorScheme[interaction]["color"];
            }
            var lineDiv = getEl("div");
            lineDiv.style.display = "inline-block";
            lineDiv.style.borderBottom = "3px " + lineType + " " + lineColor;
            lineDiv.style.position = "relative";
            lineDiv.style.top = "-2px";
            lineDiv.style.color = lineColor;
            lineDiv.style.width = "30px";
            lineDiv.style.padding = "4px";
            lineDiv.textContent = "    ";
            addEl(div, lineDiv);
            var spacerDiv = getEl("div");
            spacerDiv.style.display = "inline-block";
            spacerDiv.style.width = "6px";
            spacerDiv.textContent = " ";
            addEl(div, spacerDiv);
            addEl(div, getTn(interaction.replace(/-/g, " ")));
            addEl(div, getEl("br"));
            addedInteractions[interaction] = true;
          }
          return div;
        };

        return publicFn;
      })();
    },
  },
};
