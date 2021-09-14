import { Component } from '@angular/core';
import "ol/ol.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import {
  defaults as defaultControls,
  Attribution,
  FullScreen,
  ScaleLine,
  ZoomToExtent
} from "ol/control.js";
import {
  defaults as defaultInteractions,
  DragRotateAndZoom
} from "ol/interaction.js";
import { fromLonLat } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import TileWMS from 'ol/source/TileWMS';
import OSM from "ol/source/OSM.js";
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Vector as VectorLayer } from 'ol/layer';
import { Stroke, Style, Fill, Text } from 'ol/style';
import { ConstantPool } from '@angular/compiler';
import Select from 'ol/interaction/Select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'viewer';
  ngAfterViewInit() {
    var src = '4326';
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        let feat = 'http://200.124.240.62:8088/geoserver/wfs?srsname=EPSG%3A' + src + '&typeName=catastro:predios_tx&outputFormat=application/json'
          + '&version=1.1.0&service=WFS&request=GetFeature&bbox=' + extent.join(',') + ',EPSG%3A' + src;
        return feat;
      },
      strategy: bboxStrategy
    });
    const vector = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2,
        }),
      }),
    });
    var view = new View({
      projection: 'EPSG:' + src,
      center: [-78.1376, 0.3616],
      zoom: 8
    })
    var map = new Map({
      layers: [
        new TileLayer({
          source: new TileWMS({
            url: 'https://ahocevar.com/geoserver/wms',
            params: {
              'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
              'TILED': true,
            },
          }),
        }),
        vector
      ],
      controls: defaultControls({
        attribution: true
      }).extend([
        new Attribution({
          collapsible: false
        }),
        new ZoomToExtent({
          extent: [
            813079.7791264898,
            5929220.284081122,
            848966.9639063801,
            5936863.986909639
          ]
        }),
        new FullScreen(),
        new ScaleLine()
      ]),
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      target: "map",
      view: view,
      listeners: {
        featureover: function(e) {
            e.feature.renderIntent = "select";
            e.feature.layer.drawFeature(e.feature);
            log("Map says: Pointer entered " + e.feature.id + " on " + e.feature.layer.name);
        },
        featureout: function(e) {
            e.feature.renderIntent = "default";
            e.feature.layer.drawFeature(e.feature);
            log("Map says: Pointer left " + e.feature.id + " on " + e.feature.layer.name);
        },
        featureclick: function(e) {
            log("Map says: " + e.feature.id + " clicked on " + e.feature.layer.name);
        }
    }
    });

   

    function log(msg) {
      console.log(msg);
      //result.innerHTML += msg + "<br>";
  }
    const zoomtolausanne = document.getElementById('zoomtolausanne');
    zoomtolausanne.addEventListener(
      'click',
      function () {
        const feature = vectorSource.getFeatures()[0];
        if (feature) {
          const point = feature.getGeometry;
          //view.fit(point, { padding: [170, 50, 30, 150], minResolution: 50 });
        }
      },
      false
    );

    let highlight;
    const displayFeatureInfo = function (pixel) {
      vectorSource.getFeaturestures(pixel).then(function (features) {
        const feature = features.length ? features[0] : undefined;
        const info = document.getElementById('info');
        if (features.length) {
          info.innerHTML = feature.getId() + ': ' + feature.get('name');
        } else {
          info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }
      });
    };
    const highlightStyle = new Style({
      stroke: new Stroke({
        color: '#f00',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.1)',
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: '#000',
        }),
        stroke: new Stroke({
          color: '#f00',
          width: 3,
        }),
      }),
    });

    const featureOverlay = new VectorLayer({
      source: new VectorSource(),
      map: map,
      style: function (feature) {
        highlightStyle.getText().setText(feature.get('name'));
        return highlightStyle;
      },
    });

    /*map.on('click', function (evt) {
      displayFeatureInfo(evt.pixel);
    });*/

    var selectClick = new Select();
    map.addInteraction(selectClick);
    selectClick.on('select', function(e) {
      var selectedFeatures = e.target.getLayers().getArray();
      console.log(e.selected[0].getGeometry().getCoordinates());
      var featureStr = "none";
      if (!!selectedFeatures && selectedFeatures.length > 0) {
        featureStr = selectedFeatures[0].get('name');
      }
      document.getElementById('status').innerHTML = e.target.getFeatures();
  })
/*
    map.on('click', function(e) {
      map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        console.log(feature);
        console.log(layer);
    })
      console.log(e.target);
      console.log(e.map.getLayers());
      var selectedFeatures = e.target.getLayers().getArray();
      var featureStr = "none";
      if (!!selectedFeatures && selectedFeatures.length > 0) {
        featureStr = selectedFeatures[0].get('name');
      }
      console.log(featureStr);
      document.getElementById('status').innerHTML = featureStr;
    });*/

  }


}
