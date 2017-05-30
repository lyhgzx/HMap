import { ol } from '../constants'
import mix from '../utils/mixin'
import Style from '../style/Style'

class Layer extends mix(Style) {
  constructor (map) {
    super()
    this.map = map || null
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过layerName获取图层
   * @param layerName
   * @returns {*}
   */
  getLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过layerName获取专题图层
   * @param layerName
   * @returns {*}
   */
  getTitleLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerType') === 'title' && layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 根据图层名获取底图
   * @param layerName
   * @returns {*}
   */
  getBaseLayerByLayerName (layerName) {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof ol.layer.Group && layer.get('isBaseLayer')) {
          layer.getLayers().getArray().forEach(_layer => {
            if (_layer && _layer instanceof ol.layer.Tile && _layer.get('isBaseLayer') && _layer.get('layerName') === layerName) {
              currentLayer = _layer
            }
          })
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取底图图层组
   * @returns {*}
   */
  getBaseLayers () {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof ol.layer.Group && layer.get('isBaseLayer')) {
          currentLayer = layer
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 通过要素获取图层
   * @param feature
   * @returns {*}
   */
  getLayerByFeatuer (feature) {
    let tragetLayer = null
    if (this.map) {
      if (feature instanceof ol.Feature) {
        let layers = this.map.getLayers().getArray()
        layers.forEach(layer => {
          let source = layer.getSource()
          if (source.getFeatures) {
            let features = source.getFeatures()
            features.forEach(feat => {
              if (feat === feature) {
                tragetLayer = layer
              }
            })
          }
        })
      } else {
        throw new Error('传入的不是要素!')
      }
    }
    return tragetLayer
  }

  /**
   * 创建WFS图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatWfsVectorLayer (layerName, params) {
    try {
      let vectorLayer = this.getLayerByLayerName(layerName)
      if (!(vectorLayer instanceof ol.layer.Vector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        let proj = params['projection'] ? params['projection'] : 'EPSG:3857'
        let style = this.getStyleByParams(params['style'])
        vectorLayer = new ol.layer.Vector({
          layerName: layerName,
          params: params,
          layerType: 'vector',
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function (extent) {
              return params['layerUrl'] + extent.join(',') + ',' + proj
            },
            strategy: ol.loadingstrategy.bbox
          }),
          style: style
        })
      }
      if (this.map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = this.getLayerByLayerName(layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
          this.map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建临时图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatVectorLayer (layerName, params) {
    try {
      if (this.map) {
        let vectorLayer = this.getLayerByLayerName(layerName)
        if (!(vectorLayer instanceof ol.layer.Vector)) {
          vectorLayer = null
        }
        if (!vectorLayer) {
          if (params && params.create) {
            vectorLayer = new ol.layer.Vector({
              layerName: layerName,
              params: params,
              layerType: 'vector',
              source: new ol.source.Vector({
                wrapX: false
              }),
              style: new ol.style.Style({
                fill: new ol.style.Fill({
                  color: 'rgba(67, 110, 238, 0.4)'
                }),
                stroke: new ol.style.Stroke({
                  color: '#4781d9',
                  width: 2
                }),
                image: new ol.style.Circle({
                  radius: 7,
                  fill: new ol.style.Fill({
                    color: '#ffcc33'
                  })
                })
              })
            })
          }
        }
        if (this.map && vectorLayer) {
          if (params && params.hasOwnProperty('selectable')) {
            vectorLayer.set('selectable', params.selectable)
          }
          // 图层只添加一次
          let _vectorLayer = this.getLayerByLayerName(layerName)
          if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
            this.map.addLayer(vectorLayer)
          }
        }
        return vectorLayer
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建热力图图层
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatHeatMapLayer (layerName, params) {
    try {
      let currentLayer = ''
      if (this.map) {
        currentLayer = this.getLayerByLayerName(layerName)
        if (!(currentLayer instanceof ol.layer.Heatmap)) {
          currentLayer = ''
        }
        if (!currentLayer && params && params['create']) {
          currentLayer = new ol.layer.Heatmap({
            layerName: layerName,
            gradient: (params['gradient'] ? params['gradient'] : ['#00f', '#0ff', '#0f0', '#ff0', '#f00']),
            source: new ol.source.Vector({
              wrapX: false
            }),
            blur: (params['blur'] ? params['blur'] : 15),
            radius: (params['radius'] ? params['radius'] : 8),
            shadow: (params['shadow'] ? params['shadow'] : 250),
            weight: (params['weight'] ? params['weight'] : 'weight'),
            extent: (params['extent'] ? params['extent'] : undefined),
            minResolution: (params['minResolution'] ? params['minResolution'] : undefined),
            maxResolution: (params['maxResolution'] ? params['maxResolution'] : undefined),
            opacity: (params['opacity'] ? params['opacity'] : 1),
            visible: ((params['visible'] === false) ? params['visible'] : true)
          })
          if (params && params.hasOwnProperty('selectable')) {
            currentLayer.set('selectable', params.selectable)
          }
          this.map.addLayer(currentLayer)
        }
        return currentLayer
      } else {
        throw new Error('未创建地图对象！')
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 创建专题图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatTitleLayer (layerName, params) {
    let titleLayer = null
    if (this.map) {
      let serviceUrl = params['serviceUrl']
      if (!serviceUrl) return null
      let ooLayer = this.getTitleLayerByLayerName(layerName)
      if (ooLayer && ooLayer instanceof ol.layer.Tile) {
        this.map.removeLayer(ooLayer)
      }
      titleLayer = new ol.layer.Tile({
        layerName: layerName,
        layerType: 'title',
        source: new ol.source.TileArcGISRest({
          url: serviceUrl,
          params: params,
          wrapX: false
        }),
        wrapX: false
      })
      this.map.addLayer(titleLayer)
    }
    return titleLayer
  }

  /**
   * 创建ImageWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatImageWMSLayer (layerName, params) {
    let proj = this.projection.getCode()
    let layer = ''
    if (this.map) {
      layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Image)) {
        layer = ''
      } else {
        this.map.removeLayer(layer)
        layer = ''
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new ol.layer.Image({
          layerName: layerName,
          visible: (params['visible'] === true) ? params['visible'] : false,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new ol.source.ImageWMS({
            url: params['layerUrl'],
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: !proj ? 'EPSG:4326' : proj,
              CRS: !proj ? 'EPSG:4326' : proj,
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: (params['tiled'] === false) ? params['tiled'] : true,
              TILESORIGIN: params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined,
              SERVICE: 'WMS',
              FORMAT: params['format'] ? params['format'] : 'image/png'
            },
            wrapX: false
          })
        })
        this.map.addLayer(layer)
      }
    }
    return layer
  }

  /**
   * 创建TileWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatTileWMSLayer (layerName, params) {
    let proj = this.projection.getCode()
    let layer = ''
    if (this.map) {
      layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Image)) {
        layer = ''
      } else {
        this.map.removeLayer(layer)
        layer = ''
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new ol.layer.TileWMS({
          layerName: layerName,
          visible: (params['visible'] === true) ? params['visible'] : false,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new ol.source.ImageWMS({
            url: params['layerUrl'],
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: !proj ? 'EPSG:4326' : proj,
              CRS: !proj ? 'EPSG:4326' : proj,
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: (params['tiled'] === false) ? params['tiled'] : true,
              TILESORIGIN: params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined,
              SERVICE: 'WMS',
              FORMAT: params['format'] ? params['format'] : 'image/png'
            },
            wrapX: false
          })
        })
        this.map.addLayer(layer)
      }
    }
    return layer
  }

  /**
   * 移除图层
   * @param layerName
   */
  removeLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getLayerByLayerName(layerName)
      if (layer && layer instanceof ol.layer.Vector && layer.getSource() && layer.getSource().clear) {
        layer.getSource().clear()
      }
    }
  }

  /**
   * 通过layerName移除专题图层
   * @param layerName
   */
  removeTileLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getTitleLayerByLayerName(layerName)
      if (layer && layer instanceof ol.layer.Tile) {
        this.map.removeLayer(layer)
      }
    }
  }

  /**
   * 移除所有图层（除底图）
   */
  removeAllLayer () {
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      layers.forEach(layer => {
        if (!layer.get('isBaseLayer')) {
          this.map.removeLayer(layer)
        }
      })
    }
  }
}

export default Layer
