import React, { Component } from 'react';
import './App.css';
import './scss/App.scss';


function Button(props) {
  let classes = props.size === "large" ? "btn btn--large" : "btn btn--medium";
  if (props.active) classes += " active";
  return (
    <button className={classes} onClick={props.handleClick}>{props.text}</button>
  )
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.cellSize = 10;
    this.cellMargin = 2;

    this.drawSquare = this.drawSquare.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate() {
    let drawSquare = this.drawSquare;
    let c = document.getElementById("board-canvas");
    let ctx = c.getContext("2d");
    let canvasWidth = this.props.BOARDSIZES[this.props.size].w * (this.cellSize + this.cellMargin);
    let canvasHeight = this.props.BOARDSIZES[this.props.size].h * (this.cellSize + this.cellMargin);
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
    let positionX = i * (this.cellSize + this.cellMargin);
    let positionY = j * (this.cellSize + this.cellMargin);
    let cellColor = cellValue === 1 ? "orange" : "red";
    ctx.fillStyle = cellColor;
    ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
  }

  handleClick(e) {
    let i = Math.floor(e.nativeEvent.offsetX / (this.cellSize + this.cellMargin));
    let j = Math.floor(e.nativeEvent.offsetY / (this.cellSize + this.cellMargin));
    this.props.handleCellClick({i: i, j: j});
  }

  render() {
    let canvasWidth = this.props.BOARDSIZES[this.props.size].w * (this.cellSize + this.cellMargin);
    let canvasHeight = this.props.BOARDSIZES[this.props.size].h * (this.cellSize + this.cellMargin);

    return (
      <canvas id="board-canvas" onClick={this.handleClick} width={canvasWidth} height={canvasHeight} style={{backgroundColor: "grey", padding: "2px"}}></canvas>
    )
  }
}

function Controls(props) {
  let classes = props.size === "large" ? "ctrls ctrls--large" : "ctrls ctrls--medium";
  let handleClick = props.handleClick;

  return (
    <div className={classes}>
      {
        props.labelPosition === "left" &&
        <span className="ctrls__label">
          {props.textLabel}
        </span>
      }

      {
        props.btns.map((btn, index) => {
          return (
            <Button key={index} handleClick={handleClick} text={btn} size={props.size} active={props.activeBtn === btn} />
          );
        })
      }

      {
        props.labelPosition === "right" &&
        <span className="ctrls__label">
          {props.textLabel}
        </span>
      }
    </div>
  )
}

class App extends Component {
  constructor(props) {
    super(props);

    this.BOARDSIZES = {
      Small: {w: 50, h: 30, text: "Small"},
      Medium: {w: 70, h: 50, text: "Medium"},
      Large: {w: 100, h: 80, text: "Large"}
    };

    this.SPEEDS = {
      slow: {time: 800, text: "Slow"},
      medium: {time: 400, text: "Medium"},
      fast: {time: 10, text: "Fast"}
    };

    this.state = {
      speed: this.SPEEDS.slow,
      size: "Medium",
      runInterval: null,
      activeCells: this.generateRandom(),
      generations: 0,
    };

    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeSpeed = this.handleChangeSpeed.bind(this);
    this.generateRandom = this.generateRandom.bind(this);
    this.runLifecycle = this.runLifecycle.bind(this);
    this.calculateCellStatus = this.calculateCellStatus.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
    this.generateClear = this.generateClear.bind(this);

  }

  componentDidMount() {
    this.runLifecycle(this.state.speed);
  }

  componentWillUnmount() {
    clearInterval(this.runInterval);
  }

  runLifecycle(speed) {
    clearInterval(this.runInterval);
    this.runInterval = setInterval(() => {
      let activeCells = this.calculateCellStatus(this.state.activeCells, this.BOARDSIZES[this.state.size].h, this.BOARDSIZES[this.state.size].w);
      let generations = this.state.generations;
      // look to see if there are any active cells
      let activeCellsLeft = activeCells.findIndex(function(element) {
        let inner = element.findIndex((elementInner) => elementInner > 0);
        return inner !== -1;
      });
      // clear timer if no active cells
      if (activeCellsLeft === -1) {
        clearInterval(this.runInterval);
        this.setState({runInterval: null});
      } else {
        generations++;
      }
      this.setState({activeCells: activeCells, generations: generations});
    }, speed.time);
  }

