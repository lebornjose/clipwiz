import VideoContext from '../videocontext'

const InitVisualisations = (videoCtx, graphCanvasID, visualisationCanvasID) => {
  /****************************
        * GUI setup
        *****************************/
  /*
        * Create an interactive visualisation canvas.
        */
  const visualisationCanvas = document.getElementById(visualisationCanvasID)
  RefreshGraph(videoCtx, graphCanvasID)

  // visualisationCanvas.height = 20;
  // visualisationCanvas.width = 390;
  // Setup up a render function so we can update the playhead position.
  function render() {
    // VideoCompositor.renderPlaylist(playlist, visualisationCanvas, videoCompositor.currentTime);
    VideoContext.visualiseVideoContextTimeline(videoCtx, visualisationCanvas, videoCtx.currentTime)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
  // catch mouse events to we can scrub through the timeline.
  visualisationCanvas.addEventListener('mousedown', (evt) => {
    let x
    if (evt.x !== undefined) {
      x = evt.x - visualisationCanvas.offsetLeft
    } else {
      // Fix for firefox
      x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
    }
    const secondsPerPixel = videoCtx.duration / visualisationCanvas.width
    // eslint-disable-next-line max-statements-per-line
    if (secondsPerPixel * x !== Infinity) { videoCtx.currentTime = secondsPerPixel * x }
  }, false)
}

function RefreshGraph(videoCtx, graphCanvasID) {
  const graphCanvas = document.getElementById(graphCanvasID)
  VideoContext.visualiseVideoContextGraph(videoCtx, graphCanvas)
}

export { InitVisualisations, RefreshGraph }
