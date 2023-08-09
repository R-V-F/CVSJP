import { Component } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	res:any = 0;
	res2:any = 0;
	current_chart:any;
	live_chart: any;

	two_h:any = 0;
	two_h2:any = 0;
	selected_value:any;

	createLOLOSHO(list_of_rows:any) {
		let list_of_titles:any = [];
		let list_of_list_of_shows:any = [];
		for(let i = 0; i < list_of_rows.length; i++) {
			let title = list_of_rows[i].title;
			if(!list_of_titles.includes(title)) list_of_titles.push(title);
		}
		for(let i = 0; i < list_of_titles.length; i++) {
			list_of_list_of_shows.push([]);
		}
		for(let i = 0; i < list_of_titles.length; i++) {
			let k = 0;
			for(let j = 0; j < list_of_rows.length; j++) {
				if(list_of_rows[j].title == list_of_titles[i]) 
					list_of_list_of_shows[i].push(list_of_rows[j]);
			}
		}
		console.log('behold the loloSHO:')
		console.log(list_of_list_of_shows);
		return list_of_list_of_shows;
	}

	createDatasetListOfObj(y_data_list:any, lolosho:any) {
		let obj_list = [];
		for(let i = 0; i < y_data_list.length; i++) {
			let obj = {
				data: y_data_list[i],
				label: lolosho[i][0].title,
			}
			obj_list.push(obj);
		}
		return obj_list;

	}


	handleSelection(event: any) {
		this.selected_value = event.target.value;
		this.deleteAndRemakeChart(this.selected_value);
	}

	async deleteAndRemakeChart(selected_value: any) {
		if (this.live_chart) this.live_chart.destroy();

		let x_data = this.createXData(selected_value);
		let x_data_formatted = [];
		for(let x of x_data) x_data_formatted.push(x.toTimeString().split(' ')[0]);

		//fetch new data
		this.two_h = await fetch(`http://localhost:3123/custom/${selected_value}`);
		this.two_h2 = await this.two_h.json();
		let lolosho = this.createLOLOSHO(this.two_h2.msg);;

		let y_data_list = this.createYDataList(x_data, lolosho);
		let y_data_set = this.createDatasetListOfObj(y_data_list, lolosho);

		
		this.live_chart = new Chart("LiveData", {
			type: 'line',
			data: {
				labels: x_data_formatted,
				datasets: y_data_set
			},
			options: {
				plugins: {
					legend: {
						display: true,
					}
				}
			}

		});
	}
	  

	fetchNewTimeLimit(timelimimt:any, LiveDataCanvas:any) {
		
	}

	createXData (timelimimt:any) {
		let time_limit_ago:any = Date.now() - (timelimimt * 60 * 1000);
		let now = Date.now();
		let x_data = [];
		x_data.push(new Date(time_limit_ago));
		while(time_limit_ago - now < 0) {
			time_limit_ago += 5 * 60 * 1000;
			let next_x = new Date(time_limit_ago);
			x_data.push(next_x);
		}
		return x_data;
	}

	createYDataList (x_data:any, loloSHO:any) {
		let y_data_list = [];
		for(let h = 0; h < loloSHO.length; h++) {
			let y_data = new Array(x_data.length).fill(null);
			for(let i = 0; i < loloSHO[h].length; i++) {
				let time = new Date(loloSHO[h][i].timestamp)
				for(let j = 0; j < x_data.length; j++) {
					if(Math.abs(time.getTime() - x_data[j].getTime()) < 2.6 * 60 * 1000) {
						y_data[j] = loloSHO[h][i].views;
						break;
					} 
				}
			}
			y_data_list.push(y_data);
		}
		return y_data_list;
	}

	
	async ngOnInit() {
		this.res = await fetch('http://localhost:3123/current');
		this.res2 = await this.res.json();
		let right = 0;
		let left = 0;


		for(var obj of this.res2.msg) {
			if(obj.side == 'd') right += obj.views;
			if(obj.side == 'e') left += obj.views;
		}

		this.two_h = await fetch('http://localhost:3123/two_hours');
		this.two_h2 = await this.two_h.json();
		let lolosho = this.createLOLOSHO(this.two_h2.msg);


		//create xAxis for n minutes
		let x_data = this.createXData(1440);
		let x_data_formatted = [];
		//change this latr
		for(let x of x_data) x_data_formatted.push(x.toTimeString().split(' ')[0])
		//



		//lolosho set into y data -> list of list of data
		let y_data_list = this.createYDataList(x_data, lolosho);
		let y_data_set = this.createDatasetListOfObj(y_data_list, lolosho);


		this.current_chart = new Chart("CurrentData", {
			type: 'bar',
			data: {
				labels: ['Direita','Esquerda'],
				datasets: [{
					label: 'elp',
					// categoryPercentage: 1,
					// barPercentage: 0.95,
					
					backgroundColor: ['rgba(9, 255, 10, 0.2)','rgba(255, 99, 132, 0.2)'],
					borderColor: ['rgb(9, 255, 10)','rgba(255, 99, 132)'],
					borderWidth: 1,
					// borderRadius: 1,
					// barThickness: 50,
					data: [right,left]
				}],

			},
			options: {
				plugins: {
					legend: {
						display: false
					}
				},
				aspectRatio: 1,
				
			}
			
		})
		this.live_chart = new Chart("LiveData", {
			type: 'line',
			data: {
				labels: x_data_formatted,
				datasets: y_data_set
			},
			options: {
				plugins: {
					legend: {
						display: true,
					}
				}
			}

		});


	}

}
