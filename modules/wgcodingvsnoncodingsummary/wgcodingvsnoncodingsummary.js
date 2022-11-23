var widgetName = 'codingvsnoncodingsummary';
widgetGenerators[widgetName] = {
	'info': {
		'name': 'Coding vs Noncoding',
		'width': 600, 
		'height': 600, 
		'callserver': true,
		'function': function (div, data) {
			if (div != null) {
				emptyElement(div);
			}
            div.style.textAlign = 'center';
			var noCoding = data["no_coding"]
			var noNoncoding = data["no_noncoding"]
			div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);
			var chart = new Chart(chartDiv, {
				type: 'doughnut',
				data: {
					datasets: [{
						data: [
							noCoding,
							noNoncoding
						],
						backgroundColor: [
							'#F4A582',
							'#92C5DE',
							],
					}],
					labels: [
						'Coding', 
						'Non-coding'
					]
				},
				options: {
					responsive: true,
                    responsiveAnimationDuration: 500,
                    maintainAspectRatio: false,
                    legend: {
                        position: 'bottom',
                    },
				}
			});
		}
	}
};