  calculateCellStatus(prevCells, height, width) {
    let nextCells = JSON.parse(JSON.stringify(prevCells));
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {

        let sum = 0;
        for (let y = j - 1; y <= j + 1; y++) {
          for (let x = i - 1; x <= i + 1; x++) {
            if (prevCells[(y + height) % height][(x + width) % width] > 0) {
              sum += 1;
            }
          }
        }
        sum -= prevCells[j][i] === 2 ? 1 : prevCells[j][i];
        if (prevCells[j][i] > 0) {
          // cell is currently alive
          if (sum === 2 || sum === 3) {
            nextCells[j][i] = 2;
          } else {
            nextCells[j][i] = 0;
          }
        } else {
          // cell is currently dead
          if (sum === 3) {
            nextCells[j][i] = 1;
          }
        }

      }
    }
    return nextCells;
  }

  generateClear(size) {
    return Array(this.BOARDSIZES[size].h).fill().map(() => Array(this.BOARDSIZES[size].w).fill(0));
  }

  generateRandom() {
    let activeCells = Array(this.BOARDSIZES.Medium.h).fill().map(() => Array(this.BOARDSIZES.Medium.w).fill(0));
    let numActive = Math.floor(Math.random() * this.BOARDSIZES.Medium.h * this.BOARDSIZES.Medium.w / 2);
    let columns = Array(numActive).fill().map(() => Math.floor(Math.random() * this.BOARDSIZES.Medium.w));
    let rows = Array(numActive).fill().map(() => Math.floor(Math.random() * this.BOARDSIZES.Medium.h));
    for (let i = 0; i < numActive; i++) {
      activeCells[rows[i]][columns[i]] = 1;
    }
    return activeCells;
  }

  handleCellClick(cell) {
    let activeCells = this.state.activeCells;
    if (activeCells[cell.j][cell.i] === 0) {
      activeCells[cell.j][cell.i] = 1;
    } else {
      activeCells[cell.j][cell.i] = 0;
    }
    this.setState({activeCells: activeCells});
  }

  handleChangeSize(size) {
    clearInterval(this.runInterval);//clear running lifecycle
    let gridSize = size.target.innerHTML;

    //update size if different from current size
    if (gridSize !== this.state.size) {
      let height = this.BOARDSIZES[gridSize].h;
      let width = this.BOARDSIZES[gridSize].w;
      let activeCells = Array(height).fill().map(() => Array(width).fill(0));
      this.setState({runInterval: null, size: gridSize, activeCells: activeCells, generations: 0});
    }
  }

  handleChangeSpeed(e) {
    let speed = e.target.innerHTML.toLowerCase();
    if (this.runInterval) {
      this.runLifecycle(this.SPEEDS[speed]);
      this.setState({speed: speed});
    } else {
      this.setState({speed: this.SPEEDS[speed], generations: 0});
    }

  }

  handleChangeStatus(e) {
    let status = e.target.innerHTML.toLowerCase();
    if (status === "run") {
      this.runLifecycle(this.state.speed);
    } else if (status === "pause") {
      clearInterval(this.runInterval);
      this.setState({runInterval: null});
    } else if (status === "clear") {
      clearInterval(this.runInterval);
      let activeCells = this.generateClear(this.state.size);
      this.setState({runInterval: null, activeCells: activeCells, generations: 0});
    }

  }

  render() {
    let generations = "Generations: " + this.state.generations;
    let runStatus = this.runInterval ? "Run" : "Pause";
    return (
      <div className="container">
        <Controls
          btns={["Run", "Pause", "Clear"]}
          activeBtn={runStatus}
          size="medium"
          textLabel={generations}
          labelPosition="right"
          handleClick={this.handleChangeStatus}
        />
        <Board
          size={this.state.size}
          BOARDSIZES={this.BOARDSIZES}
          activeCells={this.state.activeCells}
          handleCellClick={this.handleCellClick}
        />
        <Controls
          btns={["Small", "Medium", "Large"]}
          activeBtn={this.state.size}
          size="large"
          textLabel="Size:"
          labelPosition="left"
          handleClick={this.handleChangeSize}
        />
        <Controls
          btns={["Slow", "Medium", "Fast"]}
          activeBtn={this.state.speed.text}
          size="large"
          textLabel="Speed:"
          labelPosition="left"
          handleClick={this.handleChangeSpeed}
        />
      </div>
    );
  }
}

export default App;
