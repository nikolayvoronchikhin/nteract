/* @flow */
/* eslint class-methods-use-this: 0 */
import React from "react";

const cloneDeep = require("lodash.clonedeep");

type Props = {
  data: string | Object
};

declare class PlotlyHTMLElement extends HTMLElement {
  data: Object,
  layout: Object
}

const Plotly = require("plotly.js/dist/plotly");

const MIMETYPE = "application/vnd.plotly.v1+json";

export class PlotlyTransform extends React.Component {
  props: Props;
  getFigure: () => Object;
  el: PlotlyHTMLElement;

  static MIMETYPE = MIMETYPE;

  constructor(): void {
    super();
    this.getFigure = this.getFigure.bind(this);
  }

  componentDidMount(): void {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    Plotly.newPlot(this.el, figure.data, figure.layout);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    const figure = this.getFigure();
    this.el.data = figure.data;
    this.el.layout = figure.layout;
    Plotly.redraw(this.el);
  }

  getFigure(): Object {
    const figure = this.props.data;
    if (typeof figure === "string") {
      return JSON.parse(figure);
    }

    // The Plotly API *mutates* the figure to include a UID, which means
    // they won't take our frozen objects
    if (Object.isFrozen(figure)) {
      return cloneDeep(figure);
    }
    return figure;
  }

  render(): ?React.Element<any> {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return (
      <div
        style={style}
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}

export default PlotlyTransform;
