import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
} from "ng-apexcharts";
import { Subject } from "rxjs";
import { NgApexchartsModule } from "ng-apexcharts";
import { CommonModule } from "@angular/common";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  labels: string[];
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: "line-chart",
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: "./line-chart.component.html"
})
export class LineChartComponent implements OnInit {
  reloadChart: boolean | undefined;
  @Input() mode: any;
  @Input() sub: any;
  @Input() title: any;
  @Input() text: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() reportData: any;
  showData: boolean = false;
  @Input() notifier: Subject<boolean> | undefined;
  @ViewChild("chartA") chart: ChartComponent | undefined;

  public chartOptions: Partial<ChartOptions> | any;

  constructor() {}

  ngOnInit() {
    this.generateChart();

    if (this.notifier) {
      this.notifier.subscribe((data) => {
        this.reloadChart = data;
        if (this.reloadChart) {
          setTimeout(() => {
            this.generateChart();
          }, 100);
        }
      });
    }
  }

  showDataSection() {
    setTimeout(() => {
      this.showData = true;
    }, 500);
  }

  generateChart() {
    let buttonColor = this.buttonColor;
    let mode = this.mode;
    let sub = this.sub;
    let text = this.text;
    let teamsType = localStorage.getItem("report-type");

    if (this.reportData.type == "donut") {
      this.chartOptions = {
        series: this.reportData.series,
        labels: this.reportData.labels,
        chart: {
          width: 450,
          type: "donut",
          toolbar: {
            show: true,
            tools: {
              download: true,
            },
          },
          events: {
            dataPointMouseEnter: function (event) {
              event.path[0].style.cursor = "pointer";
            },
            dataPointSelection: (event, chartContext, config) => {
              let category = "";
              if (
                config.w.globals.categoryLabels &&
                config.w.globals.categoryLabels[config.dataPointIndex]
              ) {
                category =
                  "-" + config.w.globals.categoryLabels[config.dataPointIndex];
              } else if (
                config.w.globals.labels &&
                config.w.globals.labels[config.dataPointIndex]
              ) {
                category = "-" + config.w.globals.labels[config.dataPointIndex];
              }
              let cat = sub;
              if (teamsType) {
                cat = teamsType;
              }

              if (cat) {
                window.open(
                  "/settings/reports/details/" +
                    mode +
                    "/" +
                    cat +
                    "/" +
                    config.w.globals.labels[config.dataPointIndex],
                  "_blank"
                );
              } else {
                window.open(
                  "/settings/reports/details/" +
                    mode +
                    "/" +
                    sub +
                    "/" +
                    config.w.globals.labels[config.dataPointIndex],
                  "_blank"
                );
              }
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter(value: any, opts: any): any {
            return (
              opts.w.config.series[opts.seriesIndex] +
              " \n(" +
              parseFloat(value).toFixed(1) +
              "%) "
            );
          },
        },
        fill: {
          type: "gradient",
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            return (
              '<div class="arrow_box" style="background-color:' +
              buttonColor +
              ';">' +
              '<div class="arrow_box_header">' +
              w.globals.labels[seriesIndex] +
              "</div>" +
              '<div class="arrow_box_content""><b>' +
              series[seriesIndex] +
              "</b> " +
              text +
              "</div>" +
              "</div>"
            );
          },
        },
        responsive: [
          {
            breakpoint: 375,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      };
    } else {
      this.chartOptions = {
        chart: {
          height: 450,
          type: this.reportData.series[0].type,
          events: {
            dataPointMouseEnter: function (event) {
              event.path[0].style.cursor = "pointer";
            },
            dataPointSelection: (event, chartContext, config) => {
              let category = "";
              if (
                config.w.globals.categoryLabels &&
                config.w.globals.categoryLabels[config.dataPointIndex]
              ) {
                category =
                  "-" + config.w.globals.categoryLabels[config.dataPointIndex];
              } else if (
                config.w.globals.labels &&
                config.w.globals.labels[config.dataPointIndex]
              ) {
                category = "-" + config.w.globals.labels[config.dataPointIndex];
              }
              let cat = sub;
              if (teamsType) {
                cat = teamsType;
              }
              window.open(
                "/settings/reports/details/" +
                  mode +
                  "/" +
                  cat +
                  "/" +
                  config.w.globals.initialSeries[config.seriesIndex]["name"] +
                  category,
                "_blank"
              );
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          width: 5,
          curve: "smooth",
        },
        series: this.reportData.series,
        grid: {
          row: {
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: this.reportData.categories,
        },
        tooltip: {
          intersect: true,
          shared: false,
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            var category_label = "";
            if (
              w.globals.categoryLabels &&
              w.globals.categoryLabels[dataPointIndex]
            ) {
              category_label = " - " + w.globals.categoryLabels[dataPointIndex];
            } else if (w.globals.labels && w.globals.labels[dataPointIndex]) {
              category_label = " - " + w.globals.labels[dataPointIndex];
            }
            return (
              '<div class="arrow_box" style="background-color:' +
              buttonColor +
              ';">' +
              '<div class="arrow_box_header">' +
              w.globals.initialSeries[seriesIndex]["name"] +
              category_label +
              "</div>" +
              '<div class="arrow_box_content""><b>' +
              series[seriesIndex][dataPointIndex] +
              "</b> " +
              text +
              "</div>" +
              "</div>"
            );
          },
        },
        markers: {
          size: 1,
        },
      };
    }
  }
}