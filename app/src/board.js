import React from 'react';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.cellSize = 10;
    this.cellMargin = 2;
    this.cellTotal = this.cellSize + this.cellMargin;

    this.drawSquare = this.drawSquare.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate() {
    let drawSquare = this.drawSquare;
    let c = document.getElementById("board-canvas");
    let ctx = c.getContext("2d");
    let canvasWidth = this.props.size.w * (this.cellTotal);
    let canvasHeight = this.props.size.h * (this.cellTotal);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let cells = this.props.activeCells;
    cells.forEach(function(row, rowNum) {
      row.forEach(function(cell, colNum) {
        if (cell > 0) {
          drawSquare(colNum, rowNum, ctx, cell);
        }
      });
    });

  }

  drawSquare(i, j, ctx, cellValue) {
    let positionX = i * (this.cellTotal);
    let positionY = j * (this.cellTotal);
    let cellColor = cellValue === 1 ? "orange" : "red";
    ctx.fillStyle = cellColor;
    ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
  }

  handleClick(e) {
    let i = Math.min(this.props.size.w - 1, Math.floor(e.nativeEvent.offsetX / (this.cellTotal)));
    let j = Math.min(this.props.size.h - 1, Math.floor(e.nativeEvent.offsetY / (this.cellTotal)));
    this.props.handleCellClick({i: i, j: j});
  }

  render() {
    let canvasWidth = this.props.size.w * (this.cellTotal);
    let canvasHeight = this.props.size.h * (this.cellTotal);

    return (
      <canvas id="board-canvas" onClick={this.handleClick} width={canvasWidth} height={canvasHeight} style={{backgroundColor: "grey", padding: "2px"}}></canvas>
    )
  }
}

export default Board;
