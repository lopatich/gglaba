var widgetName = 'gosummary';
widgetGenerators[widgetName] = {
	'info': {
		'name': 'Gene Ontology',
		'width': 780, 
		'height': 280, 
		'callserver': true,
        'init': function (data) {
            this['variables']['data'] = data;
        },
        'shoulddraw': function () {
            if (this['variables']['data'] == undefined || this['variables']['data'].length == 0) {
                return false;
            } else {
                return true;
            }
        },
		'function': function (div, data) {
			if (div != null) {
				emptyElement(div);
			}
			if (data == undefined || data.length == 0) {
				return;
			}
			var colorPalette = [
				'#2166AC', 
				'#4393C3',
				'#92C5DE',
				'#D1E5F0',
				'#F7F7F7',
				'#FDDBC7',
				'#F4A582',
				'#D6604D',
				'#B2182B',
				'#762A83',
				'#9970AB',
				'#C2A5CF',
				'#E7D4E8',
				'#D9F0D3',
				'#ACD39E',
				'#5AAE61',
				'#1B7837',
				'#FFEE99',
			];
			div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);
			var x = [];
			var y = [];
			var maxY = 0;
			var colors = [];
			for (var i = 0; i < data.length; i++){
				var desc = data[i]['description'];
				var geneCount = data[i]['geneCount'];
				x.push(desc);
				y.push(geneCount);
				if (geneCount > maxY) {
					maxY = geneCount;
				}
				colors.push(colorPalette[i % colorPalette.length]);
			}
			var color = Chart.helpers.color;
			var chart = new Chart(chartDiv, {
				type: 'horizontalBar',
				data: {
					labels: x,
					datasets: [
						{
							data: y,
							backgroundColor: colors,
							borderColor: '#000000',
							borderWidth: 0.7,
							hoverBorderColor: '#aaaaaa'
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {display: false},
					scales: {
						xAxes: [{
							scaleLabel: {
								display: true,
								labelString: '# mutated genes from all samples',
							},
							ticks: {
								beginAtZero: true,
								stepSize: 1.0,
								max: maxY,
							}
						}],
					},
					tooltips: {
						backgroundColor: '#ffffff',
						displayColors: false,
						titleFontColor: '#000000',
						titleFontStyle: 'normal',
						bodyFontColor: '#000000',
						borderColor: '#333333',
						borderWidth: 1,
					}
				}
			});
		}
	}
};
